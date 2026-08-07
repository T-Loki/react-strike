import React from 'react';
import { Layers, Infinity, UserCheck } from 'lucide-react';

import type { UnitTemplate } from '../../types/combat';

export type StackEntry = {
  name: string;
  type: string;
  hp: number;
  damage: number;
  units: UnitTemplate[];
  infinite: boolean;
  template?: UnitTemplate;
};

interface Props {
  isSandboxMode: boolean;
  unassignedUnits: UnitTemplate[];
  assignedUnits: UnitTemplate[];
  displayStacks: StackEntry[];
  selectionLabel: string | null;
  isSandboxSelection: boolean;
  sandboxSelectedName: string | null;
  selectedUnit: UnitTemplate | undefined;
  handleStackClick: (stack: StackEntry) => void;
  handleClearAll: () => void;
}

export const UnitRosterList: React.FC<Props> = ({
  isSandboxMode,
  unassignedUnits,
  assignedUnits,
  displayStacks,
  selectionLabel,
  isSandboxSelection,
  sandboxSelectedName,
  selectedUnit,
  handleStackClick,
  handleClearAll
}) => {
  const [typeFilter, setTypeFilter] = React.useState<'all' | 'hero' | 'common' | 'elite'>('all');

  const filteredStacks = displayStacks.filter(stack => {
    if (typeFilter === 'all') return true;
    return stack.type.toLowerCase() === typeFilter;
  });

  return (
    <div className="w-[576px] flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 overflow-hidden">
      <div className="flex-shrink-0 flex justify-between items-center px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Unit Bench
          </h3>
          {isSandboxMode ? (
            <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
              (<Infinity className="w-3 h-3 inline" /> non-hero)
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 font-mono">
              ({unassignedUnits.length} ready)
            </span>
          )}
        </div>
        {assignedUnits.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider"
          >
            Clear ({assignedUnits.length})
          </button>
        )}
      </div>

      {/* Filter Tabs by Unit Type: All / Hero / Common / Elite */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-slate-950/60 border-b border-slate-800/80">
        <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Filter:</span>
        {(['all', 'hero', 'common', 'elite'] as const).map(f => {
          const isActive = typeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {selectionLabel && (
        <div className="flex-shrink-0 mx-3 mt-3 px-3 py-2 bg-cyan-950 border border-cyan-700 rounded-lg">
          <p className="text-[11px] text-cyan-300 font-bold flex items-center gap-1">
            <UserCheck className="w-3 h-3" />
            Deploying: <span className="text-white">{selectionLabel}</span>
            {isSandboxSelection && <span className="text-cyan-500 ml-1">(∞)</span>}
          </p>
          <p className="text-[10px] text-cyan-500 mt-0.5">Click a grid cell to place · Click again to deselect</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
        {filteredStacks.length === 0 ? (
          <div className="col-span-2 text-slate-500 text-xs italic py-4 text-center">
            {displayStacks.length === 0
              ? (assignedUnits.length === 0 
                  ? "No defenders allocated yet. Go to Empire Management to assign troops."
                  : "All defenders deployed!")
              : `No units matching '${typeFilter.toUpperCase()}' filter.`
            }
          </div>
        ) : (
          filteredStacks.map(stack => {
            const isSelectedStack = isSandboxSelection
              ? sandboxSelectedName === stack.name
              : selectedUnit && selectedUnit.name === stack.name;
            return (
              <button
                key={stack.name}
                onClick={() => handleStackClick(stack)}
                className={`w-full flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left relative ${
                  isSelectedStack 
                    ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-[1.02]' 
                    : 'border-slate-700 bg-slate-950 hover:border-slate-500 hover:bg-slate-900/80'
                }`}
              >
                <div className={`absolute top-2 right-2 px-2 py-0.5 font-black text-[10px] rounded-full shadow-md flex items-center gap-0.5 ${
                  stack.infinite
                    ? 'bg-cyan-600 text-white'
                    : 'bg-amber-500 text-black'
                }`}>
                  {stack.infinite ? <Infinity className="w-3 h-3" /> : `×${stack.units.length}`}
                </div>

                <div className="flex items-center gap-2 pr-8 w-full">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    stack.type === 'hero' 
                      ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]' 
                      : stack.type === 'elite'
                      ? 'bg-purple-500 shadow-[0_0_6px_rgba(147,51,234,0.5)]'
                      : 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.4)]'
                  }`} />
                  <span className="font-bold text-white text-sm truncate">{stack.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase mt-0.5 ml-5">
                  {stack.type}{stack.infinite ? ' · Unlimited' : ''}
                </span>
                
                <div className="text-[11px] text-slate-400 mt-2 font-mono flex justify-between w-full">
                  <span>HP: {stack.hp}</span>
                  <span>DMG: {stack.damage}</span>
                </div>

                {isSelectedStack && (
                  <div className="mt-2 text-[10px] text-cyan-300 font-bold flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Ready to Place
                  </div>
                )}
              </button>
            );
          })
        )}
        </div>
      </div>

      {assignedUnits.length > 0 && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-slate-800 bg-slate-950/60">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Deployed</p>
          <p className="text-sm font-bold text-emerald-400">{assignedUnits.length} units on grid</p>
        </div>
      )}
    </div>
  );
};
