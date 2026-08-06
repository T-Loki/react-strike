import type { GameEngine } from './GameEngine';

export interface WaveStrategy {
  spawnWave(engine: GameEngine, count?: number): void;
}

export class SkirmishWave implements WaveStrategy {
  spawnWave(engine: GameEngine, count: number = 10): void {
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
  spawnWave(engine: GameEngine, count: number = 5): void {
    const { width, height } = engine.getCanvasSize();
    const marginY = 80;
    const availableH = Math.max(100, height - marginY * 2);

    engine.spawnHorde(width - 100, height / 2, { name: 'Horde Behemoth', maxHp: 300, hp: 300, damage: 30, speed: 40, armor: 5 });

    const names = ['Orc Grunt', 'Shadow Warg'];
    for (let i = 0; i < count; i++) {
      const spawnX = width - 150 + Math.random() * 200;
      const spawnY = marginY + Math.random() * availableH;
      const name = names[i % names.length];
      engine.spawnHorde(spawnX, spawnY, { name });
    }
  }
}

export class EndlessDoomWave implements WaveStrategy {
  spawnWave(engine: GameEngine, count: number = 25): void {
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
