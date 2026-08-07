import { EventBus } from '../events/EventBus';
import type { Unit, DamageText, AttackEffect, BattlePhase, UnitTemplate, BattlefieldZoneConfig } from '../../types/combat';
import { DEFAULT_BATTLEFIELD_ZONES } from '../../types/combat';
import { UnitEntity, type SimulationContext } from '../entities/UnitEntity';
import { UnitFactory } from '../factories/UnitFactory';
import { FACTIONS } from '../../data/units';
import { type WaveStrategy, SkirmishWave } from './WaveStrategy';
import { DEPLOY_GRID_COLS } from '../factories/UnitFactory';
import { getDirection } from '../math/utils';

export class GameEngine {
  private static instance: GameEngine;
  public events: EventBus;
  
  private entities: UnitEntity[] = [];
  private damageTexts: DamageText[] = [];
  private attackEffects: AttackEffect[] = [];
  
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private isPaused: boolean = false;
  private gameSpeed: number = 1.0;
  private isSurrendered: boolean = false;

  private canvasWidth: number = typeof window !== 'undefined' ? window.innerWidth : 1280;
  private canvasHeight: number = typeof window !== 'undefined' ? window.innerHeight : 720;
  private battlePhase: BattlePhase = 'HOLDING_POSITION';
  private zoneConfig: BattlefieldZoneConfig = DEFAULT_BATTLEFIELD_ZONES;

  private constructor() {
    this.events = new EventBus();
  }

  public static getInstance(): GameEngine {
    if (!GameEngine.instance) {
      GameEngine.instance = new GameEngine();
    }
    return GameEngine.instance;
  }

  /** Test-only method to fully reset the singleton state and prevent test pollution */
  public static resetInstance(): void {
    if (GameEngine.instance) {
      GameEngine.instance.destroy();
    }
    GameEngine.instance = new GameEngine();
  }

