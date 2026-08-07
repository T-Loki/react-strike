import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../core/engine/GameEngine';
import { ScriptedWaveStrategy, ScaledEndlessStrategy, SkirmishWaveStrategy } from '../core/strategies/WaveStrategy';
import { WaveStrategyFactory } from '../core/strategies/WaveStrategyFactory';
import { TERRITORY_WAVE_PROFILES } from '../data/waves';

describe('Standardized Enemy Wave Pipeline', () => {
  beforeEach(() => {
    GameEngine.resetInstance();
  });

  describe('ScriptedWaveStrategy', () => {
    it('outputs exact unit IDs, counts, and line positions for Outer Barren Fields Wave 1', () => {
      const strategy = new ScriptedWaveStrategy(TERRITORY_WAVE_PROFILES.terr_outer_fields);
      const specs = strategy.generateWave({ territoryId: 'terr_outer_fields', waveIndex: 0 });

      // Outer Fields wave 1 has 5 skirmishers (back) and 4 grunts (front) = 9 units
      expect(specs.length).toBe(9);

      const skirmishers = specs.filter(s => s.unitTemplateId === 'unit_goblin_skirmisher');
      const grunts = specs.filter(s => s.unitTemplateId === 'unit_orc_grunt');

      expect(skirmishers.length).toBe(5);
      expect(grunts.length).toBe(4);

      skirmishers.forEach(s => expect(s.linePosition).toBe('back'));
      grunts.forEach(s => expect(s.linePosition).toBe('front'));
    });

    it('applies statModifiers (hpMultiplier, damageMultiplier) correctly on Wave 2', () => {
      const strategy = new ScriptedWaveStrategy(TERRITORY_WAVE_PROFILES.terr_outer_fields);
      const specs = strategy.generateWave({ territoryId: 'terr_outer_fields', waveIndex: 1 });

      specs.forEach(s => {
        expect(s.hpMultiplier).toBeCloseTo(1.1);
        expect(s.damageMultiplier).toBeCloseTo(1.05);
      });
    });

    it('flags boss units on boss waves for Valhalla Citadel', () => {
      const strategy = new ScriptedWaveStrategy(TERRITORY_WAVE_PROFILES.terr_valhalla);
      const specs = strategy.generateWave({ territoryId: 'terr_valhalla', waveIndex: 2 }); // Wave 3

      const bossSpecs = specs.filter(s => s.isBoss);
      expect(bossSpecs.length).toBeGreaterThan(0);
      expect(bossSpecs.some(b => b.unitTemplateId === 'unit_horde_behemoth')).toBe(true);
    });
  });

  describe('ScaledEndlessStrategy', () => {
    it('verifies mathematical stat scaling across 20+ waves without NaN or overflow', () => {
      const strategy = new ScaledEndlessStrategy();

      for (let waveIndex = 0; waveIndex < 25; waveIndex++) {
        const specs = strategy.generateWave({ waveIndex, isSandbox: true });
        const expectedStatScale = 1.0 + waveIndex * 0.15;

        expect(specs.length).toBeGreaterThan(0);

        specs.forEach(s => {
          expect(s.hpMultiplier).not.toBeNaN();
          expect(s.damageMultiplier).not.toBeNaN();
          expect(s.hpMultiplier).toBeGreaterThanOrEqual(expectedStatScale);
          expect(s.damageMultiplier).toBeGreaterThanOrEqual(expectedStatScale);
          expect(Number.isFinite(s.hpMultiplier)).toBe(true);
        });
      }
    });

    it('triggers boss behemoths on every 5th wave (wave index 4, 9, 14, etc.)', () => {
      const strategy = new ScaledEndlessStrategy();

      const wave5Specs = strategy.generateWave({ waveIndex: 4, isSandbox: true });
      expect(wave5Specs.some(s => s.isBoss && s.unitTemplateId === 'unit_horde_behemoth')).toBe(true);

      const wave10Specs = strategy.generateWave({ waveIndex: 9, isSandbox: true });
      expect(wave10Specs.some(s => s.isBoss && s.unitTemplateId === 'unit_horde_behemoth')).toBe(true);
    });
  });

  describe('SkirmishWaveStrategy', () => {
    it('composes wave within point budget', () => {
      const strategy = new SkirmishWaveStrategy();
      const specs = strategy.generateWave({ pointBudget: 300 });

      expect(specs.length).toBeGreaterThan(0);
      specs.forEach(s => {
        expect(s.unitTemplateId).toBeDefined();
        expect(s.linePosition).toMatch(/front|mid|back/);
      });
    });
  });

  describe('WaveStrategyFactory', () => {
    it('returns ScaledEndlessStrategy for sandbox mode', () => {
      const strat = WaveStrategyFactory.getStrategy({ isSandbox: true });
      expect(strat.name).toBe('ScaledEndlessStrategy');
    });

    it('returns SkirmishWaveStrategy when pointBudget is explicitly provided', () => {
      const strat = WaveStrategyFactory.getStrategy({ pointBudget: 400 });
      expect(strat.name).toBe('SkirmishWaveStrategy');
    });

    it('returns ScriptedWaveStrategy for campaign territory context', () => {
      const strat = WaveStrategyFactory.getStrategy({ territoryId: 'terr_inner_fortress' });
      expect(strat.name).toBe('ScriptedWaveStrategy');
    });
  });

  describe('GameEngine Wave Spawning & HUD Diagnostics', () => {
    it('spawns enemies according to wave specs and populates getWaveInfo()', () => {
      const engine = GameEngine.getInstance();
      engine.setCanvasSize(1000, 500);
      engine.clearBoard();

      engine.spawnHordeWave(undefined, { territoryId: 'terr_outer_fields', waveIndex: 0 });

      const horde = engine.getHorde();
      expect(horde.length).toBe(9); // 5 skirmishers + 4 grunts

      const waveInfo = engine.getWaveInfo();
      expect(waveInfo.currentWave).toBe(1);
      expect(waveInfo.totalWaves).toBe(3);
      expect(waveInfo.waveTitle).toBe('Outer Patrol');
      expect(waveInfo.activeStrategyName).toBe('ScriptedWaveStrategy');
    });
  });
});
