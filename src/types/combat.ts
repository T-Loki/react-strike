export type DamageType = 'Normal' | 'Piercing' | 'Siege' | 'Magic' | 'Hero';
export type ArmorType = 'Unarmored' | 'Light' | 'Medium' | 'Heavy' | 'Fortified' | 'Hero';

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
  faction?: string;
  weight?: number;
  speed?: number;
  armor?: number;
  damageType?: DamageType;
  armorType?: ArmorType;
  icon?: string;
  color?: string;
  gridPosition?: { x: number; y: number };
}

export interface Faction {
  id: string;
  name: string;
  description: string;
  garrison: UnitTemplate[];
  roster: UnitTemplate[];
  catalog: UnitTemplate[];
}

export interface Building {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  upgradeCost: number;
  type: 'production' | 'defense' | 'faith' | 'utility';
  effectDescription: string;
}

export interface Territory {
  id: string;
  name: string;
  type: 'barren' | 'merchant' | 'fortress' | 'citadel';
  ringLevel: number;
  resourceYield: number;
  faithYield?: number;
  isScorched: boolean;
  hasActiveBattle: boolean;
  allocatedDefenders: UnitTemplate[];
  buildings: Building[];
  gridConfig?: {
    cols: number;
    rows: number;
    cellPx: number;
    locationId: string;
  };
}

export interface Unit {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  armor: number;
  damageType?: DamageType;
  armorType?: ArmorType;
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
  unitType?: 'common' | 'elite' | 'hero';
  faction?: 'pantheon' | 'horde';
  weight?: number;
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

export type BattlePhase = 'HOLDING_POSITION' | 'ENGAGING_ENEMY' | 'VICTORY' | 'DEFEAT' | 'PAUSED' | 'SURRENDERED';

export interface BattlefieldZoneConfig {
  playerSpawnRatio: number;      // Default: 0.35 (0% to 35%)
  playerAreaRatio: number;       // Default: 0.35 (0% to 35%)
  neutralAreaRatio: number;      // Default: 0.75 (35% to 75%)
  enemySpawnRatio: number;       // Default: 1.00 (75% to 100%)
}

export const DEFAULT_BATTLEFIELD_ZONES: BattlefieldZoneConfig = {
  playerSpawnRatio: 0.35,
  playerAreaRatio: 0.35,
  neutralAreaRatio: 0.75,
  enemySpawnRatio: 1.00,
};

// ─── Wave Strategy & Wave Pipeline Types ─────────────────────────────────────

export interface WaveGroup {
  unitTemplateId: string;
  count: number;
  spawnDelayMs?: number;
  linePosition?: 'front' | 'mid' | 'back';
}

export interface ScriptedWave {
  waveNumber: number;
  title?: string;
  composition: WaveGroup[];
  statModifiers?: {
    hpMultiplier?: number;
    damageMultiplier?: number;
  };
  bossId?: string;
  isBossWave?: boolean;
}

export interface TerritoryWaveProfile {
  territoryId: string;
  waves: ScriptedWave[];
  defaultFaction: string;
}

export interface WaveContext {
  territoryId?: string;
  waveIndex?: number;
  pointBudget?: number;
  difficultyMultiplier?: number;
  isSandbox?: boolean;
}

export interface SpawnedUnitSpec {
  unitTemplateId: string;
  linePosition: 'front' | 'mid' | 'back';
  hpMultiplier?: number;
  damageMultiplier?: number;
  isBoss?: boolean;
}

export interface WaveInfo {
  currentWave: number;
  totalWaves: number | null;
  waveTitle?: string;
  isBossWave?: boolean;
  activeStrategyName: string;
}

