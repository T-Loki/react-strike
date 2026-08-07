import type { Unit } from '../../types/combat';
import { getDistance } from './utils';
import type { UnitEntity } from '../entities/UnitEntity';

export const getSelectedUnitAtCoordinates = (
  clickX: number, 
  clickY: number, 
  entities: UnitEntity[], 
  clickRadius: number = 25
): { unit: Unit; stateName: string } | null => {
  let clicked: { unit: Unit; stateName: string } | null = null;
  let minDist = clickRadius;

  entities.forEach(ent => {
    if (ent.data.hp > 0) {
      const dist = getDistance(ent.data.x, ent.data.y, clickX, clickY);
      if (dist < minDist) {
        minDist = dist;
        clicked = { unit: ent.data, stateName: ent.getStateName() };
      }
    }
  });

  return clicked;
};
