import type { Unit, BattlefieldZoneConfig } from '../../types/combat';
import { DEFAULT_BATTLEFIELD_ZONES } from '../../types/combat';
import { getDistance, getDirection } from '../math/utils';

export interface SimulationContext {
  canvasWidth: number;
  canvasHeight: number;
  defenders: UnitEntity[];
  horde: UnitEntity[];
  onDealDamage: (attacker: Unit, target: Unit, damage: number) => void;
  now: number;
  zoneConfig?: BattlefieldZoneConfig;
}

export interface UnitBehaviorState {
  name: string;
  update(entity: UnitEntity, deltaTimeSec: number, context?: SimulationContext): void;
}



export class DefenderHoldState implements UnitBehaviorState {
  name = 'DefenderHold';

  update(entity: UnitEntity, deltaTimeSec: number, context?: SimulationContext): void {
    const unit = entity.data;
    if (!context) return;

    const zoneConfig = context.zoneConfig || DEFAULT_BATTLEFIELD_ZONES;
    const playerAreaWidth = context.canvasWidth * zoneConfig.playerAreaRatio;

    // Scan for breached Horde units entering Player Area (x <= 35% width)
    const breachedEnemies = context.horde.filter(
      h => h.data.hp > 0 && h.data.x <= playerAreaWidth
    );

    if (breachedEnemies.length > 0) {
      entity.setState(new DefenderEngageState());
      entity.update(deltaTimeSec, context);
      return;
    }

    // Return to home position if set and not engaged
    if (unit.homeX !== undefined && unit.homeY !== undefined) {
      const { dx, dy, dist } = getDirection(unit.x, unit.y, unit.homeX, unit.homeY);
      if (dist > 5) {
        const moveDist = unit.speed * deltaTimeSec;
        unit.x += dx * moveDist;
        unit.y += dy * moveDist;
      }
    }
  }
}

export class DefenderEngageState implements UnitBehaviorState {
  name = 'DefenderEngage';

  update(entity: UnitEntity, deltaTimeSec: number, context?: SimulationContext): void {
    const unit = entity.data;
    if (!context) return;

    const zoneConfig = context.zoneConfig || DEFAULT_BATTLEFIELD_ZONES;
    const playerAreaWidth = context.canvasWidth * zoneConfig.playerAreaRatio;

    let nearestTarget: UnitEntity | null = null;
    let minDist = Infinity;

    context.horde.forEach(h => {
      if (h.data.hp > 0 && h.data.x <= playerAreaWidth + 30) {
        const dist = getDistance(unit.x, unit.y, h.data.x, h.data.y);
        if (dist < minDist) {
          minDist = dist;
          nearestTarget = h;
        }
      }
    });

    if (!nearestTarget) {
      unit.targetId = undefined;
      entity.setState(new DefenderHoldState());
      return;
    }

    const targetUnit = (nearestTarget as UnitEntity).data;
    unit.targetId = targetUnit.id;

    if (minDist <= unit.attackRange) {
      entity.setState(new AttackState(targetUnit.id));
      entity.update(deltaTimeSec, context);
      return;
    }

    const moveDist = unit.speed * deltaTimeSec;
    const { dx, dy } = getDirection(unit.x, unit.y, targetUnit.x, targetUnit.y);

    unit.x += dx * moveDist;
    unit.y += dy * moveDist;
  }
}

export class HordeMarchState implements UnitBehaviorState {
  name = 'HordeMarch';

  update(entity: UnitEntity, deltaTimeSec: number, context?: SimulationContext): void {
    const unit = entity.data;
    if (!context) {
      unit.x -= deltaTimeSec * 50;
      return;
    }

    let nearestTarget: UnitEntity | null = null;
    let minDist = Infinity;

    context.defenders.forEach(d => {
      if (d.data.hp > 0) {
        const dist = getDistance(unit.x, unit.y, d.data.x, d.data.y);
        if (dist < minDist) {
          minDist = dist;
          nearestTarget = d;
        }
      }
    });

    if (nearestTarget) {
      const targetUnit = (nearestTarget as UnitEntity).data;
      unit.targetId = targetUnit.id;

      if (minDist <= unit.attackRange) {
        entity.setState(new AttackState(targetUnit.id));
        entity.update(deltaTimeSec, context);
        return;
      }

      const moveDist = unit.speed * deltaTimeSec;
      const { dx, dy } = getDirection(unit.x, unit.y, targetUnit.x, targetUnit.y);

      unit.x += dx * moveDist;
      unit.y += dy * moveDist;
    } else {
      unit.targetId = undefined;
      unit.x -= unit.speed * deltaTimeSec;
    }
  }
}

