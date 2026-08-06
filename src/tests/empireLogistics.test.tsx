import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmpireManagement } from '../features/logistics/EmpireManagement';
import { CampaignProvider } from '../context/CampaignContext';

describe('Empire Management Logistics', () => {
  it('renders correctly and scorches territory for payout', () => {
    render(
      <CampaignProvider>
        <EmpireManagement />
      </CampaignProvider>
    );

    // Initial Gold is 500
    expect(screen.getByText(/Gold: 500/i)).toBeInTheDocument();

    // Find Scorched Earth button
    const scorchButtons = screen.getAllByText(/Scorched Earth/i);
    expect(scorchButtons.length).toBeGreaterThan(0);

    // Click the first scorch button
    fireEvent.click(scorchButtons[0]);

    // Gold should increase by 1000 to 1500
    expect(screen.getByText(/Gold: 1500/i)).toBeInTheDocument();
  });

  it('allows managing troops and limits allocation by pool', () => {
    const { container } = render(
      <CampaignProvider>
        <EmpireManagement />
      </CampaignProvider>
    );

    // Open management modal for a territory
    const manageButtons = screen.getAllByText(/Manage Troops/i);
    fireEvent.click(manageButtons[0]);

    // Check modal opens
    expect(screen.getByText(/Allocate Troops to/i)).toBeInTheDocument();

    // Total available units initially is 13
    expect(screen.getByText(/Available Pool \(13\)/i)).toBeInTheDocument();
    
    // Assigned initially is 3 (3 initial garrison soldier defenders)
    expect(screen.getByText(/Assigned \(3\)/i)).toBeInTheDocument();

    // Find allocate buttons (+)
    const allocateButtons = container.querySelectorAll('button[title="Assign to territory"]');
    if (allocateButtons.length > 0) {
      fireEvent.click(allocateButtons[0]);
    }

    // Now assigned is 4, available is 12
    expect(screen.getByText(/Assigned \(4\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Available Pool \(12\)/i)).toBeInTheDocument();

    // Deallocate
    const deallocateButtons = container.querySelectorAll('button[title="Remove from territory"]');
    if (deallocateButtons.length > 0) {
      fireEvent.click(deallocateButtons[0]);
    }

    expect(screen.getByText(/Assigned \(3\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Available Pool \(13\)/i)).toBeInTheDocument();
  });

  it('allows upgrading buildings from territory drawer', () => {
    render(
      <CampaignProvider>
        <EmpireManagement />
      </CampaignProvider>
    );

    // Territory drawer shows town infrastructure & upgrade buttons
    const upgradeButtons = screen.getAllByText(/Upgrade:/i);
    expect(upgradeButtons.length).toBeGreaterThan(0);

    // Initial Gold is 500
    expect(screen.getByText(/Gold: 500/i)).toBeInTheDocument();

    // Click upgrade
    fireEvent.click(upgradeButtons[0]);

    // Gold decreases by upgrade cost (100 for Scavenger Farmstead)
    expect(screen.getByText(/Gold: 400/i)).toBeInTheDocument();
  });

  it('opens Empire Emporium and purchases emergency decree', () => {
    render(
      <CampaignProvider>
        <EmpireManagement />
      </CampaignProvider>
    );

    // Open Emporium
    const emporiumBtn = screen.getByText(/Empire Emporium/i);
    fireEvent.click(emporiumBtn);

    // Check Emporium modal opened
    expect(screen.getByText(/Empire Emporium & Grand Sanctuary/i)).toBeInTheDocument();
    expect(screen.getByText(/Emergency Decrees/i)).toBeInTheDocument();

    // Find Enact Decree button for Conscription Drive (cost 150 gold)
    const enactButtons = screen.getAllByText(/Enact Decree/i);
    expect(enactButtons.length).toBeGreaterThan(0);

    fireEvent.click(enactButtons[0]);

    // Gold should decrease from 500 to 350
    expect(screen.getByText(/350 Gold/i)).toBeInTheDocument();
  });
});
