import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CampaignOrchestrator } from '../features/combat/CampaignOrchestrator';
import { CampaignProvider } from '../context/CampaignContext';

// Mock canvas elements because Vitest/JSDOM doesn't support them well
vi.mock('../features/combat/BattleCanvas', () => ({
  BattleCanvas: ({ onBackToMap }: { onBackToMap: () => void }) => (
    <div data-testid="mock-battle-canvas">
      <button onClick={onBackToMap}>End Battle</button>
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

    // Combat -> ends. Depending on remainingBattles (starts at 0), it goes back to empire_management
    const endBattleBtn = screen.getByText('End Battle');
    fireEvent.click(endBattleBtn);
    
    // Because initial remainingBattles is 0, it should return to empire_management
    expect(screen.getByText(/Current Phase: empire_management/i)).toBeInTheDocument();
  });
});
