export interface DefensiveRing {
  ringId: number;
  name: string;
  health: number;
  maxHealth: number;
  isBreached: boolean;
}

export interface GridCell {
  x: number;
  y: number;
  isChokePoint: boolean;
  isBlocked: boolean;
  occupiedByUnitId?: string;
}

export interface UnitTemplate {
  id: string;
  name: string;
  type: 'common' | 'elite' | 'hero';
  hp: number;
  maxHp: number;
  damage: number;
  range: number;
  attackSpeed: number;
  cost: number;
  abilities: string[];
  gridPosition?: { x: number; y: number };
}

export interface Territory {
  id: string;
  name: string;
  type: 'barren' | 'merchant' | 'fortress' | 'citadel';
  ringLevel: number;
  resourceYield: number;
  upkeepCost: number;
  isScorched: boolean;
  hasActiveBattle: boolean;
  allocatedDefenders: UnitTemplate[];
}

export interface Unit {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  armor: number;
  range: number;
  attackRange: number;
  attackCooldown: number;
  lastAttackTime: number;
  speed: number;
  team: 'defender' | 'horde';
  x: number;
  y: number;
  targetId?: string;
  isAttacking?: boolean;
  attackAnimTimer?: number;
  color?: string;
  gridPosition?: { x: number; y: number };
  homeX?: number;
  homeY?: number;
}

export interface DamageText {
  id: string;
  x: number;
  y: number;
  text: string;
  opacity: number;
  color: string;
  lifetime: number;
  maxLifetime: number;
}

export interface AttackEffect {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  maxDuration: number;
  color: string;
}

export type BattlePhase = 'HOLDING_POSITION' | 'ENGAGING_ENEMY' | 'VICTORY' | 'DEFEAT' | 'PAUSED';

export interface BattlefieldZoneConfig {
  playerSpawnRatio: number;      // Default: 0.30 (0% to 30%)
  playerAreaRatio: number;       // Default: 0.40 (0% to 40%)
  neutralAreaRatio: number;      // Default: 0.70 (40% to 70%)
  enemySpawnRatio: number;       // Default: 1.00 (70% to 100%)
}

export const DEFAULT_BATTLEFIELD_ZONES: BattlefieldZoneConfig = {
  playerSpawnRatio: 0.30,
  playerAreaRatio: 0.40,
  neutralAreaRatio: 0.70,
  enemySpawnRatio: 1.00,
};
