import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Territory, UnitTemplate } from '../types/combat';
import type { EmporiumItem } from '../types/game';
import { INITIAL_TERRITORIES } from '../data/territories';
import { FACTIONS } from '../data/units';
import { INITIAL_EMPORIUM_ITEMS } from '../data/emporium';

export interface RoundBattleRecord {
  territoryId: string;
  territoryName: string;
  outcome: 'victory' | 'surrendered';
  goldEarned: number;
  faithEarned: number;
}

interface CampaignState {
  territories: Territory[];
  globalUnitPool: UnitTemplate[];
  sandboxDefenders: UnitTemplate[];
  remainingBattles: number;
  gold: number;
  faith: number;
  doomClock: number;
  emporiumItems: EmporiumItem[];
  purchasedItemIds: string[];
  roundLog: RoundBattleRecord[];
}

interface CampaignContextType extends CampaignState {
  setTerritories: React.Dispatch<React.SetStateAction<Territory[]>>;
  setGlobalUnitPool: React.Dispatch<React.SetStateAction<UnitTemplate[]>>;
  setSandboxDefenders: React.Dispatch<React.SetStateAction<UnitTemplate[]>>;
  setRemainingBattles: React.Dispatch<React.SetStateAction<number>>;
  setGold: React.Dispatch<React.SetStateAction<number>>;
  setFaith: React.Dispatch<React.SetStateAction<number>>;
  setDoomClock: React.Dispatch<React.SetStateAction<number>>;
  updateFrontlines: () => void;
  scorchTerritory: (id: string, amount?: number) => void;
  allocateUnitToTerritory: (territoryId: string, unitId: string) => void;
  deallocateUnitFromTerritory: (territoryId: string, unitId: string) => void;
  updateUnitGridPosition: (locationId: string, unitId: string, gridPos?: { x: number; y: number }, customTemplate?: UnitTemplate) => void;
  upgradeBuilding: (territoryId: string, buildingId: string) => void;
  buyUnit: (unitTemplateId: string) => void;
  transferUnits: (fromTerritoryId: string | 'reserve', toTerritoryId: string | 'reserve', unitIds: string[]) => void;
  buyShopItem: (itemId: string) => void;
  resolveBattleOutcome: (territoryId: string, outcome: 'victory' | 'surrendered') => number;
  applyEndOfRoundYields: () => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [territories, setTerritories] = useState<Territory[]>(INITIAL_TERRITORIES);
  const [sandboxDefenders, setSandboxDefenders] = useState<UnitTemplate[]>([]);
  const [roundLog, setRoundLog] = useState<RoundBattleRecord[]>([]);
  
  const pantheonRoster = FACTIONS.pantheon.roster;

  // Initialize with unique IDs for units
  const initialPool: UnitTemplate[] = [
    ...Array.from({ length: 6 }, (_, i) => ({ ...pantheonRoster[0], id: `spearman_${i + 1}` })),
    ...Array.from({ length: 6 }, (_, i) => ({ ...pantheonRoster[1], id: `crossbow_${i + 1}` })),
    { ...pantheonRoster[2], id: `hero_aric` }
  ];
  
  const [globalUnitPool, setGlobalUnitPool] = useState<UnitTemplate[]>(initialPool);
  const [remainingBattles, setRemainingBattles] = useState(0);
  const [gold, setGold] = useState(500);
  const [faith, setFaith] = useState(100);
  const [doomClock, setDoomClock] = useState(12);
  const [emporiumItems, setEmporiumItems] = useState<EmporiumItem[]>(INITIAL_EMPORIUM_ITEMS);
  const [purchasedItemIds, setPurchasedItemIds] = useState<string[]>([]);

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

  const scorchTerritory = (id: string, amount: number = 1000) => {
    const territory = territories.find(t => t.id === id);
    if (territory && !territory.isScorched) {
      setGold(g => g + amount);
      setTerritories((prev) => 
        prev.map(t => (t.id === id ? { ...t, isScorched: true, hasActiveBattle: false } : t))
      );
    }
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
    const territory = territories.find(t => t.id === territoryId);
    const unitToReturn = territory?.allocatedDefenders.find(u => u.id === unitId);

    if (!unitToReturn || unitToReturn.abilities?.includes('Fixed Garrison') || unitToReturn.name === 'Garrison Soldier' || unitToReturn.name === 'City Militia') return;

    setTerritories(prev => prev.map(t => {
      if (t.id === territoryId) {
        return {
          ...t,
          allocatedDefenders: t.allocatedDefenders.filter(u => u.id !== unitId)
        };
      }
      return t;
    }));

    setGlobalUnitPool(prev => [...prev, { ...unitToReturn, gridPosition: undefined }]);
  };


