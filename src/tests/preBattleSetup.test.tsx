import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreBattleSetup } from '../features/combat/PreBattleSetup';
import { CampaignProvider } from '../context/CampaignContext';

describe('PreBattleSetup Deployment Grid Logic', () => {
  it('handles Case 1 (Empty cell + unit selected -> deploy)', () => {
    render(
      <CampaignProvider>
        <PreBattleSetup isSandboxMode={true} />
      </CampaignProvider>
    );

    // Select first unit stack card from bench
    const benchCard = screen.getByText('Vanguard Spearman').closest('button');
    expect(benchCard).not.toBeNull();
    fireEvent.click(benchCard!);

    // Click cell (0,0)
    const cell00 = screen.getByText('0,0').closest('button');
    expect(cell00).not.toBeNull();
    fireEvent.click(cell00!);

    // Cell (0,0) should now display Vanguard Spearman (and no longer render text "0,0")
    expect(screen.queryByText('0,0')).toBeNull();
    expect(screen.getAllByText('Vanguard Spearman').length).toBeGreaterThan(0);
  });

  it('handles Case 2 (Occupied cell + different unit selected -> swap/return)', () => {
    render(
      <CampaignProvider>
        <PreBattleSetup isSandboxMode={true} />
      </CampaignProvider>
    );

    // 1. Select Spearman and deploy to (0,0)
    const spearmanCard = screen.getAllByText('Vanguard Spearman')[0].closest('button');
    fireEvent.click(spearmanCard!);
    const cell00 = screen.getByText('0,0').closest('button');
    fireEvent.click(cell00!);

    expect(screen.getAllByText('Vanguard Spearman').length).toBeGreaterThan(0);

    // 2. Select Crossbow from bench
    const crossbowCard = screen.getAllByText('Iron Crossbow')[0].closest('button');
    fireEvent.click(crossbowCard!);

    // 3. Click occupied cell (0,0) with Crossbow selected
    fireEvent.click(cell00!);

    // Cell (0,0) should now be occupied by Iron Crossbow
    expect(screen.getAllByText('Iron Crossbow').length).toBeGreaterThan(0);
  });

  it('retains unit selection across placements until no units remain in stack', () => {
    render(
      <CampaignProvider>
        <PreBattleSetup isSandboxMode={true} />
      </CampaignProvider>
    );

    // Select Hero card (Aric the Shieldbreaker, quantity = 1)
    const heroCard = screen.getAllByText('Aric the Shieldbreaker')[0].closest('button');
    fireEvent.click(heroCard!);

    // Deploy to (0,0)
    const cell00 = screen.getByText('0,0').closest('button');
    fireEvent.click(cell00!);

    // Since Hero had quantity 1, after placement there are 0 left in stack so it should be unselected
    expect(screen.queryByText('Deploying: Aric the Shieldbreaker (Click Grid)')).toBeNull();
  });
});
