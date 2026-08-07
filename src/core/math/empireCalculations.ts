import type { Territory, UnitTemplate } from '../../types/combat';

export type UnitStack = {
  name: string;
  type: string;
  hp: number;
  damage: number;
  range: number;
  units: UnitTemplate[];
};

export const getActiveTerritories = (territories: Territory[]): Territory[] => 
  territories.filter(t => !t.isScorched);

export const getScorchedTerritories = (territories: Territory[]): Territory[] => 
  territories.filter(t => t.isScorched);

export const getFrontlineTerritories = (territories: Territory[]): Territory[] => 
  territories.filter(t => t.hasActiveBattle && !t.isScorched);

export const calculateTotalGoldYield = (territories: Territory[]): number => 
  getActiveTerritories(territories).reduce((acc, t) => acc + t.resourceYield, 0);

export const calculateTotalFaithYield = (territories: Territory[]): number => 
  getActiveTerritories(territories).reduce((acc, t) => acc + (t.faithYield ?? 10), 0);

export const calculateTotalAssignedUnits = (territories: Territory[]): number => 
  territories.reduce((acc, t) => acc + (t.allocatedDefenders?.length ?? 0), 0);

export const calculateTotalBuildings = (territories: Territory[]): number => 
  territories.reduce((acc, t) => acc + (t.buildings?.length ?? 0), 0);

export const groupUnitsIntoStackMap = (pool: UnitTemplate[]): Record<string, UnitTemplate[]> => {
  const map: Record<string, UnitTemplate[]> = {};
  pool.forEach(u => {
    if (!map[u.name]) map[u.name] = [];
    map[u.name].push(u);
  });
  return map;
};

export const groupAssignedDefendersIntoStacks = (defenders: UnitTemplate[]): UnitStack[] => {
  const map = defenders.reduce<Record<string, UnitStack>>((acc, u) => {
    if (!acc[u.name]) {
      acc[u.name] = { name: u.name, type: u.type, hp: u.hp, damage: u.damage, range: u.range, units: [] };
    }
    acc[u.name].units.push(u);
    return acc;
  }, {});
  return Object.values(map);
};

export const getTerritoryPosition = (territory: Territory, all: Territory[]): { x: number, y: number } => {
  const sameRing = all.filter(t => t.ringLevel === territory.ringLevel);
  const index = sameRing.findIndex(t => t.id === territory.id);
  const count = sameRing.length;

  const ringRadii: Record<number, number> = {
    0: 0,
    1: 110,
    2: 195,
    3: 275,
  };

  const radius = ringRadii[territory.ringLevel] ?? (territory.ringLevel * 90);

  if (territory.ringLevel === 0) {
    return { x: 400, y: 300 };
  }

  const baseAngles: Record<number, number> = {
    1: -90,
    2: 30,
    3: 150,
  };
  const baseAngle = baseAngles[territory.ringLevel] ?? 0;
  const angleStep = 360 / Math.max(1, count);
  const angleDeg = baseAngle + index * angleStep;
  const angleRad = (angleDeg * Math.PI) / 180;

  return {
    x: 400 + radius * Math.cos(angleRad),
    y: 300 + radius * Math.sin(angleRad),
  };
};