  public setCanvasSize(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  public getCanvasSize(): { width: number; height: number } {
    return { width: this.canvasWidth, height: this.canvasHeight };
  }

  public setZoneConfig(config: BattlefieldZoneConfig): void {
    this.zoneConfig = config;
  }

  public getZoneConfig(): BattlefieldZoneConfig {
    return this.zoneConfig;
  }

  public getEntities(): UnitEntity[] {
    return this.entities;
  }

  public getDefenders(): Unit[] {
    return this.entities.filter(e => e.data.team === 'defender' && e.data.hp > 0).map(e => e.data);
  }

  public getHorde(): Unit[] {
    return this.entities.filter(e => e.data.team === 'horde' && e.data.hp > 0).map(e => e.data);
  }

  public getDamageTexts(): DamageText[] {
    return this.damageTexts;
  }

  public getAttackEffects(): AttackEffect[] {
    return this.attackEffects;
  }

  public getBattlePhase(): BattlePhase {
    if (this.isPaused) return 'PAUSED';
    return this.battlePhase;
  }

  public spawnDefender(x: number, y: number, template?: Partial<Unit>): void {
    const data = UnitFactory.createDefender(x, y, template);
    this.entities.push(new UnitEntity(data));
    this.events.emit('spawn', data);
  }

  public spawnHorde(x: number, y: number, template?: Partial<Unit>): void {
    const data = UnitFactory.createHorde(x, y, template);
    this.entities.push(new UnitEntity(data));
    this.events.emit('spawn', data);
  }

  public loadFormation(templates: UnitTemplate[]): void {
    this.clearBoard();
    const sourceTemplates = templates.length > 0 ? templates : FACTIONS.pantheon.roster;

    const usedCoords = new Set<string>();
    sourceTemplates.forEach(t => {
      if (t.gridPosition) {
        usedCoords.add(`${t.gridPosition.x},${t.gridPosition.y}`);
      }
    });

    let autoX = 0;
    let autoY = 0;
    const findNextAvailablePos = () => {
      while (usedCoords.has(`${autoX},${autoY}`)) {
        autoX++;
        if (autoX >= DEPLOY_GRID_COLS) {
          autoX = 0;
          autoY++;
        }
      }
      const pos = { x: autoX, y: autoY };
      usedCoords.add(`${autoX},${autoY}`);
      return pos;
    };

    sourceTemplates.forEach(tmpl => {
      const gridPos = tmpl.gridPosition || findNextAvailablePos();
      const defenderUnit = UnitFactory.fromTemplate({ ...tmpl, gridPosition: gridPos }, this.canvasWidth, this.canvasHeight, this.zoneConfig);
      this.entities.push(new UnitEntity(defenderUnit));
    });
  }

  public spawnHordeWave(strategy?: WaveStrategy, count?: number): void {
    const waveStrategy = strategy || new SkirmishWave();
    waveStrategy.spawnWave(this, count);
  }

  public clearBoard(): void {
    this.entities = [];
    this.damageTexts = [];
    this.attackEffects = [];
    this.isSurrendered = false;
    this.battlePhase = 'HOLDING_POSITION';
    this.events.emit('clear');
  }

  public start(): void {
    if (this.animationFrameId !== null) return;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public pause(): void {
    this.isPaused = true;
    this.events.emit('pause');
  }

  public resume(): void {
    this.isPaused = false;
    this.lastTime = performance.now();
    this.events.emit('resume');
  }

  public togglePause(): void {
    if (this.isPaused) this.resume();
    else this.pause();
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  private handleDealDamage = (attacker: Unit, target: Unit, damage: number) => {
    if (isNaN(damage) || damage < 0) damage = 0;
    if (isNaN(target.hp)) target.hp = 0;
    target.hp = Math.max(0, target.hp - damage);

    this.damageTexts.push({
      id: `dmg-${Math.random().toString(36).substring(2, 9)}`,
      x: target.x + (Math.random() * 16 - 8),
      y: target.y - 12,
      text: `-${damage}`,
      opacity: 1.0,
      color: attacker.team === 'defender' ? '#fef08a' : '#f87171',
      lifetime: 0,
      maxLifetime: 800,
    });

    this.attackEffects.push({
      id: `eff-${Math.random().toString(36).substring(2, 9)}`,
      startX: attacker.x,
      startY: attacker.y,
      endX: target.x,
      endY: target.y,
      duration: 120,
      maxDuration: 120,
      color: attacker.team === 'defender' ? '#38bdf8' : '#ef4444',
    });

    if (target.hp <= 0) {
      this.events.emit('death', target);
    }
  };

  public getGameSpeed(): number {
    return this.gameSpeed;
  }

  public setGameSpeed(speed: number): void {
    this.gameSpeed = speed;
  }

  public surrenderBattle(): void {
    this.isSurrendered = true;
    this.battlePhase = 'SURRENDERED';
    this.events.emit('tick', { deltaTime: 0 });
  }

  private loop = (time: number) => {
    const rawDelta = time - this.lastTime;
    this.lastTime = time;

    const clampedDelta = Math.min(rawDelta, 100);
    const deltaTime = clampedDelta * this.gameSpeed;

    if (!this.isPaused) {
      this.update(deltaTime, time);
    }

    this.events.emit('tick', { deltaTime });
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private resolveUnitCollisions(): void {
    const activeEntities = this.entities.filter(e => e.data.hp > 0);
    const count = activeEntities.length;

    for (let iter = 0; iter < 2; iter++) {
      for (let i = 0; i < count; i++) {
        const u1 = activeEntities[i];
        const isHero1 = u1.data.unitType === 'hero';
        const r1 = isHero1 ? 16 : 10;
        const w1 = u1.data.weight || (isHero1 ? 3.0 : 1.0);

        for (let j = i + 1; j < count; j++) {
          const u2 = activeEntities[j];
          const isHero2 = u2.data.unitType === 'hero';
          const r2 = isHero2 ? 16 : 10;
          const w2 = u2.data.weight || (isHero2 ? 3.0 : 1.0);

          const minDist = r1 + r2 + 4;
          let { dx, dy, dist } = getDirection(u2.data.x, u2.data.y, u1.data.x, u1.data.y);

          if (dist < minDist) {
            if (dist === 0) {
              const angle = Math.random() * Math.PI * 2;
              dx = Math.cos(angle);
              dy = Math.sin(angle);
              dist = 1;
            }

            const overlap = minDist - dist;
            const totalWeight = w1 + w2;

            // Mass-weighted pushing: heavier unit moves less, lighter unit absorbs more displacement
            const u1Share = w2 / totalWeight;
            const u2Share = w1 / totalWeight;

            u1.data.x += dx * overlap * u1Share;
            u1.data.y += dy * overlap * u1Share;

            u2.data.x -= dx * overlap * u2Share;
            u2.data.y -= dy * overlap * u2Share;
          }
        }
      }

      activeEntities.forEach(e => e.clampPosition(this.canvasWidth, this.canvasHeight, this.zoneConfig));
    }
  }

  private update(deltaTime: number, now: number): void {
    if (this.isSurrendered) {
      this.battlePhase = 'SURRENDERED';
      return;
    }

    const defenders = this.entities.filter(e => e.data.team === 'defender' && e.data.hp > 0);
    const horde = this.entities.filter(e => e.data.team === 'horde' && e.data.hp > 0);

    const context: SimulationContext = {
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      defenders,
      horde,
      onDealDamage: this.handleDealDamage,
      now,
      zoneConfig: this.zoneConfig,
    };

    this.entities.forEach(entity => {
      if (entity.data.hp > 0) {
        entity.update(deltaTime, context);
      }
    });

    this.resolveUnitCollisions();

    this.entities = this.entities.filter(e => e.data.hp > 0);

    const deltaTimeSec = deltaTime / 1000;
    this.damageTexts.forEach(dt => {
      dt.lifetime += deltaTime;
      dt.y -= 25 * deltaTimeSec;
      dt.opacity = Math.max(0, 1 - dt.lifetime / dt.maxLifetime);
    });
    this.damageTexts = this.damageTexts.filter(dt => dt.lifetime < dt.maxLifetime);

    this.attackEffects.forEach(eff => {
      eff.duration -= deltaTime;
    });
    this.attackEffects = this.attackEffects.filter(eff => eff.duration > 0);

    const activeDefenders = this.entities.filter(e => e.data.team === 'defender');
    const activeHorde = this.entities.filter(e => e.data.team === 'horde');
    const engageZoneWidth = this.canvasWidth * this.zoneConfig.playerAreaRatio;
    const hasBreachedHorde = activeHorde.some(h => h.data.x <= engageZoneWidth);
    const hasReachedLeftEdge = activeHorde.some(h => h.data.x <= 25);

    if ((activeDefenders.length === 0 && activeHorde.length > 0) || hasReachedLeftEdge) {
      this.battlePhase = 'DEFEAT';
    } else if (activeDefenders.length > 0 && activeHorde.length === 0) {
      this.battlePhase = 'VICTORY';
    } else if (hasBreachedHorde) {
      this.battlePhase = 'ENGAGING_ENEMY';
    } else {
      this.battlePhase = 'HOLDING_POSITION';
    }
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.events.clear();
    this.entities = [];
    this.damageTexts = [];
    this.attackEffects = [];
  }
}
