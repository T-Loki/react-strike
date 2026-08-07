import type { UnitTemplate, Faction } from '../types/combat';

// ─── Pantheon Units ───────────────────────────────────────────────────────────

export const GARRISON_SOLDIER: UnitTemplate = {
  id: 'unit_garrison_soldier',
  name: 'Garrison Soldier',
  type: 'common',
  hp: 100,
  maxHp: 100,
  damage: 12,
  range: 50,
  attackSpeed: 1.0,
  cost: 0,
  abilities: ['Fixed Garrison'],
  faction: 'pantheon',
  weight: 1.0,
  speed: 85,
  armor: 2,
  icon: '🛡️',
  color: '#22c55e',
};

export const CITY_MILITIA: UnitTemplate = {
  id: 'unit_city_militia',
  name: 'City Militia',
  type: 'common',
  hp: 75,
  maxHp: 75,
  damage: 10,
  range: 50,
  attackSpeed: 1.0,
  cost: 0,
  abilities: ['Fixed Garrison'],
  faction: 'pantheon',
  weight: 0.8,
  speed: 80,
  armor: 1,
  icon: '🗡️',
  color: '#4ade80',
};

export const VANGUARD_SPEARMAN: UnitTemplate = {
  id: 'unit_vanguard_spearman',
  name: 'Vanguard Spearman',
  type: 'common',
  hp: 120,
  maxHp: 120,
  damage: 15,
  range: 60,
  attackSpeed: 1.2,
  cost: 50,
  abilities: [],
  faction: 'pantheon',
  weight: 1.0,
  speed: 85,
  armor: 2,
  icon: '⚔️',
  color: '#22c55e',
};

export const IRON_CROSSBOW: UnitTemplate = {
  id: 'unit_iron_crossbow',
  name: 'Iron Crossbow',
  type: 'common',
  hp: 80,
  maxHp: 80,
  damage: 25,
  range: 200,
  attackSpeed: 0.8,
  cost: 75,
  abilities: [],
  faction: 'pantheon',
  weight: 0.8,
  speed: 80,
  armor: 1,
  icon: '🏹',
  color: '#38bdf8',
};

export const ARIC_SHIELDBREAKER: UnitTemplate = {
  id: 'unit_aric_shieldbreaker',
  name: 'Aric the Shieldbreaker',
  type: 'hero',
  hp: 500,
  maxHp: 500,
  damage: 40,
  range: 50,
  attackSpeed: 1.0,
  cost: 300,
  abilities: ['taunt'],
  faction: 'pantheon',
  weight: 10.0,
  speed: 100,
  armor: 8,
  icon: '👑',
  color: '#f59e0b',
};

// ─── Horde Units ──────────────────────────────────────────────────────────────

export const GOBLIN_SKIRMISHER: UnitTemplate = {
  id: 'unit_goblin_skirmisher',
  name: 'Goblin Skirmisher',
  type: 'common',
  hp: 35,
  maxHp: 35,
  damage: 6,
  range: 120,
  attackSpeed: 1.2,
  cost: 25,
  abilities: [],
  faction: 'horde',
  weight: 0.6,
  speed: 110,
  armor: 0,
  icon: '🏹',
  color: '#86efac',
};

export const ORC_GRUNT: UnitTemplate = {
  id: 'unit_orc_grunt',
  name: 'Orc Grunt',
  type: 'common',
  hp: 65,
  maxHp: 65,
  damage: 9,
  range: 35,
  attackSpeed: 1.0,
  cost: 40,
  abilities: [],
  faction: 'horde',
  weight: 1.0,
  speed: 70,
  armor: 1,
  icon: '⚔️',
  color: '#f87171',
};

export const ORC_WARRIOR: UnitTemplate = {
  id: 'unit_orc_warrior',
  name: 'Orc Warrior',
  type: 'elite',
  hp: 120,
  maxHp: 120,
  damage: 14,
  range: 40,
  attackSpeed: 1.0,
  cost: 80,
  abilities: [],
  faction: 'horde',
  weight: 1.5,
  speed: 60,
  armor: 3,
  icon: '🛡️',
  color: '#fb923c',
};

export const SHADOW_WARG: UnitTemplate = {
  id: 'unit_shadow_warg',
  name: 'Shadow Warg',
  type: 'elite',
  hp: 80,
  maxHp: 80,
  damage: 18,
  range: 35,
  attackSpeed: 1.4,
  cost: 90,
  abilities: [],
  faction: 'horde',
  weight: 1.2,
  speed: 130,
  armor: 1,
  icon: '🐺',
  color: '#c084fc',
};

export const HORDE_BERSERKER: UnitTemplate = {
  id: 'unit_horde_berserker',
  name: 'Horde Berserker',
  type: 'elite',
  hp: 90,
  maxHp: 90,
  damage: 22,
  range: 35,
  attackSpeed: 1.5,
  cost: 100,
  abilities: ['rage'],
  faction: 'horde',
  weight: 1.4,
  speed: 95,
  armor: 2,
  icon: '💢',
  color: '#f43f5e',
};

export const HORDE_BEHEMOTH: UnitTemplate = {
  id: 'unit_horde_behemoth',
  name: 'Horde Behemoth',
  type: 'hero',
  hp: 300,
  maxHp: 300,
  damage: 30,
  range: 50,
  attackSpeed: 0.8,
  cost: 250,
  abilities: ['cleave'],
  faction: 'horde',
  weight: 3.5,
  speed: 40,
  armor: 5,
  icon: '💀',
  color: '#7f1d1d',
};

// ─── Faction Dictionary ───────────────────────────────────────────────────────

export const PANTHEON_FACTION: Faction = {
  id: 'pantheon',
  name: 'Pantheon',
  description: 'Defenders of the realm.',
  garrison: [GARRISON_SOLDIER, CITY_MILITIA],
  roster: [VANGUARD_SPEARMAN, IRON_CROSSBOW, ARIC_SHIELDBREAKER],
  catalog: [GARRISON_SOLDIER, CITY_MILITIA, VANGUARD_SPEARMAN, IRON_CROSSBOW, ARIC_SHIELDBREAKER],
};

export const HORDE_FACTION: Faction = {
  id: 'horde',
  name: 'The Horde',
  description: 'Ruthless invaders attacking the perimeter.',
  garrison: [],
  roster: [GOBLIN_SKIRMISHER, ORC_GRUNT, ORC_WARRIOR, SHADOW_WARG, HORDE_BERSERKER, HORDE_BEHEMOTH],
  catalog: [GOBLIN_SKIRMISHER, ORC_GRUNT, ORC_WARRIOR, SHADOW_WARG, HORDE_BERSERKER, HORDE_BEHEMOTH],
};

export const FACTIONS: Record<string, Faction> = {
  pantheon: PANTHEON_FACTION,
  horde: HORDE_FACTION,
};


