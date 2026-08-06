import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Territory, Unit } from '../types/combat';

interface CampaignState {
  territories: Territory[];
  globalUnitPool: Unit[];
  remainingBattles: number;
  resources: number;
}

interface CampaignContextType extends CampaignState {
  setTerritories: React.Dispatch<React.SetStateAction<Territory[]>>;
  setGlobalUnitPool: React.Dispatch<React.SetStateAction<Unit[]>>;
  setRemainingBattles: React.Dispatch<React.SetStateAction<number>>;
  setResources: React.Dispatch<React.SetStateAction<number>>;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [globalUnitPool, setGlobalUnitPool] = useState<Unit[]>([]);
  const [remainingBattles, setRemainingBattles] = useState(0);
  const [resources, setResources] = useState(0);

  return (
    <CampaignContext.Provider
      value={{
        territories,
        setTerritories,
        globalUnitPool,
        setGlobalUnitPool,
        remainingBattles,
        setRemainingBattles,
        resources,
        setResources,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
};
