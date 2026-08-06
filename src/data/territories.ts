import type { Territory, UnitTemplate } from '../types/combat';
import {
  INITIAL_BUILDINGS_BARREN,
  INITIAL_BUILDINGS_MERCHANT,
  INITIAL_BUILDINGS_FORTRESS,
  INITIAL_BUILDINGS_CITADEL
} from './buildings';
import { GARRISON_SOLDIER } from './units';

const createGarrisonTrio = (territoryPrefix: string): UnitTemplate[] => [
  { ...GARRISON_SOLDIER, id: `garrison_${territoryPrefix}_1` },
  { ...GARRISON_SOLDIER, id: `garrison_${territoryPrefix}_2` },
  { ...GARRISON_SOLDIER, id: `garrison_${territoryPrefix}_3` },
];

export const INITIAL_TERRITORIES: Territory[] = [
  {
    id: 'terr_outer_fields',
    name: 'Outer Barren Fields',
    type: 'barren',
    ringLevel: 3,
    resourceYield: 10,
    faithYield: 5,
    isScorched: false,
    hasActiveBattle: false,
    allocatedDefenders: createGarrisonTrio('outer'),
    buildings: INITIAL_BUILDINGS_BARREN,
  },
  {
    id: 'terr_merchant_slums',
    name: 'Merchant Slums',
    type: 'merchant',
    ringLevel: 2,
    resourceYield: 50,
    faithYield: 15,
    isScorched: false,
    hasActiveBattle: false,
    allocatedDefenders: createGarrisonTrio('merchant'),
    buildings: INITIAL_BUILDINGS_MERCHANT,
  },
  {
    id: 'terr_inner_fortress',
    name: 'Inner Fortress Ring',
    type: 'fortress',
    ringLevel: 1,
    resourceYield: 0,
    faithYield: 25,
    isScorched: false,
    hasActiveBattle: false,
    allocatedDefenders: createGarrisonTrio('fortress'),
    buildings: INITIAL_BUILDINGS_FORTRESS,
  },
  {
    id: 'terr_valhalla',
    name: 'Valhalla Citadel',
    type: 'citadel',
    ringLevel: 0,
    resourceYield: 100,
    faithYield: 50,
    isScorched: false,
    hasActiveBattle: false,
    allocatedDefenders: createGarrisonTrio('citadel'),
    buildings: INITIAL_BUILDINGS_CITADEL,
  },
];
