import { describe, it, expect } from 'vitest';
import { getSelectedUnitAtCoordinates } from '../core/math/canvasSelection';
import { UnitEntity } from '../core/entities/UnitEntity';
import { UnitFactory } from '../core/factories/UnitFactory';

describe('Canvas Selection', () => {
  it('returns null if no entities provided', () => {
    expect(getSelectedUnitAtCoordinates(100, 100, [])).toBeNull();
  });

  it('finds unit exactly at coordinates', () => {
    const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
    const result = getSelectedUnitAtCoordinates(100, 100, [defender]);
    expect(result?.unit.id).toBe(defender.data.id);
  });

  it('ignores dead units', () => {
    const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
    defender.data.hp = 0;
    const result = getSelectedUnitAtCoordinates(100, 100, [defender]);
    expect(result).toBeNull();
  });

  it('returns null if click is outside radius', () => {
    const defender = new UnitEntity(UnitFactory.createDefender(100, 100));
    // Default radius is 25, 100+30=130
    const result = getSelectedUnitAtCoordinates(130, 100, [defender]);
    expect(result).toBeNull();
  });

  it('selects the closest unit when multiple are within radius', () => {
    const d1 = new UnitEntity(UnitFactory.createDefender(100, 100));
    const d2 = new UnitEntity(UnitFactory.createDefender(110, 100));
    
    // Click at 110, 100. Both are within 25px radius, but d2 is exactly on it (dist 0), d1 is 10px away
    const result = getSelectedUnitAtCoordinates(110, 100, [d1, d2]);
    expect(result?.unit.id).toBe(d2.data.id);
  });
});
