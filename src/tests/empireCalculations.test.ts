import { describe, it, expect } from 'vitest';
import type { Territory, UnitTemplate } from '../types/combat';
import {
  getActiveTerritories,
  getScorchedTerritories,
  getFrontlineTerritories,
  calculateTotalGoldYield,
  calculateTotalFaithYield,
  calculateTotalAssignedUnits,
  calculateTotalBuildings,
  groupUnitsIntoStackMap,
  groupAssignedDefendersIntoStacks,
  getTerritoryPosition
} from '../core/math/empireCalculations';

const mockUnit: UnitTemplate = {
  id: 'u1', name: 'Spearman', type: 'common', hp: 100, maxHp: 100, damage: 10, range: 10, attackSpeed: 1, cost: 10, abilities: []
};
const mockUnit2: UnitTemplate = { ...mockUnit, id: 'u2' };

const territories: Territory[] = [
  { id: 't1', name: 'Safe', isScorched: false, hasActiveBattle: false, resourceYield: 100, ringLevel: 1, allocatedDefenders: [mockUnit] },
  { id: 't2', name: 'Front', isScorched: false, hasActiveBattle: true, resourceYield: 50, faithYield: 20, ringLevel: 2, allocatedDefenders: [mockUnit, mockUnit2], buildings: ['Wall'] },
  { id: 't3', name: 'Dead', isScorched: true, hasActiveBattle: true, resourceYield: 500, faithYield: 100, ringLevel: 3, allocatedDefenders: [] }
];

describe('Empire Calculations', () => {
  it('filters active territories', () => {
    expect(getActiveTerritories(territories)).toHaveLength(2);
  });

  it('filters scorched territories', () => {
    expect(getScorchedTerritories(territories)).toHaveLength(1);
    expect(getScorchedTerritories(territories)[0].id).toBe('t3');
  });

  it('filters frontline territories (active battle and not scorched)', () => {
    const frontlines = getFrontlineTerritories(territories);
    expect(frontlines).toHaveLength(1);
    expect(frontlines[0].id).toBe('t2');
  });

  it('calculates total gold yield ignoring scorched', () => {
    expect(calculateTotalGoldYield(territories)).toBe(150);
  });

  it('calculates total faith yield using fallback of 10 if undefined', () => {
    expect(calculateTotalFaithYield(territories)).toBe(30); // 10 (t1 fallback) + 20 (t2)
  });

  it('calculates total assigned units', () => {
    expect(calculateTotalAssignedUnits(territories)).toBe(3); // 1 + 2 + 0
  });

  it('calculates total buildings', () => {
    expect(calculateTotalBuildings(territories)).toBe(1); // 0 + 1 + 0
  });

  it('groups units into stack map', () => {
    const map = groupUnitsIntoStackMap([mockUnit, mockUnit2, { ...mockUnit, name: 'Archer' }]);
    expect(map['Spearman']).toHaveLength(2);
    expect(map['Archer']).toHaveLength(1);
  });

  it('groups assigned defenders into stacks', () => {
    const stacks = groupAssignedDefendersIntoStacks([mockUnit, mockUnit2, { ...mockUnit, name: 'Archer' }]);
    expect(stacks).toHaveLength(2);
    const spearStack = stacks.find(s => s.name === 'Spearman');
    expect(spearStack?.units).toHaveLength(2);
    expect(spearStack?.hp).toBe(100);
  });

  it('calculates territory position', () => {
    // Citadel
    expect(getTerritoryPosition({ ringLevel: 0 } as Territory, [])).toEqual({ x: 400, y: 300 });

    // Ring 1
    const pos = getTerritoryPosition({ id: '1', ringLevel: 1 } as Territory, [{ id: '1', ringLevel: 1 } as Territory]);
    // -90 deg -> cos(0) = 0, sin(-90) = -1. Radius = 110. x = 400 + 0, y = 300 - 110
    expect(pos.x).toBeCloseTo(400);
    expect(pos.y).toBeCloseTo(190);
  });
});
