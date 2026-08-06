import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BattleCanvas } from '../features/combat/BattleCanvas';
import { CampaignProvider } from '../context/CampaignContext';
import { GameEngine } from '../core/engine/GameEngine';

describe('BattleCanvas Regression Tests', () => {
  let engine: GameEngine;
  
  beforeEach(() => {
    engine = GameEngine.getInstance();
    vi.spyOn(engine, 'clearBoard');
    vi.spyOn(engine, 'loadFormation');
    vi.spyOn(engine, 'setGameSpeed');
    vi.spyOn(engine, 'surrenderBattle');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes the battlefield exactly once to prevent respawn loops', () => {
    const { rerender } = render(
      <CampaignProvider>
        <BattleCanvas isSandboxMode={false} />
      </CampaignProvider>
    );
    
    const initialClearCount = vi.mocked(engine.clearBoard).mock.calls.length;
    expect(initialClearCount).toBeGreaterThanOrEqual(1);
    const initialLoadCount = vi.mocked(engine.loadFormation).mock.calls.length;
    
    // Trigger a rerender
    rerender(
      <CampaignProvider>
        <BattleCanvas isSandboxMode={false} />
      </CampaignProvider>
    );

    // Assert it did not call clearBoard or loadFormation again
    expect(engine.clearBoard).toHaveBeenCalledTimes(initialClearCount);
    expect(engine.loadFormation).toHaveBeenCalledTimes(initialLoadCount);
  });
  
  it('propagates game speed changes to the engine', () => {
    render(
      <CampaignProvider>
        <BattleCanvas isSandboxMode={false} />
      </CampaignProvider>
    );
    
    const speedButton2x = screen.getByRole('button', { name: '2x' });
    fireEvent.click(speedButton2x);
    expect(engine.setGameSpeed).toHaveBeenCalledWith(2);
    
    const speedButton4x = screen.getByRole('button', { name: '4x' });
    fireEvent.click(speedButton4x);
    expect(engine.setGameSpeed).toHaveBeenCalledWith(4);
  });

  it('propagates surrender command to the engine', () => {
    render(
      <CampaignProvider>
        <BattleCanvas isSandboxMode={false} onSurrenderCity={() => {}} onVictoryComplete={() => {}} />
      </CampaignProvider>
    );
    
    const surrenderButton = screen.getByRole('button', { name: 'Surrender' });
    fireEvent.click(surrenderButton);
    expect(engine.surrenderBattle).toHaveBeenCalledTimes(1);
  });
});
