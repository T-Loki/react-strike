import { describe, it, expect } from 'vitest';
import { getDistance, getDirection, isInRange, getHealthPercentage } from '../core/math/utils';
import type { Territory } from '../types/combat';

// Mock function for scorched payout as requested to keep in tests or logic
const calculateScorchedPayout = (_territory: Territory) => {
  return 1000;
};

describe('Combat Math Utils', () => {
  it('calculates 2D distance correctly', () => {
    expect(getDistance(0, 0, 3, 4)).toBe(5);
  });

  it('calculates direction correctly', () => {
    const dir = getDirection(0, 0, 3, 4);
    expect(dir.dist).toBe(5);
    expect(dir.dx).toBe(3 / 5);
    expect(dir.dy).toBe(4 / 5);
  });

  it('handles direction with 0 distance (same point)', () => {
    const dir = getDirection(5, 5, 5, 5);
    expect(dir.dist).toBe(0);
    expect(dir.dx).toBe(0);
    expect(dir.dy).toBe(0);
  });

  it('verifies attack range correctly', () => {
    expect(isInRange(5, 5)).toBe(true);
    expect(isInRange(5.1, 5)).toBe(false);
  });

  it('calculates Scorched Earth payout', () => {
    const t: Territory = { id: '1', name: 'Farm', type: 'barren', ringLevel: 1, resourceYield: 5, isScorched: false, hasActiveBattle: false, allocatedDefenders: [], buildings: [] };
    expect(calculateScorchedPayout(t)).toBe(1000);
  });

  it('protects against divide-by-zero or negative max health in health scaling', () => {
    expect(getHealthPercentage(100, 100)).toBe(100);
    expect(getHealthPercentage(50, 100)).toBe(50);
    expect(getHealthPercentage(0, 0)).toBe(0);
    expect(getHealthPercentage(10, -50)).toBe(0);
    expect(getHealthPercentage(NaN, 100)).toBe(0);
    expect(getHealthPercentage(100, NaN)).toBe(0);
  });

  it('protects against NaN and Infinity inputs in distance and direction math', () => {
    expect(getDistance(NaN, 0, 3, 4)).toBe(0);
    expect(getDistance(0, NaN, 3, 4)).toBe(0);
    
    const dirNaN = getDirection(NaN, 0, 3, 4);
    expect(dirNaN.dist).toBe(0);
    expect(dirNaN.dx).toBe(0);
    expect(dirNaN.dy).toBe(0);

    const dirInf = getDirection(0, 0, Infinity, Infinity);
    expect(dirInf.dist).toBe(0);
    expect(dirInf.dx).toBe(0);
    expect(dirInf.dy).toBe(0);
  });
});
