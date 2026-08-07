import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SandboxOrchestrator } from '../features/combat/SandboxOrchestrator';
import { CampaignProvider } from '../context/CampaignContext';
import { GameEngine } from '../core/engine/GameEngine';

describe('Sandbox Pre-Battle to Battle Transition', () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = GameEngine.getInstance();
    vi.spyOn(engine, 'loadFormation');
  });

  it('deploys exactly the units placed on the grid in sandbox mode when launching simulation', () => {
    render(
      <CampaignProvider>
        <SandboxOrchestrator onNavigate={vi.fn()} />
      </CampaignProvider>
    );

    // 1. Select Spearman from unit roster
    const spearmanCard = screen.getAllByText('Vanguard Spearman')[0].closest('button');
    expect(spearmanCard).not.toBeNull();
    fireEvent.click(spearmanCard!);

    // 2. Place 1 Spearman on grid at cell (0,0)
    const cell00 = screen.getByText('0,0').closest('button');
    expect(cell00).not.toBeNull();
    fireEvent.click(cell00!);

    // 3. Click Launch Simulation
    const launchBtn = screen.getByText(/Launch Simulation/i);
    fireEvent.click(launchBtn);

    // 4. Verify loadFormation was called with EXACTLY 1 unit (the placed Spearman)
    const calls = vi.mocked(engine.loadFormation).mock.calls;
    expect(calls.length).toBeGreaterThan(0);

    const loadedUnits = calls[0][0];
    expect(loadedUnits).toHaveLength(1);
    expect(loadedUnits[0].name).toBe('Vanguard Spearman');
    expect(loadedUnits[0].gridPosition).toEqual({ x: 0, y: 0 });
  });
});
