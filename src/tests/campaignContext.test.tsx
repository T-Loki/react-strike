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
});
