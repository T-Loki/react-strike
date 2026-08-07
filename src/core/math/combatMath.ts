import type { DamageType, ArmorType } from '../../types/combat';

/**
 * RTS-style Damage Type vs Armor Type Multiplier Matrix
 */
export const DAMAGE_MULTIPLIER_MATRIX: Record<DamageType, Record<ArmorType, number>> = {
  Normal: {
    Unarmored: 1.0,
    Light: 1.0,
    Medium: 1.0,
    Heavy: 0.75,
    Fortified: 0.5,
    Hero: 0.5,
  },
  Piercing: {
    Unarmored: 1.5,
    Light: 1.5,
    Medium: 0.75,
    Heavy: 0.5,
    Fortified: 0.5,
    Hero: 1.0,
  },
  Siege: {
    Unarmored: 1.0,
    Light: 0.5,
    Medium: 0.5,
    Heavy: 1.0,
    Fortified: 1.5,
    Hero: 0.5,
  },
  Magic: {
    Unarmored: 1.0,
    Light: 0.75,
    Medium: 1.25,
    Heavy: 1.25,
    Fortified: 0.35,
    Hero: 1.0,
  },
  Hero: {
    Unarmored: 1.0,
    Light: 1.0,
    Medium: 1.0,
    Heavy: 1.0,
    Fortified: 0.75,
    Hero: 1.0,
  },
};

/**
 * Descriptions for Damage Types used in UI tooltips.
 */
export const DAMAGE_TYPE_DESCRIPTIONS: Record<DamageType, string> = {
  Normal: 'Normal: Deals 100% damage to Light/Medium/Unarmored, 75% vs Heavy, 50% vs Fortified/Hero.',
  Piercing: 'Piercing: Deals 150% damage to Unarmored/Light, 75% vs Medium, 50% vs Heavy/Fortified.',
  Siege: 'Siege: Deals 150% damage to Fortified armor, 100% vs Heavy/Unarmored, 50% vs others.',
  Magic: 'Magic: Deals 125% damage to Medium/Heavy armor, 75% vs Light, 35% vs Fortified.',
  Hero: 'Hero: Deals 100% damage to almost all armor types, 75% vs Fortified.',
};

/**
 * Descriptions for Armor Types used in UI tooltips.
 */
export const ARMOR_TYPE_DESCRIPTIONS: Record<ArmorType, string> = {
  Unarmored: 'Unarmored: Takes 150% damage from Piercing attacks.',
  Light: 'Light Armor: Takes 150% damage from Piercing, reduced damage from Siege/Magic.',
  Medium: 'Medium Armor: Takes 125% damage from Magic, 75% from Piercing, 50% from Siege.',
  Heavy: 'Heavy Armor: Takes 125% damage from Magic, reduces Normal (75%) & Piercing (50%).',
  Fortified: 'Fortified Armor: Takes 150% damage from Siege, heavy resistance to other damage types.',
  Hero: 'Hero Armor: Takes 50% damage from Normal & Siege, standard damage from Piercing & Magic.',
};

/**
 * Safely looks up the damage multiplier between a damage type and armor type.
 * Defaults to 1.0 if either type is undefined or missing from the matrix.
 */
export const getDamageMultiplier = (
  damageType?: DamageType,
  armorType?: ArmorType
): number => {
  if (!damageType || !armorType) return 1.0;
  const row = DAMAGE_MULTIPLIER_MATRIX[damageType];
  if (!row) return 1.0;
  return row[armorType] ?? 1.0;
};

/**
 * Calculates final damage using:
 * Final Damage = max(1, floor(Base Damage * Multiplier - Flat Armor))
 * Includes defensive bounds against NaN, Infinity, and negative values.
 */
export const calculateDamage = (
  baseDamage: number,
  damageType?: DamageType,
  flatArmor: number = 0,
  armorType?: ArmorType
): number => {
  const safeDamage = isNaN(baseDamage) || !Number.isFinite(baseDamage) ? 0 : Math.max(0, baseDamage);
  const safeArmor = isNaN(flatArmor) ? 0 : flatArmor;

  const multiplier = getDamageMultiplier(damageType, armorType);
  const rawFinal = safeDamage * multiplier - safeArmor;

  return Math.max(1, Math.floor(rawFinal));
};
