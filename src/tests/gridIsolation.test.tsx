import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { CampaignProvider, useCampaign } from '../context/CampaignContext';

import { FACTIONS } from '../data/units';

describe('Location-Unique Deployment Grid Isolation', () => {
  it('isolates sandbox grid position updates from city territory grids', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignProvider>{children}</CampaignProvider>
    );
    const { result } = renderHook(() => useCampaign(), { wrapper });

    const cityTerritory = result.current.territories[0];
    const initialCityDefendersCount = cityTerritory.allocatedDefenders.length;

    // Place a unit on Sandbox grid
    act(() => {
      result.current.updateUnitGridPosition('sandbox', 'sandbox_unit_1', { x: 2, y: 3 }, FACTIONS.pantheon.roster[0]);
    });

    // Sandbox grid should contain the unit
    expect(result.current.sandboxDefenders.some(u => u.id === 'sandbox_unit_1')).toBe(true);

    // City territory defenders should remain untouched
    const updatedCityTerritory = result.current.territories.find(t => t.id === cityTerritory.id);
    expect(updatedCityTerritory?.allocatedDefenders.length).toBe(initialCityDefendersCount);
    expect(updatedCityTerritory?.allocatedDefenders.some(u => u.id === 'sandbox_unit_1')).toBe(false);
  });

  it('maintains independent grid positions for each city territory', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignProvider>{children}</CampaignProvider>
    );
    const { result } = renderHook(() => useCampaign(), { wrapper });

    const city1 = result.current.territories[0];
    const city2 = result.current.territories[1];

    const unitInCity1 = city1.allocatedDefenders[0];

    // Place unit in City 1 grid
    act(() => {
      result.current.updateUnitGridPosition(city1.id, unitInCity1.id, { x: 1, y: 1 });
    });

    // Unit in City 1 has gridPosition (1,1)
    const updatedCity1 = result.current.territories.find(t => t.id === city1.id);
    expect(updatedCity1?.allocatedDefenders.find(u => u.id === unitInCity1.id)?.gridPosition).toEqual({ x: 1, y: 1 });

    // City 2 defenders are unmodified
    const updatedCity2 = result.current.territories.find(t => t.id === city2.id);
    expect(updatedCity2?.allocatedDefenders.some(u => u.id === unitInCity1.id)).toBe(false);
  });
});