  const updateUnitGridPosition = (
    locationId: string, 
    unitId: string, 
    gridPos?: { x: number; y: number },
    customTemplate?: UnitTemplate
  ) => {
    if (locationId === 'sandbox') {
      setSandboxDefenders(prev => {
        const unitExists = prev.some(u => u.id === unitId);
        if (unitExists) {
          if (gridPos === undefined) {
            return prev.filter(u => u.id !== unitId);
          }
          return prev.map(u => u.id === unitId ? { ...u, gridPosition: gridPos } : u);
        } else {
          const sourceUnit = customTemplate || 
            globalUnitPool.find(u => u.id === unitId) || 
            Object.values(FACTIONS).flatMap(f => f.catalog).find(u => u.id === unitId || unitId.includes(u.id));
          if (sourceUnit) {
            return [...prev, { ...sourceUnit, id: unitId, gridPosition: gridPos }];
          }
          return prev;
        }
      });
      return;
    }

    setTerritories(prev => prev.map(t => {
      if (t.id === locationId) {
        const unitExists = t.allocatedDefenders.some(u => u.id === unitId);
        let updatedDefenders: UnitTemplate[];
        if (unitExists) {
          if (gridPos === undefined && unitId.startsWith('sandbox_')) {
            updatedDefenders = t.allocatedDefenders.filter(u => u.id !== unitId);
          } else {
            updatedDefenders = t.allocatedDefenders.map(u => {
              if (u.id === unitId) {
                return { ...u, gridPosition: gridPos };
              }
              return u;
            });
          }
        } else {
          const sourceUnit = customTemplate || 
            globalUnitPool.find(u => u.id === unitId) || 
            Object.values(FACTIONS).flatMap(f => f.catalog).find(u => u.id === unitId || unitId.includes(u.id));
          if (sourceUnit) {
            updatedDefenders = [...t.allocatedDefenders, { ...sourceUnit, id: unitId, gridPosition: gridPos }];
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

  const upgradeBuilding = (territoryId: string, buildingId: string) => {
    const territory = territories.find(t => t.id === territoryId);
    if (!territory) return;

    const building = territory.buildings.find(b => b.id === buildingId);
    if (!building || building.level >= building.maxLevel || gold < building.upgradeCost) return;

    const cost = building.upgradeCost;
    setGold(g => g - cost);

    setTerritories(prev => prev.map(t => {
      if (t.id !== territoryId) return t;
      const updatedBuildings = t.buildings.map(b => {
        if (b.id !== buildingId) return b;
        const newLevel = b.level + 1;
        const newCost = Math.floor(b.upgradeCost * 1.5);
        return {
          ...b,
          level: newLevel,
          upgradeCost: newCost,
        };
      });

      let yieldBonus = 0;
      if (building.type === 'production') {
        yieldBonus = 25;
      }

      return {
        ...t,
        resourceYield: t.resourceYield + yieldBonus,
        buildings: updatedBuildings,
      };
    }));
  };

  const buyUnit = (unitTemplateId: string) => {
    const template = Object.values(FACTIONS).flatMap(f => f.roster).find(u => u.id === unitTemplateId);
    if (!template || gold < template.cost) return;

    setGold(g => g - template.cost);
    const newUnit: UnitTemplate = {
      ...template,
      id: `${template.id}_recruited_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    setGlobalUnitPool(prev => [...prev, newUnit]);
  };

  const transferUnits = (fromId: string, toId: string, unitIds: string[]) => {
    if (fromId === toId || unitIds.length === 0) return;

    let unitsToMove: UnitTemplate[] = [];

    if (fromId === 'reserve' || fromId === 'global') {
      unitsToMove = globalUnitPool.filter(u => unitIds.includes(u.id));
      setGlobalUnitPool(prev => prev.filter(u => !unitIds.includes(u.id)));
    } else {
      const sourceTerr = territories.find(t => t.id === fromId);
      if (sourceTerr) {
        unitsToMove = sourceTerr.allocatedDefenders.filter(u => unitIds.includes(u.id) && !u.abilities?.includes('Fixed Garrison') && u.name !== 'Garrison Soldier' && u.name !== 'City Militia');
        setTerritories(prev => prev.map(t => {
          if (t.id === fromId) {
            return {
              ...t,
              allocatedDefenders: t.allocatedDefenders.filter(u => !unitIds.includes(u.id) || u.abilities?.includes('Fixed Garrison') || u.name === 'Garrison Soldier' || u.name === 'City Militia')
            };
          }
          return t;
        }));
      }
    }

    if (unitsToMove.length === 0) return;

    if (toId === 'reserve' || toId === 'global') {
      setGlobalUnitPool(prev => [...prev, ...unitsToMove.map(u => ({ ...u, gridPosition: undefined }))]);
    } else {
      setTerritories(prev => prev.map(t => {
        if (t.id === toId) {
          return {
            ...t,
            allocatedDefenders: [...t.allocatedDefenders, ...unitsToMove.map(u => ({ ...u, gridPosition: undefined }))]
          };
        }
        return t;
      }));
    }
  };

  const buyShopItem = (itemId: string) => {
    const item = emporiumItems.find(i => i.id === itemId);
    if (!item || item.purchased) return;

    if (item.costType === 'gold') {
      if (gold < item.cost) return;
      setGold(g => g - item.cost);
    } else {
      if (faith < item.cost) return;
      setFaith(f => f - item.cost);
    }

    // Decree effects
    if (item.id === 'dec_conscription') {
      const spearmanTemplate = FACTIONS.pantheon.roster[0];
      const newSpearmen: UnitTemplate[] = Array.from({ length: 2 }, (_, i) => ({
        ...spearmanTemplate,
        id: `conscript_spearman_${Date.now()}_${i}`
      }));
      setGlobalUnitPool(prev => [...prev, ...newSpearmen]);
    } else if (item.id === 'dec_divine_intervention') {
      setDoomClock(d => Math.max(0, d - 2));
    } else if (item.id === 'dec_emergency_treasury') {
      setGold(g => g + 400);
    }

    if (item.category === 'perk' || item.category === 'spell') {
      setPurchasedItemIds(prev => [...prev, itemId]);
      setEmporiumItems(prev => prev.map(i => i.id === itemId ? { ...i, purchased: true } : i));
    }
  };

  const resolveBattleOutcome = (territoryId: string, outcome: 'victory' | 'surrendered'): number => {
    const targetTerritory = territories.find(t => t.id === territoryId);
    const name = targetTerritory?.name || territoryId;

    if (outcome === 'surrendered') {
      scorchTerritory(territoryId, 250);
    } else {
      setTerritories(prev => prev.map(t => t.id === territoryId ? { ...t, hasActiveBattle: false } : t));
    }

    setRoundLog(prev => [
      ...prev,
      {
        territoryId,
        territoryName: name,
        outcome,
        goldEarned: outcome === 'surrendered' ? 250 : 0,
        faithEarned: 0
      }
    ]);

    const remainingActive = territories.filter(t => t.id !== territoryId && t.hasActiveBattle && !t.isScorched);
    if (remainingActive.length === 0) {
      setDoomClock(d => Math.max(0, d - 1));
    }
    return remainingActive.length;
  };

  const applyEndOfRoundYields = () => {
    const survivingTerritories = territories.filter(t => !t.isScorched);
    const roundGoldYield = survivingTerritories.reduce((acc, t) => acc + (t.resourceYield || 0), 0);
    const roundFaithYield = survivingTerritories.reduce((acc, t) => acc + (t.faithYield || 0), 0);

    setGold(g => g + roundGoldYield);
    setFaith(f => f + roundFaithYield);
    setRoundLog([]);
    updateFrontlines();
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
        sandboxDefenders,
        setSandboxDefenders,
        remainingBattles,
        setRemainingBattles,
        gold,
        setGold,
        faith,
        setFaith,
        doomClock,
        setDoomClock,
        emporiumItems,
        purchasedItemIds,
        roundLog,
        updateFrontlines,
        scorchTerritory,
        allocateUnitToTerritory,
        deallocateUnitFromTerritory,
        updateUnitGridPosition,
        upgradeBuilding,
        buyUnit,
        transferUnits,
        buyShopItem,
        resolveBattleOutcome,
        applyEndOfRoundYields,
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
