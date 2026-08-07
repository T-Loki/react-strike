import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../core/engine/GameEngine';

describe('GameEngine Integration Tests', () => {
  let engine: GameEngine;

  beforeEach(() => {
    GameEngine.resetInstance();
    engine = GameEngine.getInstance();
  });

  it('toggles pause and resume correctly', () => {
    expect(engine.getIsPaused()).toBe(false);
    expect(engine.getBattlePhase()).toBe('HOLDING_POSITION');

    engine.pause();
    expect(engine.getIsPaused()).toBe(true);
    expect(engine.getBattlePhase()).toBe('PAUSED');

    engine.resume();
    expect(engine.getIsPaused()).toBe(false);
    expect(engine.getBattlePhase()).toBe('HOLDING_POSITION');

    engine.togglePause();
    expect(engine.getIsPaused()).toBe(true);
  });

  it('sets game speed properly', () => {
    engine.setGameSpeed(2.0);
    expect(engine.getGameSpeed()).toBe(2.0);
  });

  it('determines VICTORY phase when horde is wiped out but defenders remain', () => {
    engine.spawnDefender(100, 100);
    // Directly call the private update method by casting to any to simulate a frame tick
    (engine as any).update(16, performance.now());
    
    // With 1 defender and 0 horde, it should be victory
    expect(engine.getBattlePhase()).toBe('VICTORY');
  });

  it('determines DEFEAT phase when defenders are wiped out but horde remains', () => {
    engine.spawnHorde(500, 100);
    (engine as any).update(16, performance.now());
    
    // With 0 defenders and 1 horde, it should be defeat
    expect(engine.getBattlePhase()).toBe('DEFEAT');
  });

  it('determines DEFEAT phase when horde breaches left edge', () => {
    engine.spawnDefender(100, 100);
    // Horde at x=10 has breached the 25px limit
    engine.spawnHorde(10, 100);
    (engine as any).update(16, performance.now());
    
    // Even though defenders are alive, horde breached the edge, so defeat
    expect(engine.getBattlePhase()).toBe('DEFEAT');
  });

  it('enters SURRENDERED phase immediately upon surrender', () => {
    engine.surrenderBattle();
    // Surrendered bypasses update logic and forces phase
    expect(engine.getBattlePhase()).toBe('SURRENDERED');
    
    (engine as any).update(16, performance.now());
    expect(engine.getBattlePhase()).toBe('SURRENDERED');
  });

  it('clears board correctly', () => {
    engine.spawnDefender(100, 100);
    engine.spawnHorde(500, 100);
    expect(engine.getEntities().length).toBe(2);

    engine.clearBoard();
    expect(engine.getEntities().length).toBe(0);
    expect(engine.getDefenders().length).toBe(0);
    expect(engine.getHorde().length).toBe(0);
  });

  describe('Edge cases and complex logic', () => {
    it('handles NaN or negative damage gracefully in handleDealDamage', () => {
      engine.spawnDefender(100, 100);
      engine.spawnHorde(500, 100);
      const defender = engine.getDefenders()[0];
      const horde = engine.getHorde()[0];

      // Access the private handleDealDamage via any cast
      const dealDamage = (engine as any).handleDealDamage;
      
      // Negative damage should be treated as 0
      dealDamage(horde, defender, -50);
      expect(defender.hp).toBe(defender.maxHp);
      
      // NaN damage should be treated as 0
      dealDamage(horde, defender, NaN);
      expect(defender.hp).toBe(defender.maxHp);

      // Normal damage
      dealDamage(horde, defender, 10);
      expect(defender.hp).toBe(defender.maxHp - 10);

      // Verify damage texts and effects are spawned
      expect(engine.getDamageTexts().length).toBe(3);
      expect(engine.getAttackEffects().length).toBe(3);

      // Overkill damage clamps HP to 0 and triggers death
      dealDamage(horde, defender, 9999);
      expect(defender.hp).toBe(0);
    });

    it('resolveUnitCollisions pushes overlapping units apart', () => {
      engine.spawnDefender(100, 100);
      engine.spawnDefender(100, 100); // Spawning at exact same spot to trigger overlap
      const entities = engine.getEntities();
      
      // Initially exact same position
      expect(entities[0].data.x).toBe(entities[1].data.x);
      
      (engine as any).resolveUnitCollisions();
      
      // After collision resolution, they should be pushed apart
      expect(entities[0].data.x).not.toBe(entities[1].data.x);
    });

    it('loadFormation places units using grid system when templates lack gridPosition', () => {
      engine.loadFormation([{
        id: '1', name: 'Test Unit', type: 'common', hp: 100, maxHp: 100, damage: 10, range: 50, attackSpeed: 1, cost: 50, abilities: []
      }]);
      expect(engine.getDefenders().length).toBe(1);
      
      // It should load defaults if no templates provided
      engine.loadFormation([]);
      expect(engine.getDefenders().length).toBeGreaterThan(0);
    });

    it('spawnHordeWave falls back to SkirmishWave if no strategy provided', () => {
      engine.spawnHordeWave(); // Should not crash
      expect(engine.getHorde().length).toBeGreaterThan(0);
    });

    it('determines ENGAGING_ENEMY phase when horde breaches player area but not left edge', () => {
      engine.spawnDefender(100, 100);
      const zoneConfig = engine.getZoneConfig();
      // Calculate breach position (e.g. 30% of canvas width)
      const breachX = (engine as any).canvasWidth * zoneConfig.playerAreaRatio - 10;
      engine.spawnHorde(breachX, 100);
      
      (engine as any).update(16, performance.now());
      
      expect(engine.getBattlePhase()).toBe('ENGAGING_ENEMY');
    });

    it('start, stop, and destroy manage animation frames properly', () => {
      engine.start();
      expect((engine as any).animationFrameId).not.toBeNull();
      
      engine.stop();
      expect((engine as any).animationFrameId).toBeNull();
      
      engine.start();
      engine.destroy();
      expect((engine as any).animationFrameId).toBeNull();
      expect(engine.getEntities().length).toBe(0);
    });

    it('does not update game state if paused', () => {
      engine.spawnDefender(100, 100);
      engine.spawnHorde(500, 100);
      const initialDefenderX = engine.getDefenders()[0].x;
      
      engine.pause();
      // Tick loop directly
      (engine as any).loop(performance.now() + 16);
      
      expect(engine.getDefenders()[0].x).toBe(initialDefenderX); // Should not move
    });
  });
});
