import type { UnitTemplate } from '../types/combat';

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
};


export const UNIT_ROSTER: UnitTemplate[] = [
  {
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
  },
  {
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
  },
  {
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
  },
];
