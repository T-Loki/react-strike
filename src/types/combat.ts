export interface DefensiveRing {
  ringId: number;
  name: string;
  health: number;
  maxHealth: number;
  isBreached: boolean;
}

export interface Territory {
  id: string;
  name: string;
  ringId: number;
  upkeepCost: number;
  resourceYield: number;
  isScorched: boolean;
  payoutOnDestroy: number;
  hasActiveBattle: boolean;
  allocatedDefenders: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  range: number;
  team: 'defender' | 'horde';
  x: number;
  y: number;
}
