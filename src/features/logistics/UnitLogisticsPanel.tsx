import React from 'react';
import type { Territory, UnitTemplate } from '../../types/combat';
import { UNIT_ROSTER } from '../../data/units';
import { Users, Coins, Shield, ArrowLeftRight } from 'lucide-react';

interface Props {
  territories: Territory[];
  globalUnitPool: UnitTemplate[];
  gold: number;
  selectedTerritoryId: string | null;
  onSelectTerritory: (territoryId: string) => void;
  onAllocateUnit: (territoryId: string, unitId: string) => void;
  onDeallocateUnit: (territoryId: string, unitId: string) => void;
  onBuyUnit: (unitTemplateId: string) => void;
  onTransferUnits: (fromId: string, toId: string, unitIds: string[]) => void;
}

type UnitStack = {
  name: string;
  type: string;
  hp: number;
  damage: number;
  range: number;
  units: UnitTemplate[];
};

// Non-hero unit templates available for purchase in the recruitment store
const PURCHASABLE_UNITS = UNIT_ROSTER.filter(u => u.type !== 'hero');

export const UnitLogisticsPanel: React.FC<Props> = ({
  territories,
  globalUnitPool,
  gold,
  selectedTerritoryId,
  onSelectTerritory,
  onAllocateUnit,
  onDeallocateUnit,
  onBuyUnit,
  onTransferUnits,
}) => {
  const activeTerritories = territories.filter(t => !t.isScorched);
  const currentTerritoryId = selectedTerritoryId || (activeTerritories[0]?.id ?? '');
  const selectedTerritory = territories.find(t => t.id === currentTerritoryId);

  // Group Global Pool Units into Stack Map
  const poolStackMap: Record<string, UnitTemplate[]> = {};
  globalUnitPool.forEach(u => {
    if (!poolStackMap[u.name]) poolStackMap[u.name] = [];
    poolStackMap[u.name].push(u);
  });

  // Group Assigned Garrison Units into Stack Cards
  const assignedDefenders = selectedTerritory ? selectedTerritory.allocatedDefenders : [];
  const assignedStacks: UnitStack[] = Object.values(
    assignedDefenders.reduce<Record<string, UnitStack>>((acc, u) => {
      if (!acc[u.name]) {
        acc[u.name] = { name: u.name, type: u.type, hp: u.hp, damage: u.damage, range: u.range, units: [] };
      }
      acc[u.name].units.push(u);
      return acc;
    }, {})
  );

  const handleTransferAllToGarrison = () => {
    if (!selectedTerritory || globalUnitPool.length === 0) return;
    const allIds = globalUnitPool.map(u => u.id);
    onTransferUnits('reserve', selectedTerritory.id, allIds);
  };

  const handleReturnAllToReserve = () => {
    if (!selectedTerritory || selectedTerritory.allocatedDefenders.length === 0) return;
    const allIds = selectedTerritory.allocatedDefenders.map(u => u.id);
    onTransferUnits(selectedTerritory.id, 'reserve', allIds);
  };

  const handleTransferStackToGarrison = (units: UnitTemplate[]) => {
    if (!selectedTerritory || units.length === 0) return;
    onTransferUnits('reserve', selectedTerritory.id, units.map(u => u.id));
  };

  const handleReturnStackToReserve = (stack: UnitStack) => {
    if (!selectedTerritory || stack.units.length === 0) return;
    onTransferUnits(selectedTerritory.id, 'reserve', stack.units.map(u => u.id));
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-800">
        <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          Allocate Troops to {selectedTerritory ? selectedTerritory.name : 'Territory'}
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Recruit reinforcements directly into your reserve pool and deploy unit stacks to front-line garrisons.
        </p>
      </div>

      {/* 2 Side-by-Side Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1 overflow-hidden p-4">
        {/* Left Column: Available Pool & Integrated Recruitment Shop */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800 flex-shrink-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Available Pool ({globalUnitPool.length})
            </h4>
            {selectedTerritory && globalUnitPool.length > 0 && (
              <button
                onClick={handleTransferAllToGarrison}
                className="text-[11px] px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-bold rounded transition-colors flex items-center gap-1"
              >
                <ArrowLeftRight className="w-3 h-3" /> Deploy All ({globalUnitPool.length})
              </button>
            )}
          </div>

          {/* Integrated Unit Roster Cards (Purchasable units + Reserve count) */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Purchasable Troops */}
            {PURCHASABLE_UNITS.map(template => {
              const reserveUnits = poolStackMap[template.name] || [];
              const canAfford = gold >= template.cost;

              return (
                <div
                  key={template.id}
                  className="bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex flex-col gap-2.5 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        {template.name}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                          {template.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 uppercase mt-0.5">
                        HP: {template.hp} | DMG: {template.damage} | Range: {template.range}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-300 font-mono px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded">
                        x{reserveUnits.length} in reserve
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar: Standardised Deploy & Integrated Recruit */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-1">
                      {selectedTerritory && (
                        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-xs">
                          <span className="text-slate-400 font-bold mr-1">Deploy:</span>
                          <button
                            onClick={() => reserveUnits.length > 0 && onAllocateUnit(selectedTerritory.id, reserveUnits[0].id)}
                            disabled={reserveUnits.length === 0}
                            className={`px-2 py-0.5 font-bold text-xs rounded transition-colors ${
                              reserveUnits.length > 0
                                ? 'bg-green-900/80 hover:bg-green-700 text-green-200'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                            }`}
                            title="Assign to territory"
                          >
                            1
                          </button>
                          {reserveUnits.length > 1 && (
                            <button
                              onClick={() => handleTransferStackToGarrison(reserveUnits)}
                              className="px-2 py-0.5 bg-cyan-900/80 hover:bg-cyan-700 text-cyan-200 text-xs font-bold rounded transition-colors"
                            >
                              All ({reserveUnits.length})
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Integrated Recruit Button showing unit cost (Heroes excluded) */}
                    <button
                      onClick={() => onBuyUnit(template.id)}
                      disabled={!canAfford}
                      className={`px-3 py-1 rounded font-bold text-xs flex items-center gap-1 transition-all ${
                        canAfford
                          ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-md'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" /> Recruit ({template.cost}g)
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Non-purchasable Hero Units currently in Reserve */}
            {Object.keys(poolStackMap)
              .filter(name => !PURCHASABLE_UNITS.some(p => p.name === name))
              .map(name => {
                const reserveUnits = poolStackMap[name];
                const sample = reserveUnits[0];
                return (
                  <div
                    key={name}
                    className="bg-slate-900 p-3 rounded-xl border border-amber-500/40 transition-colors flex flex-col gap-2 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-amber-300 text-sm flex items-center gap-2">
                          ★ {sample.name}
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 uppercase font-mono border border-amber-800">
                            HERO (UNIQUE)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 uppercase mt-0.5">
                          HP: {sample.hp} | DMG: {sample.damage}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-300 font-mono px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded">
                        x{reserveUnits.length} in reserve
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
                      {selectedTerritory && (
                        <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-xs">
                          <span className="text-slate-400 font-bold mr-1">Deploy:</span>
                          <button
                            onClick={() => onAllocateUnit(selectedTerritory.id, reserveUnits[0].id)}
                            className="px-2 py-0.5 bg-green-900/80 hover:bg-green-700 text-green-200 font-bold text-xs rounded transition-colors"
                            title="Assign to territory"
                          >
                            1
                          </button>
                        </div>
                      )}
                      <span className="text-[11px] text-slate-500 italic">Unique Commander (Cannot be bought)</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Column: Assigned Garrison Pool (With Target Selector Bar at Top of Header) */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col h-full overflow-hidden space-y-3">
          {/* Header with Target Territory Switcher Tab inside Assigned Box */}
          <div className="pb-3 border-b border-slate-800 flex-shrink-0 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Assigned ({assignedDefenders.length})
              </h4>
              {selectedTerritory && assignedDefenders.length > 0 && (
                <button
                  onClick={handleReturnAllToReserve}
                  className="text-[11px] px-2 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold rounded transition-colors flex items-center gap-1"
                >
                  <ArrowLeftRight className="w-3 h-3" /> Recall All ({assignedDefenders.length})
                </button>
              )}
            </div>

            {/* Target Territory Switcher Tabs moved to top of Assigned Garrison Box */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 ml-1">Target City:</span>
              {activeTerritories.map(t => {
                const isSelected = t.id === currentTerritoryId;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelectTerritory(t.id)}
                    className={`px-2 py-0.5 rounded text-xs font-bold transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-600 text-black shadow-md'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <Shield className="w-3 h-3" /> {t.name} ({t.allocatedDefenders.length})
                  </button>
                );
              })}
            </div>
          </div>

          {!selectedTerritory ? (
            <div className="text-slate-500 text-xs italic py-4 text-center">
              Select a territory above to manage its garrison.
            </div>
          ) : assignedStacks.length === 0 ? (
            <div className="text-slate-600 text-xs italic py-8 text-center flex flex-col items-center justify-center flex-1 gap-2">
              <Shield className="w-8 h-8 text-slate-800" />
              No defenders assigned to {selectedTerritory.name} yet.
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {assignedStacks.map(stack => (
                <div
                  key={stack.name}
                  className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 hover:border-slate-700 text-xs transition-colors shadow-sm"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {stack.name}
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold font-mono border border-cyan-500/30">
                        x{stack.units.length}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                        {stack.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 uppercase mt-0.5">
                      HP: {stack.hp} | DMG: {stack.damage}
                    </div>
                  </div>

                  {/* Standardised Recall Action */}
                  {stack.name === 'City Militia' || stack.name === 'Garrison Soldier' || stack.units[0]?.abilities?.includes('Fixed Garrison') ? (
                    <span
                      className="px-2 py-1 bg-slate-800/80 border border-slate-700 text-slate-400 text-[11px] font-bold rounded cursor-not-allowed"
                      title={`${stack.name} are bound to defend their homeland and cannot be reassigned`}
                    >
                      Fixed Garrison
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-xs">
                      <span className="text-slate-400 font-bold mr-1">Recall:</span>
                      <button
                        onClick={() => onDeallocateUnit(selectedTerritory.id, stack.units[0].id)}
                        className="px-2 py-0.5 bg-red-900/80 hover:bg-red-700 text-red-200 font-bold text-xs rounded transition-colors"
                        title="Remove from territory"
                      >
                        1
                      </button>
                      {stack.units.length > 1 && (
                        <button
                          onClick={() => handleReturnStackToReserve(stack)}
                          className="px-2 py-0.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold rounded transition-colors"
                        >
                          All ({stack.units.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
