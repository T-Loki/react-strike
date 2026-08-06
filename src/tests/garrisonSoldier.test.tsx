import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { CampaignProvider, useCampaign } from '../context/CampaignContext';

describe('Garrison Soldier behavior', () => {
  it('initializes all territories with 3 Garrison Soldier units', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignProvider>{children}</CampaignProvider>
    );
    const { result } = renderHook(() => useCampaign(), { wrapper });

    result.current.territories.forEach(territory => {
      const garrisonSoldiers = territory.allocatedDefenders.filter(u => u.name === 'Garrison Soldier');
      expect(garrisonSoldiers.length).toBe(3);
    });
  });

  it('prevents deallocating Garrison Soldiers from territories', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignProvider>{children}</CampaignProvider>
    );
    const { result } = renderHook(() => useCampaign(), { wrapper });

    const targetTerritory = result.current.territories[0];
    const garrisonUnit = targetTerritory.allocatedDefenders.find(u => u.name === 'Garrison Soldier')!;

    const initialDefenderCount = targetTerritory.allocatedDefenders.length;
    const initialPoolCount = result.current.globalUnitPool.length;

    act(() => {
      result.current.deallocateUnitFromTerritory(targetTerritory.id, garrisonUnit.id);
    });

    const updatedTerritory = result.current.territories.find(t => t.id === targetTerritory.id);
    expect(updatedTerritory?.allocatedDefenders.length).toBe(initialDefenderCount);
    expect(result.current.globalUnitPool.length).toBe(initialPoolCount);
  });

  it('prevents transferring Garrison Soldiers between territories', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignProvider>{children}</CampaignProvider>
    );
    const { result } = renderHook(() => useCampaign(), { wrapper });

    const sourceTerritory = result.current.territories[0];
    const destTerritory = result.current.territories[1];
    const garrisonUnit = sourceTerritory.allocatedDefenders.find(u => u.name === 'Garrison Soldier')!;

    const sourceInitialCount = sourceTerritory.allocatedDefenders.length;
    const destInitialCount = destTerritory.allocatedDefenders.length;

    act(() => {
      result.current.transferUnits(sourceTerritory.id, destTerritory.id, [garrisonUnit.id]);
    });

    const updatedSource = result.current.territories.find(t => t.id === sourceTerritory.id);
    const updatedDest = result.current.territories.find(t => t.id === destTerritory.id);

    expect(updatedSource?.allocatedDefenders.length).toBe(sourceInitialCount);
    expect(updatedDest?.allocatedDefenders.length).toBe(destInitialCount);
  });
});
