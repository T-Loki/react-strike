import type { GameEngine } from '../engine/GameEngine';
import type { WaveContext, SpawnedUnitSpec, TerritoryWaveProfile, ScriptedWave } from '../../types/combat';
import { getTerritoryWaveProfile } from '../../data/waves';
import { HORDE_FACTION } from '../../data/units';

export interface WaveStrategy {
  name: string;
  generateWave(context: WaveContext): SpawnedUnitSpec[];
  spawnWave(engine: GameEngine, context?: WaveContext): void;
}

export abstract class BaseWaveStrategy implements WaveStrategy {
  abstract name: string;

  abstract generateWave(context: WaveContext): SpawnedUnitSpec[];

  spawnWave(engine: GameEngine, context: WaveContext = {}): void {
    const specs = this.generateWave(context);
    engine.spawnHordeFromSpecs(specs);
  }
}

/**
 * ScriptedWaveStrategy reads directly from TerritoryWaveProfile based on activeTerritoryId
 * and current wave index. Guarantees 100% deterministic, reproducible enemy spawns.
 */
export class ScriptedWaveStrategy extends BaseWaveStrategy {
  name = 'ScriptedWaveStrategy';
  private profile?: TerritoryWaveProfile;

  constructor(profile?: TerritoryWaveProfile) {
    super();
    this.profile = profile;
  }

  generateWave(context: WaveContext): SpawnedUnitSpec[] {
    const activeProfile = this.profile || getTerritoryWaveProfile(context.territoryId);
    const waveIndex = context.waveIndex ?? 0;
    const waveNumber = waveIndex + 1;

    // Find requested wave or fallback to last wave with difficulty scaling
    let waveConfig: ScriptedWave | undefined = activeProfile.waves.find(w => w.waveNumber === waveNumber);
    let extraScale = 1.0;

    if (!waveConfig && activeProfile.waves.length > 0) {
      waveConfig = activeProfile.waves[activeProfile.waves.length - 1];
      const overflowWaves = waveNumber - waveConfig.waveNumber;
      extraScale = 1.0 + overflowWaves * 0.15;
    }

    if (!waveConfig) {
      return [
        { unitTemplateId: 'unit_orc_grunt', linePosition: 'front' },
        { unitTemplateId: 'unit_goblin_skirmisher', linePosition: 'back' },
      ];
    }

    const hpMod = (waveConfig.statModifiers?.hpMultiplier ?? 1.0) * (context.difficultyMultiplier ?? 1.0) * extraScale;
    const dmgMod = (waveConfig.statModifiers?.damageMultiplier ?? 1.0) * (context.difficultyMultiplier ?? 1.0) * extraScale;

    const specs: SpawnedUnitSpec[] = [];
    for (const group of waveConfig.composition) {
      for (let i = 0; i < group.count; i++) {
        specs.push({
          unitTemplateId: group.unitTemplateId,
          linePosition: group.linePosition || 'front',
          hpMultiplier: hpMod,
          damageMultiplier: dmgMod,
          isBoss: waveConfig.bossId === group.unitTemplateId || waveConfig.isBossWave,
        });
      }
    }

    return specs;
  }
}

/**
 * ScaledEndlessStrategy generates procedurally scaled enemy compositions
 * using mathematical difficulty scaling curves:
 * Stat Scale = 1.0 + (Wave Index * 0.15)
 */
export class ScaledEndlessStrategy extends BaseWaveStrategy {
  name = 'ScaledEndlessStrategy';

  generateWave(context: WaveContext): SpawnedUnitSpec[] {
    const waveIndex = Math.max(0, context.waveIndex ?? 0);
    const statScale = 1.0 + waveIndex * 0.15;

    const baseCount = 8 + Math.floor(waveIndex * 1.5);
    const count = Math.min(60, baseCount); // Cap to prevent lag traps

    const specs: SpawnedUnitSpec[] = [];
    const isBossWave = (waveIndex + 1) % 5 === 0;

    if (isBossWave) {
      const bossCount = 1 + Math.floor(waveIndex / 10);
      for (let i = 0; i < bossCount; i++) {
        specs.push({
          unitTemplateId: 'unit_horde_behemoth',
          linePosition: 'front',
          hpMultiplier: statScale * 1.25,
          damageMultiplier: statScale * 1.2,
          isBoss: true,
        });
      }
    }

    const remainingCount = isBossWave ? Math.max(4, count - 2) : count;

    for (let i = 0; i < remainingCount; i++) {
      let templateId: string;
      let linePosition: 'front' | 'mid' | 'back';

      const roll = (i + waveIndex) % 5;
      if (roll === 0) {
        templateId = 'unit_goblin_skirmisher';
        linePosition = 'back';
      } else if (roll === 1) {
        templateId = 'unit_shadow_warg';
        linePosition = 'back';
      } else if (roll === 2) {
        templateId = 'unit_horde_berserker';
        linePosition = 'mid';
      } else if (roll === 3) {
        templateId = 'unit_orc_warrior';
        linePosition = 'front';
      } else {
        templateId = 'unit_orc_grunt';
        linePosition = 'front';
      }

      specs.push({
        unitTemplateId: templateId,
        linePosition,
        hpMultiplier: statScale,
        damageMultiplier: statScale,
      });
    }

    return specs;
  }
}

/**
 * SkirmishWaveStrategy balances compositions based on a target point budget (e.g. 500 gold worth of enemy units).
 */
export class SkirmishWaveStrategy extends BaseWaveStrategy {
  name = 'SkirmishWaveStrategy';

