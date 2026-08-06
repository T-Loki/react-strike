export const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

export const getDirection = (x1: number, y1: number, x2: number, y2: number): { dx: number, dy: number, dist: number } => {
  const dist = getDistance(x1, y1, x2, y2);
  if (dist === 0) return { dx: 0, dy: 0, dist: 0 };
  return { dx: (x2 - x1) / dist, dy: (y2 - y1) / dist, dist };
};

export const isInRange = (distance: number, range: number): boolean => {
  return distance <= range;
};

export const getHealthPercentage = (current: number, max: number): number => {
  if (max <= 0) return 0;
  return (current / max) * 100;
};
