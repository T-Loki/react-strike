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
    
    // Assigned initially is 0
    expect(screen.getByText(/Assigned \(0\)/i)).toBeInTheDocument();

    // Find allocate buttons (+)
    const allocateButtons = container.querySelectorAll('button[title="Assign to territory"]');
    if (allocateButtons.length > 0) {
      fireEvent.click(allocateButtons[0]);
    }

    // Now assigned is 1, available is 12
    expect(screen.getByText(/Assigned \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Available Pool \(12\)/i)).toBeInTheDocument();

    // Deallocate
    const deallocateButtons = container.querySelectorAll('button[title="Remove from territory"]');
    if (deallocateButtons.length > 0) {
      fireEvent.click(deallocateButtons[0]);
    }

    expect(screen.getByText(/Assigned \(0\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Available Pool \(13\)/i)).toBeInTheDocument();
  });
});
