import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CampaignProvider, useCampaign } from '../context/CampaignContext';
import React from 'react';
import { INITIAL_TERRITORIES } from '../data/territories';

describe('CampaignContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <CampaignProvider>{children}</CampaignProvider>
  );

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useCampaign(), { wrapper });
    expect(result.current.gold).toBe(500);
    expect(result.current.faith).toBe(100);
    expect(result.current.doomClock).toBe(12);
    expect(result.current.territories.length).toBe(INITIAL_TERRITORIES.length);
    expect(result.current.globalUnitPool.length).toBe(13); // 6 spearman, 6 crossbow, 1 hero
  });

  it('scorching a territory adds 1000 gold and marks it as scorched', () => {
    const { result } = renderHook(() => useCampaign(), { wrapper });
    
    act(() => {
      const targetId = result.current.territories.find(t => !t.isScorched)?.id;
      if (targetId) {
        result.current.scorchTerritory(targetId);
      }
    });

    expect(result.current.gold).toBe(1500); // 500 + 1000
    const scorched = result.current.territories.filter(t => t.isScorched);
    expect(scorched.length).toBeGreaterThan(0);
    expect(scorched[0].hasActiveBattle).toBe(false);
  });

  it('allocates and deallocates units correctly', () => {
    const { result } = renderHook(() => useCampaign(), { wrapper });
    const initialPoolSize = result.current.globalUnitPool.length;
    const unitToAllocate = result.current.globalUnitPool[0];
    const territoryToDefend = result.current.territories[0];

    act(() => {
      result.current.allocateUnitToTerritory(territoryToDefend.id, unitToAllocate.id);
    });

    expect(result.current.globalUnitPool.length).toBe(initialPoolSize - 1);
    
    const updatedTerritory = result.current.territories.find(t => t.id === territoryToDefend.id);
    expect(updatedTerritory?.allocatedDefenders.some(u => u.id === unitToAllocate.id)).toBe(true);

    act(() => {
      result.current.deallocateUnitFromTerritory(territoryToDefend.id, unitToAllocate.id);
    });

    expect(result.current.globalUnitPool.length).toBe(initialPoolSize);
    const finalTerritory = result.current.territories.find(t => t.id === territoryToDefend.id);
    expect(finalTerritory?.allocatedDefenders.some(u => u.id === unitToAllocate.id)).toBe(false);
  });

  it('updateFrontlines logic shifts hasActiveBattle inward', () => {
    const { result } = renderHook(() => useCampaign(), { wrapper });
    
    const maxRing = Math.max(...result.current.territories.map(t => t.ringLevel));
    const maxRingTerritories = result.current.territories.filter(t => t.ringLevel === maxRing);
    
    act(() => {
      maxRingTerritories.forEach(t => result.current.scorchTerritory(t.id));
    });
    
    act(() => {
      result.current.updateFrontlines();
    });

    const newMaxRing = Math.max(...result.current.territories.filter(t => !t.isScorched).map(t => t.ringLevel));
    expect(newMaxRing).toBeLessThan(maxRing);

    const newActiveTerritories = result.current.territories.filter(t => t.hasActiveBattle);
    expect(newActiveTerritories.length).toBeGreaterThan(0);
    newActiveTerritories.forEach(t => {
      expect(t.ringLevel).toBe(newMaxRing);
    });
  });

  it('upgrades a building and deducts gold correctly', () => {
    const { result } = renderHook(() => useCampaign(), { wrapper });
    const targetTerritory = result.current.territories[0];
    const building = targetTerritory.buildings[0];
    const initialGold = result.current.gold;
    const initialLevel = building.level;

    act(() => {
      result.current.upgradeBuilding(targetTerritory.id, building.id);
    });

    expect(result.current.gold).toBe(initialGold - building.upgradeCost);
    const updatedTerritory = result.current.territories.find(t => t.id === targetTerritory.id);
    const updatedBuilding = updatedTerritory?.buildings.find(b => b.id === building.id);
    expect(updatedBuilding?.level).toBe(initialLevel + 1);
  });

  it('recruits new units via buyUnit', () => {
    const { result } = renderHook(() => useCampaign(), { wrapper });
    const initialPoolLength = result.current.globalUnitPool.length;
    const initialGold = result.current.gold;
    const unitToBuy = 'unit_vanguard_spearman'; // cost 50

    act(() => {
      result.current.buyUnit(unitToBuy);
    });

    expect(result.current.gold).toBe(initialGold - 50);
    expect(result.current.globalUnitPool.length).toBe(initialPoolLength + 1);
  });

  it('transfers multiple units via transferUnits', () => {
    const { result } = renderHook(() => useCampaign(), { wrapper });
    const initialPool = result.current.globalUnitPool;
    const targetTerritory = result.current.territories[0];
    const unitIdsToMove = [initialPool[0].id, initialPool[1].id];

    act(() => {
      result.current.transferUnits('reserve', targetTerritory.id, unitIdsToMove);
    });

    expect(result.current.globalUnitPool.length).toBe(initialPool.length - 2);
    const updatedTerritory = result.current.territories.find(t => t.id === targetTerritory.id);
    const initialCount = targetTerritory.allocatedDefenders.length;
    expect(updatedTerritory?.allocatedDefenders.length).toBe(initialCount + 2);
  });

  it('buys shop items via buyShopItem', () => {
    const { result } = renderHook(() => useCampaign(), { wrapper });
    const initialFaith = result.current.faith;
    const initialDoom = result.current.doomClock;

    act(() => {
      result.current.buyShopItem('dec_divine_intervention'); // costs 50 faith, reduces doom clock by 2
    });

    expect(result.current.faith).toBe(initialFaith - 50);
    expect(result.current.doomClock).toBe(initialDoom - 2);
  });

  it('bounds the Doom Clock to zero and prevents negative values', () => {
    const { result } = renderHook(() => useCampaign(), { wrapper });

    act(() => {
      // Force doom clock down below zero
      result.current.setDoomClock(1);
      result.current.buyShopItem('dec_divine_intervention'); // reduces by 2
    });

    expect(result.current.doomClock).toBe(0); // Should be bounded at 0
  });

  it('safely handles empty territory lookups and cascades correctly', () => {
    const { result } = renderHook(() => useCampaign(), { wrapper });
    
    act(() => {
      // Scorch every single territory
      result.current.territories.forEach(t => result.current.scorchTerritory(t.id));
    });

    act(() => {
      result.current.updateFrontlines();
    });

    // Should not crash, and all should remain scorched
    expect(result.current.territories.every(t => t.isScorched)).toBe(true);
  });
});
