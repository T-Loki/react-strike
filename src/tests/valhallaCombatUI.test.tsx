import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BattleCanvasOverlay } from '../features/combat/BattleCanvasOverlay';

describe('BattleCanvasOverlay Mode-Specific UI', () => {
  const defaultStats = {
    fps: 60,
    defendersCount: 3,
    hordeCount: 10,
    phase: 'HOLDING_POSITION',
  };

  const dummyCatalogue = [
    { label: 'Orc Grunt', icon: '⚔️', color: '#f87171', stats: { name: 'Orc Grunt', hp: 65, maxHp: 65, damage: 9, speed: 70, armor: 1 } }
  ];

  it('hides Reset Formation and Spawn Enemies in Valhalla Mode (!isSandboxMode)', () => {
    render(
      <BattleCanvasOverlay
        hudStats={defaultStats}
        selectedUnit={null}
        setSelectedUnit={() => {}}
        isPaused={false}
        togglePause={() => {}}
        enemyMenuOpen={false}
        setEnemyMenuOpen={() => {}}
        ENEMY_CATALOGUE={dummyCatalogue}
        spawnEnemies={() => {}}
        initBattlefield={() => {}}
        onBackToMap={() => {}}
        isSandboxMode={false}
      />
    );

    // Sandbox controls should NOT be rendered
    expect(screen.queryByText(/Reset Formation/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Spawn Enemies/i)).not.toBeInTheDocument();

    // Top retreat button should say Return to Pre-Battle Planning
    expect(screen.getByText(/Return to Pre-Battle Planning/i)).toBeInTheDocument();
  });

  it('shows Reset Formation and Spawn Enemies in Sandbox Mode (isSandboxMode === true)', () => {
    render(
      <BattleCanvasOverlay
        hudStats={defaultStats}
        selectedUnit={null}
        setSelectedUnit={() => {}}
        isPaused={false}
        togglePause={() => {}}
        enemyMenuOpen={false}
        setEnemyMenuOpen={() => {}}
        ENEMY_CATALOGUE={dummyCatalogue}
        spawnEnemies={() => {}}
        initBattlefield={() => {}}
        onBackToMap={() => {}}
        isSandboxMode={true}
      />
    );

    // Sandbox controls SHOULD be rendered
    expect(screen.getByText(/Reset Formation/i)).toBeInTheDocument();
    expect(screen.getByText(/Spawn Enemies/i)).toBeInTheDocument();

    // Top button should say Back to Sandbox
    expect(screen.getByText(/Back to Sandbox/i)).toBeInTheDocument();
  });
});
