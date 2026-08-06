import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Territory, UnitTemplate } from '../types/combat';
import { INITIAL_TERRITORIES } from '../data/territories';
import { UNIT_ROSTER } from '../data/units';

interface CampaignState {
  territories: Territory[];
  globalUnitPool: UnitTemplate[];
  remainingBattles: number;
  gold: number;
  faith: number;
  doomClock: number;
}

interface CampaignContextType extends CampaignState {
  setTerritories: React.Dispatch<React.SetStateAction<Territory[]>>;
  setGlobalUnitPool: React.Dispatch<React.SetStateAction<UnitTemplate[]>>;
  setRemainingBattles: React.Dispatch<React.SetStateAction<number>>;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  setFaith: React.Dispatch<React.SetStateAction<number>>;
  setDoomClock: React.Dispatch<React.SetStateAction<number>>;
  updateFrontlines: () => void;
  scorchTerritory: (id: string) => void;
  allocateUnitToTerritory: (territoryId: string, unitId: string) => void;
  deallocateUnitFromTerritory: (territoryId: string, unitId: string) => void;
  updateUnitGridPosition: (territoryId: string, unitId: string, gridPos?: { x: number; y: number }) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [territories, setTerritories] = useState<Territory[]>(INITIAL_TERRITORIES);
  
  // Initialize with unique IDs for units
  const initialPool: UnitTemplate[] = [
    ...Array.from({ length: 5 }, (_, i) => ({ ...UNIT_ROSTER[0], id: `spearman_${i + 1}` })),
    ...Array.from({ length: 5 }, (_, i) => ({ ...UNIT_ROSTER[1], id: `crossbow_${i + 1}` })),
    { ...UNIT_ROSTER[2], id: `hero_aric` }
  ];
  
  const [globalUnitPool, setGlobalUnitPool] = useState<UnitTemplate[]>(initialPool);
  const [remainingBattles, setRemainingBattles] = useState(0);
  const [gold, setGold] = useState(500);
  const [faith, setFaith] = useState(100);
  const [doomClock, setDoomClock] = useState(12);
  const updateFrontlines = () => {
    setTerritories((prev) => {
      const unscorched = prev.filter(t => !t.isScorched);
      if (unscorched.length === 0) return prev;
      
      const maxRing = Math.max(...unscorched.map(t => t.ringLevel));
      
      return prev.map(t => ({
        ...t,
        hasActiveBattle: !t.isScorched && t.ringLevel === maxRing
      }));
    });
  };

  const scorchTerritory = (id: string) => {
    setTerritories((prev) => 
      prev.map(t => {
        if (t.id === id && !t.isScorched) {
          setGold(g => g + 1000);
          return { ...t, isScorched: true, hasActiveBattle: false };
        }
        return t;
      })
    );
  };

  const allocateUnitToTerritory = (territoryId: string, unitId: string) => {
    const unit = globalUnitPool.find(u => u.id === unitId);
    if (!unit) return;

    // Move from global pool to territory
    setGlobalUnitPool(prev => prev.filter(u => u.id !== unitId));
    setTerritories(prev => prev.map(t => {
      if (t.id === territoryId) {
        return {
          ...t,
          allocatedDefenders: [...t.allocatedDefenders, { ...unit, gridPosition: undefined }]
        };
      }
      return t;
    }));
  };

  const deallocateUnitFromTerritory = (territoryId: string, unitId: string) => {
    let unitToReturn: UnitTemplate | undefined;

    setTerritories(prev => prev.map(t => {
      if (t.id === territoryId) {
        unitToReturn = t.allocatedDefenders.find(u => u.id === unitId);
        return {
          ...t,
          allocatedDefenders: t.allocatedDefenders.filter(u => u.id !== unitId)
        };
      }
      return t;
    }));

    if (unitToReturn) {
      const returnedUnit = unitToReturn;
      setGlobalUnitPool(prev => [...prev, { ...returnedUnit, gridPosition: undefined }]);
    }
  };

  const updateUnitGridPosition = (territoryId: string, unitId: string, gridPos?: { x: number; y: number }) => {
    setTerritories(prev => prev.map(t => {
      if (t.id === territoryId) {
        const unitExists = t.allocatedDefenders.some(u => u.id === unitId);
        let updatedDefenders: UnitTemplate[];
        if (unitExists) {
          updatedDefenders = t.allocatedDefenders.map(u => {
            if (u.id === unitId) {
              return { ...u, gridPosition: gridPos };
            }
            return u;
          });
        } else {
          const sourceUnit = globalUnitPool.find(u => u.id === unitId) || UNIT_ROSTER.find(u => u.id === unitId);
          if (sourceUnit) {
            updatedDefenders = [...t.allocatedDefenders, { ...sourceUnit, gridPosition: gridPos }];
          } else {
            updatedDefenders = t.allocatedDefenders;
          }
        }
        return {
          ...t,
          allocatedDefenders: updatedDefenders
        };
      }
      return t;
    }));
  };

  useEffect(() => {
    updateFrontlines();
  }, []);

  const scorchedCount = territories.filter(t => t.isScorched).length;
  useEffect(() => {
    updateFrontlines();
  }, [scorchedCount]);

  return (
    <CampaignContext.Provider
      value={{
        territories,
        setTerritories,
        globalUnitPool,
        setGlobalUnitPool,
        remainingBattles,
        setRemainingBattles,
        gold,
        setGold,
        faith,
        setFaith,
        doomClock,
        setDoomClock,
        updateFrontlines,
        scorchTerritory,
        allocateUnitToTerritory,
        deallocateUnitFromTerritory,
        updateUnitGridPosition,
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
