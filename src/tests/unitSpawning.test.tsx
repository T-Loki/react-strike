import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { GameEngine } from '../core/engine/GameEngine';
import { BattleCanvas } from '../features/combat/BattleCanvas';
import { CampaignProvider } from '../context/CampaignContext';
import type { UnitTemplate } from '../types/combat';

describe('Unit Spawning System', () => {
  let engine: GameEngine;

  beforeEach(() => {
    GameEngine.resetInstance();
    engine = GameEngine.getInstance();
  });

  afterEach(() => {
    GameEngine.resetInstance();
  });

  it('spawns defenders with and without explicit grid positions', () => {
    const templates: UnitTemplate[] = [
      { id: '1', name: 'Placed Spearman', type: 'common', hp: 100, maxHp: 100, damage: 10, range: 50, attackSpeed: 1, cost: 50, abilities: [], gridPosition: { x: 2, y: 3 } },
      { id: '2', name: 'Unplaced Crossbow', type: 'common', hp: 80, maxHp: 80, damage: 20, range: 150, attackSpeed: 1, cost: 75, abilities: [] },
    ];

    engine.loadFormation(templates);
    const defenders = engine.getDefenders();

    expect(defenders).toHaveLength(2);
    expect(defenders.find(d => d.id === '1')?.gridPosition).toEqual({ x: 2, y: 3 });
    expect(defenders.find(d => d.id === '2')?.gridPosition).toBeDefined();
  });

  it('populates engine entities with defenders and horde when BattleCanvas mounts', () => {
    render(
      <CampaignProvider>
        <BattleCanvas isSandboxMode={false} />
      </CampaignProvider>
    );

    const defenders = engine.getDefenders();
    const horde = engine.getHorde();

    expect(defenders.length).toBeGreaterThan(0);
    expect(horde.length).toBeGreaterThan(0);
  });
});
