import { describe, it, expect, vi } from 'vitest';
import { UnitEntity, AttackState, IdleState, MoveState } from '../core/entities/UnitEntity';
import { UnitFactory } from '../core/factories/UnitFactory';

describe('UnitEntity State Transitions', () => {
  it('initializes with correct default state based on team', () => {
    const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
    expect(defender.getStateName()).toBe('DefenderHold');

    const horde = new UnitEntity(UnitFactory.createHorde(500, 100));
    expect(horde.getStateName()).toBe('HordeMarch');
  });

  it('DefenderHoldState transitions to DefenderEngageState when horde breaches player area', () => {
    const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
    const horde = new UnitEntity(UnitFactory.createHorde(350, 100)); // Within 40% of 1000px canvas (400)
    
    const context = {
      canvasWidth: 1000,
      canvasHeight: 500,
      defenders: [defender],
      horde: [horde],
      onDealDamage: vi.fn(),
      now: 0
    };

    // Update will trigger the state transition
    defender.update(16, context);
    expect(defender.getStateName()).toBe('DefenderEngage');
  });

  it('HordeMarchState transitions to AttackState when close to defender', () => {
    const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
    const horde = new UnitEntity(UnitFactory.createHorde(130, 100)); 
    horde.data.attackRange = 40; // Horde is 30px away, within 40px range

    const context = {
      canvasWidth: 1000,
      canvasHeight: 500,
      defenders: [defender],
      horde: [horde],
      onDealDamage: vi.fn(),
      now: 0
    };

    horde.update(16, context);
    expect(horde.getStateName()).toBe('Attack');
    expect(horde.data.targetId).toBe(defender.data.id);
  });

  it('AttackState triggers damage callback on cooldown completion', () => {
    const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
    const horde = new UnitEntity(UnitFactory.createHorde(120, 100)); 
    
    defender.data.attackCooldown = 1000;
    defender.data.lastAttackTime = 0;
    defender.setState(new AttackState(horde.data.id));

    const onDealDamage = vi.fn();
    const context = {
      canvasWidth: 1000,
      canvasHeight: 500,
      defenders: [defender],
      horde: [horde],
      onDealDamage,
      now: 1000 // Exact time for cooldown
    };

    defender.update(16, context);
    expect(onDealDamage).toHaveBeenCalledTimes(1);
    expect(onDealDamage).toHaveBeenCalledWith(defender.data, horde.data, expect.any(Number));
    expect(defender.data.lastAttackTime).toBe(1000); // Cooldown resets
  });

  it('AttackState reverts to move state if target is out of range', () => {
    const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
    const horde = new UnitEntity(UnitFactory.createHorde(500, 100)); 
    
    defender.data.attackRange = 40;
    defender.setState(new AttackState(horde.data.id));

    const context = {
      canvasWidth: 1000,
      canvasHeight: 500,
      defenders: [defender],
      horde: [horde],
      onDealDamage: vi.fn(),
      now: 0
    };

    defender.update(16, context);
    expect(defender.getStateName()).toBe('DefenderEngage');
  });

  it('Death removes unit from active processing logic indirectly by HP check in Engine (Entity test just holds state)', () => {
    const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
    defender.data.hp = 0;
    // We expect engine to handle filtering, so entity itself just exists with 0 hp
    expect(defender.data.hp).toBe(0);
  });

  describe('Edge cases and boundary conditions', () => {
    it('initializes with a provided initialState if given', () => {
      const data = UnitFactory.createDefender(100, 100);
      const entity = new UnitEntity(data, new AttackState('dummy'));
      expect(entity.getStateName()).toBe('Attack');
    });

    it('DefenderHoldState does nothing if context is missing', () => {
      const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
      defender.data.x = 50;
      defender.update(16, undefined);
      expect(defender.data.x).toBe(50); // Did not move
    });

    it('DefenderEngageState returns to HoldState if context is missing or target lost', () => {
      const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
      defender.setState(new AttackState('lost-target')); // Will revert on update
      
      const context = {
        canvasWidth: 1000, canvasHeight: 500, defenders: [defender], horde: [], onDealDamage: vi.fn(), now: 0
      };
      
      // Attempting to attack a missing target should revert to DefenderEngageState.
      defender.update(16, context);
      expect(defender.getStateName()).toBe('DefenderEngage');
      
      // And then since there are no horde units, DefenderEngageState should revert to DefenderHoldState on next tick.
      defender.update(16, context);
      expect(defender.getStateName()).toBe('DefenderHold');
    });

    it('HordeMarchState moves left if context is missing', () => {
      const horde = new UnitEntity(UnitFactory.createHorde(500, 100));
      horde.update(1000, undefined); // 1 second
      expect(horde.data.x).toBe(450); // 500 - 50 * 1s
    });

    it('HordeMarchState moves left if no defenders exist', () => {
      const horde = new UnitEntity(UnitFactory.createHorde(500, 100));
      const context = {
        canvasWidth: 1000, canvasHeight: 500, defenders: [], horde: [horde], onDealDamage: vi.fn(), now: 0
      };
      horde.update(1000, context); // 1 second
      expect(horde.data.x).toBeLessThan(500); 
    });

    it('AttackState reverts to HordeMarchState if target is out of range for horde', () => {
      const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
      const horde = new UnitEntity(UnitFactory.createHorde(500, 100));
      horde.setState(new AttackState(defender.data.id));

      const context = {
        canvasWidth: 1000, canvasHeight: 500, defenders: [defender], horde: [horde], onDealDamage: vi.fn(), now: 0
      };

      horde.update(16, context);
      expect(horde.getStateName()).toBe('HordeMarch');
    });

    it('HordeMarchState moves toward defender if outside attack range', () => {
      const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
      const horde = new UnitEntity(UnitFactory.createHorde(200, 100));
      horde.data.attackRange = 20; // 100px away, range is 20
      horde.data.speed = 50;

      const context = {
        canvasWidth: 1000, canvasHeight: 500, defenders: [defender], horde: [horde], onDealDamage: vi.fn(), now: 0
      };

      horde.update(1000, context); // 1 second
      expect(horde.getStateName()).toBe('HordeMarch');
      expect(horde.data.x).toBe(150); // Moved 50px closer
    });

    it('IdleState and MoveState perform their basic operations', () => {
      const entity = new UnitEntity(UnitFactory.createHorde(500, 100));
      
      const moveState = new MoveState();
      entity.setState(moveState);
      entity.update(1000, undefined);
      expect(entity.data.x).toBe(450); // Horde MoveState moves left by 50 * dt

      const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
      defender.setState(moveState);
      defender.update(1000, undefined);
      expect(defender.data.x).toBe(100); // Defender MoveState does nothing

      const idleState = new IdleState();
      entity.setState(idleState);
      entity.update(1000, undefined);
      expect(entity.data.x).toBe(450); // unchanged
    });

    it('Animation reset timer edge case (POTENTIAL BUG FLAG)', () => {
      const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
      defender.data.attackAnimTimer = 50;
      defender.data.isAttacking = true;

      // Update with a delta that perfectly zeroes or exceeds the timer
      defender.update(60, undefined); 
      
      // Expected behavior from current code: timer goes to 0, isAttacking goes to false.
      expect(defender.data.attackAnimTimer).toBe(0);
      
      // FLAG: If a unit is in AttackState, AttackState.update immediately sets `isAttacking = true` 
      // every frame regardless of the timer, overwriting this logic. This test captures the timer reset 
      // when out of AttackState or if context is missing, but highlights the conflicting logic in AttackState.
      expect(defender.data.isAttacking).toBe(false);
    });
  });
});
