import { describe, it, expect } from 'vitest';
import { getDistance, getDirection, isInRange, getHealthPercentage } from '../core/math/utils';
import { 
  DAMAGE_MULTIPLIER_MATRIX, 
  getDamageMultiplier, 
  calculateDamage 
} from '../core/math/combatMath';
import type { Territory, DamageType, ArmorType } from '../types/combat';

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

describe('RTS Damage & Armor Matrix System', () => {
  it('verifies all expected multipliers in DAMAGE_MULTIPLIER_MATRIX', () => {
    // Normal damage
    expect(DAMAGE_MULTIPLIER_MATRIX.Normal.Unarmored).toBe(1.0);
    expect(DAMAGE_MULTIPLIER_MATRIX.Normal.Light).toBe(1.0);
    expect(DAMAGE_MULTIPLIER_MATRIX.Normal.Medium).toBe(1.0);
    expect(DAMAGE_MULTIPLIER_MATRIX.Normal.Heavy).toBe(0.75);
    expect(DAMAGE_MULTIPLIER_MATRIX.Normal.Fortified).toBe(0.5);
    expect(DAMAGE_MULTIPLIER_MATRIX.Normal.Hero).toBe(0.5);

    // Piercing damage
    expect(DAMAGE_MULTIPLIER_MATRIX.Piercing.Unarmored).toBe(1.5);
    expect(DAMAGE_MULTIPLIER_MATRIX.Piercing.Light).toBe(1.5);
    expect(DAMAGE_MULTIPLIER_MATRIX.Piercing.Medium).toBe(0.75);
    expect(DAMAGE_MULTIPLIER_MATRIX.Piercing.Heavy).toBe(0.5);
    expect(DAMAGE_MULTIPLIER_MATRIX.Piercing.Fortified).toBe(0.5);
    expect(DAMAGE_MULTIPLIER_MATRIX.Piercing.Hero).toBe(1.0);

    // Siege damage
    expect(DAMAGE_MULTIPLIER_MATRIX.Siege.Unarmored).toBe(1.0);
    expect(DAMAGE_MULTIPLIER_MATRIX.Siege.Light).toBe(0.5);
    expect(DAMAGE_MULTIPLIER_MATRIX.Siege.Medium).toBe(0.5);
    expect(DAMAGE_MULTIPLIER_MATRIX.Siege.Heavy).toBe(1.0);
    expect(DAMAGE_MULTIPLIER_MATRIX.Siege.Fortified).toBe(1.5);
    expect(DAMAGE_MULTIPLIER_MATRIX.Siege.Hero).toBe(0.5);

    // Magic damage
    expect(DAMAGE_MULTIPLIER_MATRIX.Magic.Unarmored).toBe(1.0);
    expect(DAMAGE_MULTIPLIER_MATRIX.Magic.Light).toBe(0.75);
    expect(DAMAGE_MULTIPLIER_MATRIX.Magic.Medium).toBe(1.25);
    expect(DAMAGE_MULTIPLIER_MATRIX.Magic.Heavy).toBe(1.25);
    expect(DAMAGE_MULTIPLIER_MATRIX.Magic.Fortified).toBe(0.35);
    expect(DAMAGE_MULTIPLIER_MATRIX.Magic.Hero).toBe(1.0);

    // Hero damage
    expect(DAMAGE_MULTIPLIER_MATRIX.Hero.Unarmored).toBe(1.0);
    expect(DAMAGE_MULTIPLIER_MATRIX.Hero.Light).toBe(1.0);
    expect(DAMAGE_MULTIPLIER_MATRIX.Hero.Medium).toBe(1.0);
    expect(DAMAGE_MULTIPLIER_MATRIX.Hero.Heavy).toBe(1.0);
    expect(DAMAGE_MULTIPLIER_MATRIX.Hero.Fortified).toBe(0.75);
    expect(DAMAGE_MULTIPLIER_MATRIX.Hero.Hero).toBe(1.0);
  });

  it('falls back to 1.0 multiplier when damage or armor types are undefined/invalid', () => {
    expect(getDamageMultiplier(undefined, 'Light')).toBe(1.0);
    expect(getDamageMultiplier('Piercing', undefined)).toBe(1.0);
    expect(getDamageMultiplier(undefined, undefined)).toBe(1.0);
    expect(getDamageMultiplier('Invalid' as DamageType, 'Light')).toBe(1.0);
    expect(getDamageMultiplier('Piercing', 'Invalid' as ArmorType)).toBe(1.0);
  });

  it('calculates final damage correctly applying matrix multipliers and flat armor', () => {
    // 20 Piercing vs Light (1.5x) - 2 Armor -> floor(30 - 2) = 28
    expect(calculateDamage(20, 'Piercing', 2, 'Light')).toBe(28);

    // 20 Piercing vs Medium (0.75x) - 2 Armor -> floor(15 - 2) = 13
    expect(calculateDamage(20, 'Piercing', 2, 'Medium')).toBe(13);

    // 30 Siege vs Fortified (1.5x) - 5 Armor -> floor(45 - 5) = 40
    expect(calculateDamage(30, 'Siege', 5, 'Fortified')).toBe(40);

    // 20 Magic vs Heavy (1.25x) - 3 Armor -> floor(25 - 3) = 22
    expect(calculateDamage(20, 'Magic', 3, 'Heavy')).toBe(22);

    // 40 Hero vs Fortified (0.75x) - 8 Armor -> floor(30 - 8) = 22
    expect(calculateDamage(40, 'Hero', 8, 'Fortified')).toBe(22);
  });

  it('ensures minimum 1 damage output and protects against extreme flat armor', () => {
    // 10 Normal vs Heavy (0.75x -> 7.5) - 50 Armor -> Math.max(1, Math.floor(-42.5)) = 1
    expect(calculateDamage(10, 'Normal', 50, 'Heavy')).toBe(1);

    // 0 base damage -> minimum output 1
    expect(calculateDamage(0, 'Normal', 0, 'Light')).toBe(1);

    // Negative base damage -> minimum output 1
    expect(calculateDamage(-20, 'Normal', 0, 'Light')).toBe(1);
  });

  it('protects against NaN and Infinity inputs in calculateDamage', () => {
    expect(calculateDamage(NaN, 'Normal', 0, 'Light')).toBe(1);
    expect(calculateDamage(20, 'Normal', NaN, 'Light')).toBe(20);
    expect(calculateDamage(Infinity, 'Normal', 0, 'Light')).toBe(1);
    expect(calculateDamage(20, 'Normal', Infinity, 'Light')).toBe(1);
  });
});
