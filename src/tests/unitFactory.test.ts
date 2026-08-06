import { describe, it, expect } from 'vitest';
import { UnitFactory } from '../core/factories/UnitFactory';

describe('UnitFactory', () => {
  it('creates a defender with default properties', () => {
    const defender = UnitFactory.createDefender(100, 100);
    expect(defender.team).toBe('defender');
    expect(defender.name).toBe('Vanguard Spearman');
    expect(defender.hp).toBe(120);
    expect(defender.maxHp).toBe(120);
    expect(defender.x).toBe(100);
    expect(defender.y).toBe(100);
    expect(defender.color).toBe('#22c55e');
  });

  it('creates a horde with default properties', () => {
    const horde = UnitFactory.createHorde(500, 100);
    expect(horde.team).toBe('horde');
    expect(horde.name).toBe('Orc Grunt');
    expect(horde.hp).toBe(65);
    expect(horde.maxHp).toBe(65);
    expect(horde.x).toBe(500);
    expect(horde.y).toBe(100);
    expect(horde.color).toBe('#ef4444');
  });

  it('overrides default properties with provided template', () => {
    const defender = UnitFactory.createDefender(100, 100, {
      name: 'Custom Hero',
      hp: 500,
      maxHp: 500,
      damage: 100,
      color: '#ffffff'
    });
    expect(defender.name).toBe('Custom Hero');
    expect(defender.hp).toBe(500);
    expect(defender.maxHp).toBe(500);
    expect(defender.damage).toBe(100);
    expect(defender.color).toBe('#ffffff');
    expect(defender.team).toBe('defender'); // Should still enforce team
  });

  it('creates from template object correctly', () => {
    const template = {
      id: 'template-1',
      name: 'Template Defender',
      type: 'common' as const,
      hp: 150,
      maxHp: 150,
      damage: 20,
      range: 50,
      attackSpeed: 1.2,
      cost: 100,
      abilities: []
    };
    
    // Simulate a canvas of 1000x500 and zone config default
    const unit = UnitFactory.fromTemplate(template, 1000, 500);
    expect(unit.name).toBe('Template Defender');
    expect(unit.hp).toBe(150);
    expect(unit.team).toBe('defender');
    expect(unit.id).toBeDefined();
    // Default position is usually calculated using gridPosition or random inside player area
    expect(unit.x).toBeGreaterThanOrEqual(0);
  });

  it('correctly applies hero properties regardless of name', () => {
    const heroTemplate = {
      id: 'hero-2',
      name: 'Valeria the Swift', // not named Aric
      type: 'hero' as const,
      hp: 400,
      maxHp: 400,
      damage: 50,
      range: 50,
      attackSpeed: 1.5,
      cost: 400,
      abilities: []
    };
    
    const unit = UnitFactory.fromTemplate(heroTemplate, 1000, 500);
    expect(unit.unitType).toBe('hero');
    expect(unit.armor).toBe(8); // hero default
    expect(unit.speed).toBe(100); // hero default
    expect(unit.color).toBe('#f59e0b'); // hero default color
  });
});