export class AttackState implements UnitBehaviorState {
  name = 'Attack';
  private targetId: string;

  constructor(targetId: string) {
    this.targetId = targetId;
  }

  update(entity: UnitEntity, _deltaTimeSec: number, context?: SimulationContext): void {
    const unit = entity.data;
    if (!context) return;

    const targets = unit.team === 'defender' ? context.horde : context.defenders;
    const targetEntity = targets.find(t => t.data.id === this.targetId && t.data.hp > 0);

    if (!targetEntity) {
      unit.targetId = undefined;
      unit.isAttacking = false;
      this.returnToMovementState(entity);
      return;
    }

    const targetUnit = targetEntity.data;
    const dist = getDistance(unit.x, unit.y, targetUnit.x, targetUnit.y);

    if (dist > unit.attackRange + 15) {
      unit.targetId = undefined;
      unit.isAttacking = false;
      this.returnToMovementState(entity);
      return;
    }

    unit.isAttacking = true;

    if (context.now - unit.lastAttackTime >= unit.attackCooldown) {
      unit.lastAttackTime = context.now;
      unit.attackAnimTimer = 150;

      const rawDamage = isNaN(unit.damage) ? 0 : unit.damage;
      const targetArmor = isNaN(targetUnit.armor || 0) ? 0 : (targetUnit.armor || 0);
      const actualDamage = Math.max(1, rawDamage - targetArmor);

      context.onDealDamage(unit, targetUnit, actualDamage);
    }
  }

  private returnToMovementState(entity: UnitEntity) {
    if (entity.data.team === 'defender') {
      entity.setState(new DefenderEngageState());
    } else {
      entity.setState(new HordeMarchState());
    }
  }
}

export class IdleState implements UnitBehaviorState {
  name = 'Idle';
  update(): void {}
}

export class MoveState implements UnitBehaviorState {
  name = 'Move';
  update(entity: UnitEntity, deltaTimeSec: number): void {
    if (entity.data.team === 'horde') {
      entity.data.x -= deltaTimeSec * 50;
    }
  }
}

export class UnitEntity {
  public data: Unit;
  private state: UnitBehaviorState;

  constructor(data: Unit, initialState?: UnitBehaviorState) {
    this.data = data;
    if (data.homeX === undefined) this.data.homeX = data.x;
    if (data.homeY === undefined) this.data.homeY = data.y;

    if (initialState) {
      this.state = initialState;
    } else if (data.team === 'defender') {
      this.state = new DefenderHoldState();
    } else {
      this.state = new HordeMarchState();
    }
  }

  getStateName(): string {
    return this.state.name;
  }

  setState(newState: UnitBehaviorState) {
    this.state = newState;
  }

  update(deltaTimeMs: number, context?: SimulationContext) {
    const deltaTimeSec = deltaTimeMs / 1000;

    if (this.data.attackAnimTimer && this.data.attackAnimTimer > 0) {
      this.data.attackAnimTimer = Math.max(0, this.data.attackAnimTimer - deltaTimeMs);
      if (this.data.attackAnimTimer === 0) {
        this.data.isAttacking = false;
      }
    }

    this.state.update(this, deltaTimeSec, context);

    if (context) {
      this.clampPosition(context.canvasWidth, context.canvasHeight, context.zoneConfig);
    }
  }

  clampPosition(
    canvasWidth: number, 
    canvasHeight: number, 
    zoneConfig: BattlefieldZoneConfig = DEFAULT_BATTLEFIELD_ZONES
  ) {
    const marginY = 30;
    const marginX = 15;

    this.data.y = Math.max(marginY, Math.min(canvasHeight - marginY, this.data.y));

    if (this.data.team === 'defender') {
      // Clamped strictly to Player Area (default: 35% of canvas width)
      const defenderMaxX = canvasWidth * zoneConfig.playerAreaRatio;
      this.data.x = Math.max(marginX, Math.min(defenderMaxX, this.data.x));
    } else {
      // Horde area & neutral area (0 to canvasWidth)
      this.data.x = Math.max(marginX, Math.min(canvasWidth - marginX, this.data.x));
    }
  }
}
