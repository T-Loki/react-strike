import React from 'react';
import type { Territory, UnitTemplate } from '../../types/combat';
import type { EmporiumItem } from '../../types/game';
import { Crown, Coins, Users, Shield, Building2, Flame, Sparkles, Store, Skull } from 'lucide-react';
import { 
  getActiveTerritories, 
  getScorchedTerritories, 
  getFrontlineTerritories,
  calculateTotalGoldYield,
  calculateTotalFaithYield,
  calculateTotalAssignedUnits,
  calculateTotalBuildings
} from '../../core/math/empireCalculations';

interface Props {
  territories: Territory[];
  globalUnitPool: UnitTemplate[];
  gold: number;
  faith: number;
  doomClock: number;
  emporiumItems: EmporiumItem[];
  purchasedItemIds: string[];
}

export const EmpireOverviewPanel: React.FC<Props> = ({
  territories,
  globalUnitPool,
  gold,
  faith,
  doomClock,
  emporiumItems,
  purchasedItemIds,
}) => {
  const activeTerritories = getActiveTerritories(territories);
  const scorchedTerritories = getScorchedTerritories(territories);
  const frontlineTerritories = getFrontlineTerritories(territories);

  const totalGoldYield = calculateTotalGoldYield(territories);
  const totalFaithYield = calculateTotalFaithYield(territories);

  const totalAssignedUnits = calculateTotalAssignedUnits(territories);
  const totalArmySize = globalUnitPool.length + totalAssignedUnits;

  const totalBuildings = calculateTotalBuildings(territories);

  const purchasedPerks = emporiumItems.filter(i => purchasedItemIds.includes(i.id));

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-widest px-2.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" /> High Imperial Realm
            </span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-white">Empire Strategic Overview</h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Macro KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-yellow-400" /> Empire Yields
            </div>
            <div className="text-lg font-bold text-green-400 mt-1">+{totalGoldYield}g Gold / turn</div>
            <div className="text-lg font-bold text-cyan-400 mt-0.5">+{totalFaithYield} Faith / turn</div>
            <div className="text-[11px] text-yellow-400 font-mono mt-1 font-semibold border-t border-slate-800 pt-1">
              Treasury: {gold} Gold • {faith} Faith
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div className="text-xs text-slate-400 font-semibold uppercase flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> Grand Army Size
            </div>
            <div className="text-xl font-bold text-cyan-400 mt-1">{totalArmySize} Units</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {globalUnitPool.length} reserve • {totalAssignedUnits} deployed • {doomClock <= 1 ? 'Doomsday is Coming!' : `Doom in: ${doomClock}`}
            </div>
          </div>
        </div>

        {/* Realm Status Summary */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Shield className="w-4 h-4 text-amber-400" /> Realm Territorial Status
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="text-slate-400">Controlled</div>
              <div className="text-lg font-bold text-white mt-0.5">{activeTerritories.length} / {territories.length}</div>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="text-slate-400 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-red-400" /> Frontline
              </div>
              <div className="text-lg font-bold text-red-400 mt-0.5">{frontlineTerritories.length}</div>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div className="text-slate-400 flex items-center justify-center gap-1">
                <Skull className="w-3 h-3 text-slate-500" /> Scorched
              </div>
              <div className="text-lg font-bold text-slate-500 mt-0.5">{scorchedTerritories.length}</div>
            </div>
          </div>
        </div>

        {/* Infrastructure & Buildings Overview */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Building2 className="w-4 h-4 text-indigo-400" /> Infrastructure Summary
          </h3>
          <div className="flex justify-between items-center text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800">
            <span>Total Constructed Town Buildings:</span>
            <span className="font-bold text-amber-400 font-mono text-sm">{totalBuildings} Buildings</span>
          </div>
        </div>

        {/* Active Perks & Decrees */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Store className="w-4 h-4 text-purple-400" /> Active Emporium Blessings ({purchasedPerks.length})
          </h3>

          {purchasedPerks.length === 0 ? (
            <div className="text-slate-500 text-xs italic py-2">No global perks or spells unlocked yet. Visit the Empire Emporium to enact decrees.</div>
          ) : (
            <div className="space-y-1.5">
              {purchasedPerks.map(perk => (
                <div key={perk.id} className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-xs flex justify-between items-center">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-purple-400" /> {perk.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-green-400 px-1.5 py-0.2 bg-green-950 rounded border border-green-800">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
