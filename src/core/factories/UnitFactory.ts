import type { Unit, UnitTemplate, BattlefieldZoneConfig } from '../../types/combat';
import { DEFAULT_BATTLEFIELD_ZONES } from '../../types/combat';

// ─── Shared Deployment Grid Constants ────────────────────────────────────────
// These constants define the grid in both the Pre-Battle UI and the battle
// canvas. Using the same pixel cell size ensures a 1:1 spatial mapping so
// adjacent cells in the deployment grid are the same distance apart in combat.
export const DEPLOY_GRID_COLS = 5;
export const DEPLOY_GRID_ROWS = 8;
export const DEPLOY_CELL_PX = 60;    // px per grid cell (both axes, square cells)
export const DEPLOY_MARGIN_X = 30;   // px from left edge of spawn zone

/** Returns the top margin (px) that centres the deployment grid vertically on the canvas. */
export const getDeployMarginY = (canvasHeight: number): number =>
  Math.max(20, (canvasHeight - DEPLOY_GRID_ROWS * DEPLOY_CELL_PX) / 2);

export class UnitFactory {
  static createDefender(x: number, y: number, template?: Partial<Unit>): Unit {
    const unitType = template?.unitType || 'common';
    const nameLower = (template?.name || '').toLowerCase();
    
    let defaultColor = '#22c55e';
    if (unitType === 'hero') {
      defaultColor = '#f59e0b';
    } else if (unitType === 'elite') {
      defaultColor = '#a855f7';
    } else if (nameLower.includes('crossbow') || nameLower.includes('archer') || nameLower.includes('range')) {
      defaultColor = '#38bdf8';
    }

    const defaultWeight = template?.weight ?? (unitType === 'hero' ? 3.0 : unitType === 'elite' ? 1.8 : 1.0);
    const defaultDamageType = template?.damageType ?? (
      unitType === 'hero' ? 'Hero' :
      (nameLower.includes('crossbow') || nameLower.includes('archer') || nameLower.includes('spearman')) ? 'Piercing' : 'Normal'
    );
    const defaultArmorType = template?.armorType ?? (
      unitType === 'hero' ? 'Hero' :
      unitType === 'elite' ? 'Heavy' : 'Medium'
    );

    return {
      id: template?.id || `defender-${Math.random().toString(36).substring(2, 9)}`,
      name: template?.name || 'Vanguard Spearman',
      hp: template?.hp ?? 120,
      maxHp: template?.maxHp ?? template?.hp ?? 120,
      damage: template?.damage ?? 15,
      armor: template?.armor ?? (unitType === 'hero' ? 8 : unitType === 'elite' ? 4 : 2),
      damageType: defaultDamageType,
      armorType: defaultArmorType,
      range: template?.range ?? (nameLower.includes('crossbow') ? 200 : 60),
      attackRange: template?.attackRange ?? template?.range ?? (nameLower.includes('crossbow') ? 200 : 60),
      attackCooldown: template?.attackCooldown ?? (nameLower.includes('crossbow') ? 1200 : 900),
      lastAttackTime: 0,
      speed: template?.speed ?? (unitType === 'hero' ? 100 : 85),
      team: 'defender',
      x,
      y,
      color: template?.color || defaultColor,
      gridPosition: template?.gridPosition,
      homeX: x,
      homeY: y,
      unitType,
      faction: template?.faction || 'pantheon',
      weight: defaultWeight,
    };
  }

  static createHorde(x: number, y: number, template?: Partial<Unit>): Unit {
    const nameLower = (template?.name || '').toLowerCase();
    const defaultWeight = template?.weight ?? (
      nameLower.includes('behemoth') ? 3.5 :
      nameLower.includes('berserker') ? 1.4 :
      nameLower.includes('warrior') ? 1.5 :
      nameLower.includes('goblin') ? 0.6 : 1.0
    );

    const defaultDamageType = template?.damageType ?? (
      nameLower.includes('behemoth') ? 'Siege' :
      (nameLower.includes('skirmisher') || nameLower.includes('goblin')) ? 'Piercing' : 'Normal'
    );
    const defaultArmorType = template?.armorType ?? (
      nameLower.includes('behemoth') ? 'Fortified' :
      nameLower.includes('warrior') ? 'Heavy' :
      (nameLower.includes('skirmisher') || nameLower.includes('warg') || nameLower.includes('berserker')) ? 'Light' : 'Medium'
    );

    return {
      id: template?.id || `horde-${Math.random().toString(36).substring(2, 9)}`,
      name: template?.name || 'Orc Grunt',
      hp: template?.hp ?? 65,
      maxHp: template?.maxHp ?? 65,
      damage: template?.damage ?? 9,
      armor: template?.armor ?? 1,
      damageType: defaultDamageType,
      armorType: defaultArmorType,
      range: template?.range ?? 35,
      attackRange: template?.attackRange ?? template?.range ?? 35,
      attackCooldown: template?.attackCooldown ?? 900,
      lastAttackTime: 0,
      speed: template?.speed ?? 70,
      team: 'horde',
      x,
      y,
      color: template?.color || '#ef4444',
      homeX: x,
      homeY: y,
      faction: template?.faction || 'horde',
      weight: defaultWeight,
    };
  }

  static fromTemplate(
    template: UnitTemplate, 
    canvasWidth: number, 
    canvasHeight: number,
    zoneConfig: BattlefieldZoneConfig = DEFAULT_BATTLEFIELD_ZONES
  ): Unit {
    const spawnZoneWidth = canvasWidth * zoneConfig.playerSpawnRatio;

    let x: number;
    let y: number;

    if (template.gridPosition) {
      const marginY = getDeployMarginY(canvasHeight);
      x = DEPLOY_MARGIN_X + (template.gridPosition.x + 0.5) * DEPLOY_CELL_PX;
      y = marginY + (template.gridPosition.y + 0.5) * DEPLOY_CELL_PX;

      x = Math.min(x, spawnZoneWidth - 20);
      y = Math.max(20, Math.min(y, canvasHeight - 20));
    } else {
      x = spawnZoneWidth * 0.5;
      y = canvasHeight * 0.5;
    }

    const nameLower = (template.name || '').toLowerCase();
    let defaultColor = template.color || '#22c55e';
    if (!template.color) {
      if (template.type === 'hero') {
        defaultColor = '#f59e0b';
      } else if (template.type === 'elite') {
        defaultColor = '#a855f7';
      } else if (nameLower.includes('crossbow') || nameLower.includes('archer')) {
        defaultColor = '#38bdf8';
      }
    }

    return UnitFactory.createDefender(x, y, {
      id: template.id,
      name: template.name,
      hp: template.hp,
      maxHp: template.maxHp || template.hp,
      damage: template.damage,
      armor: template.armor,
      damageType: template.damageType,
      armorType: template.armorType,
      range: template.range,
      attackRange: template.range,
      speed: template.speed,
      color: defaultColor,
      gridPosition: template.gridPosition,
      unitType: template.type,
      faction: (template.faction as 'pantheon' | 'horde') || 'pantheon',
      weight: template.weight,
    });
  }
}
