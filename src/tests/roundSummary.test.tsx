import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { CampaignProvider, useCampaign } from '../context/CampaignContext';
import { RoundSummaryScreen } from '../features/logistics/RoundSummaryScreen';
import { BattleCanvasOverlay } from '../features/combat/BattleCanvasOverlay';

describe('City Surrender & Round Summary System', () => {
  it('allows giving up city on defeat in BattleCanvasOverlay', () => {
    let surrendered = false;
    render(
      <BattleCanvasOverlay
        hudStats={{ fps: 60, defendersCount: 0, hordeCount: 5, phase: 'DEFEAT' }}
        selectedUnit={null}
        setSelectedUnit={() => {}}
        isPaused={false}
        togglePause={() => {}}
        enemyMenuOpen={false}
        setEnemyMenuOpen={() => {}}
        enemyCatalog={[]}
        spawnEnemies={() => {}}
        initBattlefield={() => {}}
        isSandboxMode={false}
        onSurrenderCity={() => { surrendered = true; }}
      />
    );

    const giveUpButton = screen.getByText(/Give Up City/i);
    expect(giveUpButton).toBeInTheDocument();

    fireEvent.click(giveUpButton);
    expect(surrendered).toBe(true);
  });

  it('resolves battle outcome with 1/4 salvage (250g) and returns remaining active battle count', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignProvider>{children}</CampaignProvider>
    );
    const { result } = renderHook(() => useCampaign(), { wrapper });

    const initialGold = result.current.gold;
    const activeTerritory = result.current.territories.find(t => t.hasActiveBattle)!;
    expect(activeTerritory).toBeDefined();

    act(() => {
      const remaining = result.current.resolveBattleOutcome(activeTerritory.id, 'surrendered');
      expect(remaining).toBe(0);
    });

    // Check that territory is scorched, 250g awarded (1/4 of 1000g salvage), and roundLog recorded the surrendered battle
    const updatedTerritory = result.current.territories.find(t => t.id === activeTerritory.id);
    expect(updatedTerritory?.isScorched).toBe(true);
    expect(result.current.gold).toBe(initialGold + 250);
    const logItem = result.current.roundLog.find(r => r.territoryId === activeTerritory.id && r.outcome === 'surrendered');
    expect(logItem).toBeDefined();
    expect(logItem?.goldEarned).toBe(250);
  });

  it('renders RoundSummaryScreen and applies end-of-round yields + decrements doom clock on proceed', () => {
    let proceeded = false;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <CampaignProvider>{children}</CampaignProvider>
    );

    const { result } = renderHook(() => useCampaign(), { wrapper });
    const initialDoom = result.current.doomClock;

    render(
      <CampaignProvider>
        <RoundSummaryScreen onProceedToEmpireManagement={() => { proceeded = true; }} />
      </CampaignProvider>
    );

    expect(screen.getByText('End of Round Tactical Report')).toBeInTheDocument();
    expect(screen.getByText('Total Gold Yield')).toBeInTheDocument();
    expect(screen.getByText('Total Faith Yield')).toBeInTheDocument();

    const proceedButton = screen.getByText(/Collect Yields & Return to Empire Management/i);
    fireEvent.click(proceedButton);

    expect(proceeded).toBe(true);

    act(() => {
      const activeTerritory = result.current.territories.find(t => t.hasActiveBattle)!;
      result.current.resolveBattleOutcome(activeTerritory.id, 'victory');
    });

    expect(result.current.doomClock).toBe(initialDoom - 1);
  });
});
