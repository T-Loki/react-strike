import type { Building } from '../types/combat';

export const INITIAL_BUILDINGS_BARREN: Building[] = [
  {
    id: 'bld_farmstead',
    name: 'Scavenger Farmstead',
    level: 1,
    maxLevel: 3,
    upgradeCost: 100,
    type: 'production',
    effectDescription: '+15 Gold yield per turn',
  },
  {
    id: 'bld_watchtower',
    name: 'Outer Watchtower',
    level: 1,
    maxLevel: 3,
    upgradeCost: 150,
    type: 'defense',
    effectDescription: '+1 Defender slot & early warning',
  },
];

export const INITIAL_BUILDINGS_MERCHANT: Building[] = [
  {
    id: 'bld_marketplace',
    name: 'Grand Bazaar',
    level: 1,
    maxLevel: 3,
    upgradeCost: 200,
    type: 'production',
    effectDescription: '+40 Gold yield per turn',
  },
  {
    id: 'bld_guard_post',
    name: 'Mercenary Post',
    level: 1,
    maxLevel: 3,
    upgradeCost: 250,
    type: 'defense',
    effectDescription: '+20% Defender attack damage',
  },
  {
    id: 'bld_shrine',
    name: 'Roadside Shrine',
    level: 1,
    maxLevel: 3,
    upgradeCost: 150,
    type: 'faith',
    effectDescription: '+10 Faith yield per turn',
  },
];

export const INITIAL_BUILDINGS_FORTRESS: Building[] = [
  {
    id: 'bld_armoury',
    name: 'Iron Armoury',
    level: 1,
    maxLevel: 3,
    upgradeCost: 300,
    type: 'defense',
    effectDescription: '+25% Defender max armor',
  },
  {
    id: 'bld_ramparts',
    name: 'Stone Ramparts',
    level: 1,
    maxLevel: 3,
    upgradeCost: 350,
    type: 'defense',
    effectDescription: '+30% Castle Gate durability',
  },
  {
    id: 'bld_barracks',
    name: 'Elite Training Grounds',
    level: 1,
    maxLevel: 3,
    upgradeCost: 300,
    type: 'utility',
    effectDescription: '-15% Unit recruitment cost',
  },
];

export const INITIAL_BUILDINGS_CITADEL: Building[] = [
  {
    id: 'bld_sanctuary',
    name: 'High Sanctuary',
    level: 1,
    maxLevel: 3,
    upgradeCost: 400,
    type: 'faith',
    effectDescription: '+50 Faith yield per turn',
  },
  {
    id: 'bld_citadel_keep',
    name: 'Imperial Keep',
    level: 1,
    maxLevel: 3,
    upgradeCost: 500,
    type: 'production',
    effectDescription: '+100 Gold yield & +50% defense',
  },
  {
    id: 'bld_war_council',
    name: 'War Council Chamber',
    level: 1,
    maxLevel: 3,
    upgradeCost: 450,
    type: 'utility',
    effectDescription: '+2 Global Army Pool capacity',
  },
];
