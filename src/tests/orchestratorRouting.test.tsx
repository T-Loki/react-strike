import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CampaignOrchestrator } from '../features/combat/CampaignOrchestrator';
import { CampaignProvider } from '../context/CampaignContext';

// Mock canvas elements because Vitest/JSDOM doesn't support them well
vi.mock('../features/combat/BattleCanvas', () => ({
  BattleCanvas: ({ onBackToMap, onVictoryComplete }: any) => (
    <div data-testid="mock-battle-canvas">
      <button onClick={onBackToMap}>End Battle</button>
      <button onClick={onVictoryComplete}>Win Battle</button>
    </div>
  )
}));

vi.mock('../features/combat/PreBattleSetup', () => ({
  PreBattleSetup: ({ onStartBattle, onBackToMap }: { onStartBattle: () => void, onBackToMap: () => void }) => (
    <div data-testid="mock-pre-battle">
      <button onClick={onStartBattle}>Start Battle</button>
      <button onClick={onBackToMap}>Back to Map</button>
    </div>
  )
}));

// Mock BattleSelectMenu to provide an engage button since it relies on territories
vi.mock('../features/logistics/BattleSelectMenu', () => ({
  BattleSelectMenu: ({ onNext }: { onNext: () => void }) => (
    <div data-testid="mock-battle-select">
      <button onClick={onNext}>Engage Horde</button>
    </div>
  )
}));

describe('Campaign Orchestrator Routing', () => {
  it('cycles through phases correctly', () => {
    const navigateSpy = vi.fn();
    
    render(
      <CampaignProvider>
        <CampaignOrchestrator onNavigate={navigateSpy} />
      </CampaignProvider>
    );

    // Initial phase: empire_management
    expect(screen.getByText(/Current Phase: empire_management/i)).toBeInTheDocument();
    
    // Progress to battle_select
    const endPhaseBtn = screen.getByText('End Management Phase');
    fireEvent.click(endPhaseBtn);
    expect(screen.getByText(/Current Phase: battle_select/i)).toBeInTheDocument();

    // Select a battle -> pre_battle
    const engageButtons = screen.getAllByText(/Engage Horde/i);
    fireEvent.click(engageButtons[0]);
    expect(screen.getByText(/Current Phase: pre_battle/i)).toBeInTheDocument();

    // Pre battle -> combat
    const startBattleBtn = screen.getByText('Start Battle');
    fireEvent.click(startBattleBtn);
    expect(screen.getByText(/Current Phase: combat/i)).toBeInTheDocument();

    // Combat -> retreat/back returns to pre_battle (Pre-Battle Planning)
    const endBattleBtn = screen.getByText('End Battle');
    fireEvent.click(endBattleBtn);
    
    // Returns to pre_battle phase
    expect(screen.getByText(/Current Phase: pre_battle/i)).toBeInTheDocument();
  });

  it('cycles to round_summary state when all battles are finished', () => {
    const navigateSpy = vi.fn();

    render(
      <CampaignProvider>
        <CampaignOrchestrator onNavigate={navigateSpy} />
      </CampaignProvider>
    );

    // Skip to battle_select
    fireEvent.click(screen.getByText('End Management Phase'));
    
    // Engage
    fireEvent.click(screen.getAllByText(/Engage Horde/i)[0]);
    
    // Start Battle
    fireEvent.click(screen.getByText('Start Battle'));

    // Win Battle
    fireEvent.click(screen.getByText('Win Battle'));

    // Since it's the last (or only) battle in our mock default context, it should go to round_summary
    expect(screen.getByText(/Current Phase: round_summary/i)).toBeInTheDocument();
  });
});
