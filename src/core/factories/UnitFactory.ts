import type { Unit, UnitTemplate, BattlefieldZoneConfig } from '../../types/combat';
import { DEFAULT_BATTLEFIELD_ZONES } from '../../types/combat';

export class UnitFactory {
  static createDefender(x: number, y: number, template?: Partial<Unit>): Unit {
    const unitType = (template as Partial<UnitTemplate>)?.type || 'common';
    const nameLower = (template?.name || '').toLowerCase();
    
    let defaultColor = '#22c55e';
    if (unitType === 'hero' || nameLower.includes('aric') || nameLower.includes('hero')) {
      defaultColor = '#f59e0b';
    } else if (unitType === 'elite') {
      defaultColor = '#a855f7';
    } else if (nameLower.includes('crossbow') || nameLower.includes('archer') || nameLower.includes('range')) {
      defaultColor = '#38bdf8';
    }

    return {
      id: template?.id || `defender-${Math.random().toString(36).substring(2, 9)}`,
      name: template?.name || 'Vanguard Spearman',
      hp: template?.hp ?? 120,
      maxHp: template?.maxHp ?? template?.hp ?? 120,
      damage: template?.damage ?? 15,
      armor: template?.armor ?? (unitType === 'hero' ? 8 : unitType === 'elite' ? 4 : 2),
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
    };
  }

  static createHorde(x: number, y: number, template?: Partial<Unit>): Unit {
    return {
      id: template?.id || `horde-${Math.random().toString(36).substring(2, 9)}`,
      name: template?.name || 'Orc Grunt',
      hp: template?.hp ?? 65,
      maxHp: template?.maxHp ?? 65,
      damage: template?.damage ?? 9,
      armor: template?.armor ?? 1,
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
    };
  }

  static fromTemplate(
    template: UnitTemplate, 
    canvasWidth: number, 
    canvasHeight: number,
    zoneConfig: BattlefieldZoneConfig = DEFAULT_BATTLEFIELD_ZONES
  ): Unit {
    // Player Spawn Zone (default: 0% to 30% of canvas width)
    const spawnZoneWidth = canvasWidth * zoneConfig.playerSpawnRatio;
    let x = spawnZoneWidth * 0.5;
    let y = canvasHeight * 0.5;

    if (template.gridPosition) {
      const gridCols = 8;
      const gridRows = 6;
      const marginX = 40;
      const marginY = 80;
      const availableW = Math.max(100, spawnZoneWidth - marginX * 2);
      const availableH = Math.max(100, canvasHeight - marginY * 2);
      
      const cellW = availableW / gridCols;
      const cellH = availableH / gridRows;

      x = marginX + (template.gridPosition.x + 0.5) * cellW;
      y = marginY + (template.gridPosition.y + 0.5) * cellH;
    }

    const nameLower = (template.name || '').toLowerCase();
    let defaultColor = '#22c55e';
    if (template.type === 'hero' || nameLower.includes('aric')) {
      defaultColor = '#f59e0b';
    } else if (template.type === 'elite') {
      defaultColor = '#a855f7';
    } else if (nameLower.includes('crossbow') || nameLower.includes('archer')) {
      defaultColor = '#38bdf8';
    }

    return UnitFactory.createDefender(x, y, {
      id: template.id,
      name: template.name,
      hp: template.hp,
      maxHp: template.maxHp || template.hp,
      damage: template.damage,
      range: template.range,
      attackRange: template.range,
      color: defaultColor,
      gridPosition: template.gridPosition,
    });
  }
}
