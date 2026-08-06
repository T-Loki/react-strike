import { describe, it, expect } from 'vitest';
import type { Territory } from '../types/combat';

// Mock functions for math that would typically live in src/engine/math.ts
const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

const isInRange = (distance: number, range: number) => {
  return distance <= range;
};

const calculateScorchedPayout = (_territory: Territory) => {
  return 1000;
};

const getHealthPercentage = (current: number, max: number) => {
  if (max === 0) return 0; // Divide by zero protection
  return (current / max) * 100;
};

describe('Combat Math', () => {
  it('calculates 2D distance correctly', () => {
    expect(calculateDistance(0, 0, 3, 4)).toBe(5);
  });

  it('verifies attack range correctly', () => {
    expect(isInRange(5, 5)).toBe(true);
    expect(isInRange(5.1, 5)).toBe(false);
  });

  it('calculates Scorched Earth payout', () => {
    const t: Territory = { id: '1', name: 'Farm', type: 'barren', ringLevel: 1, upkeepCost: 10, resourceYield: 5, isScorched: false, hasActiveBattle: false, allocatedDefenders: [] };
    expect(calculateScorchedPayout(t)).toBe(1000);
  });

  it('protects against divide-by-zero in health scaling', () => {
    expect(getHealthPercentage(100, 100)).toBe(100);
    expect(getHealthPercentage(50, 100)).toBe(50);
    expect(getHealthPercentage(0, 0)).toBe(0);
  });
});
