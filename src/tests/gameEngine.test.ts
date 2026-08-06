import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../core/engine/GameEngine';

describe('GameEngine Integration Tests', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = GameEngine.getInstance();
    engine.clearBoard();
    if (engine.getIsPaused()) {
      engine.resume();
    }
    engine.setGameSpeed(1.0);
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
});
