import React, { useState } from 'react';
import type { Territory, UnitTemplate } from '../../types/combat';
import { UNIT_ROSTER } from '../../data/units';
import { X, Users, Coins, Shield, ArrowLeftRight } from 'lucide-react';

interface Props {
  territories: Territory[];
  globalUnitPool: UnitTemplate[];
  gold: number;
  initialTerritoryId?: string | null;
  onClose: () => void;
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

export const UnitLogisticsModal: React.FC<Props> = ({
  territories,
  globalUnitPool,
  gold,
  initialTerritoryId,
  onClose,
  onAllocateUnit,
  onDeallocateUnit,
  onBuyUnit,
  onTransferUnits,
}) => {
  const activeTerritories = territories.filter(t => !t.isScorched);
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>(
    initialTerritoryId || (activeTerritories[0]?.id ?? '')
  );

  const selectedTerritory = territories.find(t => t.id === selectedTerritoryId);

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full p-6 relative shadow-2xl flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Allocate Troops to {selectedTerritory ? selectedTerritory.name : 'Territory'}
          </h2>
          <p className="text-slate-400 text-sm">
            Recruit fresh reinforcements directly into your reserve pool and deploy unit stacks to garrisons.
          </p>
        </div>

        {/* Split View Content (2 Side-by-Side Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto min-h-0">
          {/* Left Column: Available Pool & Integrated Recruitment Shop */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 flex-shrink-0">
              <h4 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Available Pool ({globalUnitPool.length})
              </h4>
              {selectedTerritory && globalUnitPool.length > 0 && (
                <button
                  onClick={handleTransferAllToGarrison}
                  className="text-xs px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-bold rounded transition-colors flex items-center gap-1"
                >
                  <ArrowLeftRight className="w-3 h-3" /> Deploy All ({globalUnitPool.length})
                </button>
              )}
            </div>

            {/* Integrated Unit Roster Cards */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
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
            </div>
          </div>

          {/* Right Column: Assigned Garrison Pool (With Target Selector Tabs at top of Header) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col space-y-3">
            <div className="pb-3 border-b border-slate-800 flex-shrink-0 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Assigned ({assignedDefenders.length})
                </h4>
                {selectedTerritory && assignedDefenders.length > 0 && (
                  <button
                    onClick={handleReturnAllToReserve}
                    className="text-xs px-2.5 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold rounded transition-colors flex items-center gap-1"
                  >
                    <ArrowLeftRight className="w-3 h-3" /> Recall All ({assignedDefenders.length})
                  </button>
                )}
              </div>

              {/* Target Territory Tabs inside Assigned Garrison Box Header */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 ml-1">Target City:</span>
                {activeTerritories.map(t => {
                  const isSelected = t.id === selectedTerritoryId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTerritoryId(t.id)}
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
              <div className="text-slate-500 text-sm italic py-4 text-center">
                Select a territory above to manage its garrison.
              </div>
            ) : assignedStacks.length === 0 ? (
              <div className="text-slate-600 text-sm italic py-8 text-center flex flex-col items-center justify-center flex-1 gap-2">
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

        {/* Modal Action Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase tracking-wider rounded-lg shadow-lg transition-transform hover:scale-105"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
