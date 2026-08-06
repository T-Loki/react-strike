import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TerritoryDetailPanel } from '../features/logistics/TerritoryDetailPanel';
import { TerritoryDrawer } from '../features/logistics/TerritoryDrawer';
import { BattleSelectMenu } from '../features/logistics/BattleSelectMenu';
import { CampaignProvider } from '../context/CampaignContext';

import { INITIAL_TERRITORIES } from '../data/territories';

describe('City Overview Stacked Unit Cards', () => {
  it('renders stacked unit cards with counts in TerritoryDetailPanel', () => {
    render(
      <CampaignProvider>
        <TerritoryDetailPanel
          territory={INITIAL_TERRITORIES[0]}
          territories={INITIAL_TERRITORIES}
          globalUnitPool={[]}
          gold={500}
          faith={100}
          doomClock={12}
          emporiumItems={[]}
          purchasedItemIds={[]}
          onUpgradeBuilding={() => {}}
          onScorchTerritory={() => {}}
          onOpenUnitManager={() => {}}
        />
      </CampaignProvider>
    );

    // Initial 3 Garrison Soldiers should render as Garrison Soldier x3
    expect(screen.getByText('Garrison Soldier')).toBeInTheDocument();
    expect(screen.getByText('x3')).toBeInTheDocument();
  });

  it('renders stacked unit cards with counts in TerritoryDrawer', () => {
    render(
      <CampaignProvider>
        <TerritoryDrawer
          territory={INITIAL_TERRITORIES[0]}
          gold={500}
          onClose={() => {}}
          onUpgradeBuilding={() => {}}
          onScorchTerritory={() => {}}
          onOpenUnitManager={() => {}}
        />
      </CampaignProvider>
    );

    expect(screen.getByText('Garrison Soldier')).toBeInTheDocument();
    expect(screen.getByText('x3')).toBeInTheDocument();
  });

  it('renders stacked unit cards with counts in BattleSelectMenu', () => {
    render(
      <CampaignProvider>
        <BattleSelectMenu />
      </CampaignProvider>
    );

    expect(screen.getByText('Garrison Soldier')).toBeInTheDocument();
    expect(screen.getByText('x3')).toBeInTheDocument();
  });
});