  generateWave(context: WaveContext): SpawnedUnitSpec[] {
    let budget = context.pointBudget ?? 500;
    if (context.difficultyMultiplier) {
      budget *= context.difficultyMultiplier;
    }

    const roster = [...HORDE_FACTION.catalog].sort((a, b) => b.cost - a.cost);
    const specs: SpawnedUnitSpec[] = [];

    while (budget >= 25 && specs.length < 50) {
      const affordable = roster.filter(u => u.cost <= budget);
      if (affordable.length === 0) break;

      // Pick highest cost unit affordable with slight variation
      const chosen = affordable[Math.floor(Math.random() * Math.min(2, affordable.length))];
      budget -= chosen.cost;

      let linePosition: 'front' | 'mid' | 'back' = 'front';
      if (chosen.type === 'hero' || chosen.armorType === 'Fortified' || chosen.armorType === 'Heavy') {
        linePosition = 'front';
      } else if (chosen.range > 100) {
        linePosition = 'back';
      } else if ((chosen.speed ?? 0) > 100) {
        linePosition = 'back';
      } else {
        linePosition = 'mid';
      }

      specs.push({
        unitTemplateId: chosen.id,
        linePosition,
        hpMultiplier: 1.0,
        damageMultiplier: 1.0,
        isBoss: chosen.type === 'hero',
      });
    }

    return specs;
  }
}

// ─── Backward Compatibility Strategy Wrappers ────────────────────────────────

export class SkirmishWave implements WaveStrategy {
  name = 'SkirmishWave';

  generateWave(context: WaveContext): SpawnedUnitSpec[] {
    const count = context.pointBudget || 10;
    const specs: SpawnedUnitSpec[] = [];
    const names = ['unit_goblin_skirmisher', 'unit_orc_grunt'];
    for (let i = 0; i < count; i++) {
      const id = names[i % names.length];
      specs.push({
        unitTemplateId: id,
        linePosition: id === 'unit_goblin_skirmisher' ? 'back' : 'front',
        hpMultiplier: 50 / 65, // Preserve legacy HP behavior (50hp)
        damageMultiplier: 8 / 9,
      });
    }
    return specs;
  }

  spawnWave(engine: GameEngine, contextOrCount?: WaveContext | number): void {
    const count = typeof contextOrCount === 'number' ? contextOrCount : (contextOrCount?.pointBudget || 10);
    const { width, height } = engine.getCanvasSize();
    const marginY = 80;
    const availableH = Math.max(100, height - marginY * 2);

    const names = ['Goblin Skirmisher', 'Orc Grunt'];
    for (let i = 0; i < count; i++) {
      const spawnX = width - 150 + Math.random() * 200;
      const spawnY = marginY + Math.random() * availableH;
      const name = names[i % names.length];
      engine.spawnHorde(spawnX, spawnY, { name, maxHp: 50, hp: 50, damage: 8, speed: 80 });
    }
  }
}

export class MidBossWave implements WaveStrategy {
  name = 'MidBossWave';

  generateWave(context: WaveContext): SpawnedUnitSpec[] {
    const count = context.pointBudget || 5;
    const specs: SpawnedUnitSpec[] = [
      { unitTemplateId: 'unit_horde_behemoth', linePosition: 'front', isBoss: true }
    ];
    for (let i = 0; i < count; i++) {
      specs.push({
        unitTemplateId: i % 2 === 0 ? 'unit_orc_grunt' : 'unit_shadow_warg',
        linePosition: 'mid',
        hpMultiplier: 50 / 65,
        damageMultiplier: 8 / 9,
      });
    }
    return specs;
  }

  spawnWave(engine: GameEngine, contextOrCount?: WaveContext | number): void {
    const count = typeof contextOrCount === 'number' ? contextOrCount : (contextOrCount?.pointBudget || 5);
    const { width, height } = engine.getCanvasSize();
    const marginY = 80;
    const availableH = Math.max(100, height - marginY * 2);

    engine.spawnHorde(width - 100, height / 2, { name: 'Horde Behemoth', maxHp: 300, hp: 300, damage: 30, speed: 40, armor: 5 });

    const names = ['Orc Grunt', 'Shadow Warg'];
    for (let i = 0; i < count; i++) {
      const spawnX = width - 150 + Math.random() * 200;
      const spawnY = marginY + Math.random() * availableH;
      const name = names[i % names.length];
      engine.spawnHorde(spawnX, spawnY, { name, maxHp: 50, hp: 50, damage: 8, speed: 80 });
    }
  }
}

export class EndlessDoomWave implements WaveStrategy {
  name = 'EndlessDoomWave';

  generateWave(context: WaveContext): SpawnedUnitSpec[] {
    const strategy = new ScaledEndlessStrategy();
    return strategy.generateWave(context);
  }

  spawnWave(engine: GameEngine, contextOrCount?: WaveContext | number): void {
    const count = typeof contextOrCount === 'number' ? contextOrCount : 25;
    const { width, height } = engine.getCanvasSize();
    const marginY = 80;
    const availableH = Math.max(100, height - marginY * 2);

    const names = ['Horde Berserker', 'Shadow Warg', 'Orc Grunt'];
    for (let i = 0; i < count; i++) {
      const spawnX = width - 200 + Math.random() * 300;
      const spawnY = marginY + Math.random() * availableH;
      const name = names[i % names.length];
      engine.spawnHorde(spawnX, spawnY, { name, maxHp: 80, hp: 80, damage: 15, speed: 90 });
    }
  }
}

