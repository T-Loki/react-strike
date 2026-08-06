import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../core/engine/GameEngine';
import { EndlessDoomWave, MidBossWave, SkirmishWave } from '../core/engine/WaveStrategy';

describe('WaveStrategy', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = GameEngine.getInstance();
    engine.clearBoard();
    engine.setCanvasSize(1000, 500); // Known canvas size for predictability
  });

  it('SkirmishWave spawns the correct number of enemies', () => {
    const wave = new SkirmishWave();
    wave.spawnWave(engine, 10);
    
    const horde = engine.getHorde();
    expect(horde.length).toBe(10);
    
    // Check that enemies spawn on the right side of the screen
    horde.forEach(h => {
      expect(h.x).toBeGreaterThan(800); // width - 150 + random
    });
  });

  it('MidBossWave spawns the behemoth and minions', () => {
    const wave = new MidBossWave();
    wave.spawnWave(engine, 5); // 5 minions + 1 boss = 6
    
    const horde = engine.getHorde();
    expect(horde.length).toBe(6);
    
    const bosses = horde.filter(h => h.name === 'Horde Behemoth');
    expect(bosses.length).toBe(1);
    expect(bosses[0].hp).toBe(300);
  });

  it('EndlessDoomWave spawns high health late-game enemies', () => {
    const wave = new EndlessDoomWave();
    wave.spawnWave(engine, 25);
    
    const horde = engine.getHorde();
    expect(horde.length).toBe(25);
    
    // Endless doom enforces a minimum 80hp on spawned units
    horde.forEach(h => {
      expect(h.hp).toBeGreaterThanOrEqual(80);
    });
  });
});
