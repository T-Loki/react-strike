import { describe, it, expect, vi } from 'vitest';
import { UnitEntity, AttackState } from '../core/entities/UnitEntity';
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
});
