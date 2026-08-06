import React, { useState } from 'react';
import { useCampaign } from '../../context/CampaignContext';
import type { GameState } from '../../types/game';
import type { UnitTemplate } from '../../types/combat';
import { Shield, Play, ArrowLeft, FlaskConical, X, Sparkles, UserCheck, Layers } from 'lucide-react';
import { UNIT_ROSTER } from '../../data/units';

interface Props {
  onStartBattle?: () => void;
  onBackToMap?: () => void;
  onNavigate?: (view: GameState) => void;
  isSandboxMode?: boolean;
}

const GRID_COLS = 8;
const GRID_ROWS = 6;

export const PreBattleSetup: React.FC<Props> = ({ 
  onStartBattle, 
  onBackToMap, 
  onNavigate,
  isSandboxMode = false 
}) => {
  const { territories, globalUnitPool, updateUnitGridPosition } = useCampaign();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const territory = territories.find(t => t.hasActiveBattle) || territories[0];

  // In Sandbox mode, combine territory allocatedDefenders with remaining unallocated global pool/roster units
  const poolToUse = globalUnitPool.length > 0 ? globalUnitPool : UNIT_ROSTER;
  const allocatedDefenders = isSandboxMode
    ? [
        ...(territory?.allocatedDefenders || []),
        ...poolToUse.filter(g => !(territory?.allocatedDefenders || []).some(a => a.id === g.id))
      ]
    : (territory?.allocatedDefenders || []);

  // Filter units into assigned (has gridPosition) and unassigned
  const unassignedUnits = allocatedDefenders.filter(u => u.gridPosition === undefined);
  const assignedUnits = allocatedDefenders.filter(u => u.gridPosition !== undefined);

  // Group unassigned units into stacked cards by name
  const unassignedStacksMap = unassignedUnits.reduce((acc, unit) => {
    if (!acc[unit.name]) {
      acc[unit.name] = {
        name: unit.name,
        type: unit.type,
        hp: unit.hp,
        damage: unit.damage,
        units: []
      };
    }
    acc[unit.name].units.push(unit);
    return acc;
  }, {} as Record<string, { name: string; type: string; hp: number; damage: number; units: UnitTemplate[] }>);

  const unassignedStacks = Object.values(unassignedStacksMap);

  // Find which stack the currently selected unit belongs to
  const selectedUnit = unassignedUnits.find(u => u.id === selectedUnitId);

  const handleCellClick = (x: number, y: number) => {
    const occupant = assignedUnits.find(u => u.gridPosition?.x === x && u.gridPosition?.y === y);

    if (occupant) {
      if (selectedUnitId && selectedUnitId !== occupant.id) {
        // Case 2: Grid Cell occupied by a DIFFERENT Unit & a Unit is Selected
        // Swap / Return Logic: Return existing unit to bench, place newly selected unit onto (x, y)
        const currentSelected = selectedUnit;
        updateUnitGridPosition(territory.id, occupant.id, undefined);
        updateUnitGridPosition(territory.id, selectedUnitId, { x, y });

        if (currentSelected) {
          const remainingInStack = unassignedUnits.filter(
            u => u.name === currentSelected.name && u.id !== selectedUnitId
          );
          if (remainingInStack.length > 0) {
            setSelectedUnitId(remainingInStack[0].id);
          } else {
            setSelectedUnitId(null);
          }
        } else {
          setSelectedUnitId(null);
        }
      } else {
        // Case 3: Grid Cell occupied by the SAME Unit (Clicking a deployed unit or clicking occupied cell with same unit selected)
        // Recall Logic: Return unit back to unassigned bench
        updateUnitGridPosition(territory.id, occupant.id, undefined);
        setSelectedUnitId(null);
      }
    } else if (selectedUnitId) {
      // Case 1: Grid Cell is EMPTY & a Unit is Selected
      const currentSelected = selectedUnit;
      updateUnitGridPosition(territory.id, selectedUnitId, { x, y });

      if (currentSelected) {
        const remainingInStack = unassignedUnits.filter(
          u => u.name === currentSelected.name && u.id !== selectedUnitId
        );
        if (remainingInStack.length > 0) {
          setSelectedUnitId(remainingInStack[0].id);
        } else {
          setSelectedUnitId(null);
        }
      } else {
        setSelectedUnitId(null);
      }
    }
  };

  const handleStackClick = (units: UnitTemplate[]) => {
    if (units.length === 0) return;
    const firstUnit = units[0];

    // If a unit in this stack is already selected, deselect it; otherwise select first unit in stack
    if (selectedUnit && selectedUnit.name === firstUnit.name) {
      setSelectedUnitId(null);
    } else {
      setSelectedUnitId(firstUnit.id);
    }
  };

  const handleClearAll = () => {
    assignedUnits.forEach(u => {
      updateUnitGridPosition(territory.id, u.id, undefined);
    });
    setSelectedUnitId(null);
  };

  return (
    <div className="w-full h-full bg-slate-950 text-slate-200 flex flex-col">
      {/* Top Intel Header */}
      <div className="flex-shrink-0 flex justify-between items-center bg-slate-900 border-b border-slate-700 p-4 shadow-lg z-10">
        <div>
          <div className="flex items-center gap-3">
            {isSandboxMode ? (
              <FlaskConical className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
            ) : (
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
            )}
            <h2 className="text-xl md:text-2xl font-bold font-serif text-white">
              {isSandboxMode ? 'Sandbox Tactical Lab — Tactical Deployment' : `Defending ${territory.name}`}
            </h2>
            <span className={`text-[10px] md:text-xs uppercase tracking-widest border px-2 py-0.5 md:py-1 rounded font-bold ${
              isSandboxMode 
                ? 'bg-cyan-950 text-cyan-400 border-cyan-800' 
                : 'bg-red-950 text-red-400 border-red-800'
            }`}>
              {isSandboxMode ? 'Sandbox Mode' : `Ring ${territory.ringLevel}`}
            </span>
          </div>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            <span className="text-amber-400 font-semibold">Wave Intel:</span> {isSandboxMode ? '15 Test Orc Grunts (Simulation)' : '12 Orc Grunts, 1 Mid-Boss Commander (Skirmish)'}
          </p>
        </div>

        <div className="flex gap-3">
          {!isSandboxMode && onNavigate && (
            <button 
              onClick={() => onNavigate('sandbox')}
              className="px-3 md:px-4 py-2 md:py-2.5 bg-cyan-900/80 hover:bg-cyan-700 border border-cyan-500/50 text-cyan-200 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg transition-all"
            >
              <FlaskConical className="w-4 h-4" /> Test Formation in Sandbox
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Main Tactical Grid View */}
      <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6">
        <div className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 mb-3 font-bold flex justify-between w-full max-w-2xl px-2">
          <span>← Player Defense Zone (8×6)</span>
          <span className="text-amber-400">★ Gold Border = Choke Point (+20% Defense)</span>
        </div>

        {/* 8x6 Grid with Right-side Enemy Attack Direction Arrow */}
        <div className="flex items-center gap-3 sm:gap-4 max-w-full overflow-x-auto p-1">
          <div 
            className="grid gap-2 bg-slate-950 p-3 md:p-4 rounded-xl border border-slate-800 shadow-2xl max-w-full"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: GRID_ROWS }).map((_, y) => 
              Array.from({ length: GRID_COLS }).map((_, x) => {
                const isChokePoint = y === 2 || y === 3;
                const occupant = assignedUnits.find(u => u.gridPosition?.x === x && u.gridPosition?.y === y);
                const isSelectedForPlace = selectedUnitId !== null;

                return (
                  <button
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 aspect-square rounded-lg border-2 flex flex-col items-center justify-center relative transition-all shrink-0 group ${
                      occupant 
                        ? 'bg-slate-800 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                        : isChokePoint
                          ? 'border-amber-400/60 bg-amber-950/20 hover:bg-amber-900/30'
                          : 'border-slate-800 bg-slate-900/80 hover:border-slate-600'
                    } ${isSelectedForPlace && !occupant ? 'hover:border-cyan-400 hover:bg-cyan-950/30 animate-pulse' : ''}`}
                  >
                    {isChokePoint && !occupant && (
                      <Sparkles className="w-3 h-3 text-amber-400/40 absolute top-1 right-1" />
                    )}

                    {occupant ? (
                      <div className="flex flex-col items-center justify-between p-1 text-center w-full h-full relative z-0">
                        {/* HP Bar (Above Unit) */}
                        <div className="w-10 sm:w-11 md:w-12 h-1.5 bg-slate-950 border border-slate-700 rounded-full overflow-hidden shrink-0 mt-0.5">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${Math.max(0, Math.min(100, (occupant.hp / (occupant.maxHp || occupant.hp)) * 100))}%` }}
                          />
                        </div>

                        {/* Base Sprite: Plain Colored Circle */}
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full border-2 shrink-0 shadow-md flex items-center justify-center ${
                          occupant.type === 'hero' 
                            ? 'bg-amber-500 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                            : occupant.type === 'elite'
                            ? 'bg-purple-600 border-purple-300 shadow-[0_0_8px_rgba(147,51,234,0.5)]'
                            : 'bg-blue-600 border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                        }`} />

                        {/* Unit Name (Below Unit) */}
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-200 truncate max-w-full leading-tight text-center mb-0.5">
                          {occupant.name}
                        </span>

                        {/* Hover overlay to clear/recall */}
                        <div className="absolute inset-0 bg-red-900/80 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity z-10">
                          <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[9px] md:text-[10px] text-slate-700 font-mono">
                        {x},{y}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Enemy Attack Direction Arrow (Points Left towards Grid) */}
          <div 
            data-testid="enemy-attack-indicator"
            className="flex flex-col items-center justify-center bg-red-950/40 border border-red-800/80 p-3 sm:p-4 rounded-xl text-red-400 shrink-0 shadow-lg select-none"
          >
            <div className="flex items-center gap-1 animate-pulse">
              <ArrowLeft className="w-6 h-6 md:w-8 md:h-8 text-red-500 stroke-[3]" />
              <span className="text-xs md:text-sm font-black tracking-widest text-red-400 hidden sm:inline">
                ATTACK
              </span>
            </div>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-red-300/80 mt-1 text-center leading-tight">
              Enemy Wave<br />Direction
            </span>
          </div>
        </div>
      </div>

      {/* Unassigned Unit Bench (Stacked Cards with Wrap Layout) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shrink-0">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Unassigned Bench ({unassignedUnits.length} Total Units)
            </h3>
            {selectedUnit && (
              <span className="text-xs text-cyan-400 font-bold bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded flex items-center gap-1">
                Deploying: {selectedUnit.name} (Click Grid)
              </span>
            )}
          </div>
          {assignedUnits.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-xs text-red-400 hover:text-red-300 font-bold uppercase tracking-wider"
            >
              Clear Grid ({assignedUnits.length})
            </button>
          )}
        </div>

        {/* Wrapping Grid Layout instead of Horizontal Scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {unassignedStacks.length === 0 ? (
            <div className="col-span-full text-slate-500 text-sm italic py-2 text-center">
              {allocatedDefenders.length === 0 
                ? "No defenders allocated to this territory yet! Go back to Empire Management to assign troops."
                : "All allocated defenders have been deployed onto the grid!"
              }
            </div>
          ) : (
            unassignedStacks.map(stack => {
              const isSelectedStack = selectedUnit && selectedUnit.name === stack.name;
              return (
                <button
                  key={stack.name}
                  onClick={() => handleStackClick(stack.units)}
                  className={`flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left relative ${
                    isSelectedStack 
                      ? 'border-cyan-400 bg-cyan-950/60 shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-[1.02]' 
                      : 'border-slate-700 bg-slate-950 hover:border-slate-500 hover:bg-slate-900/80'
                  }`}
                >
                  {/* Stack Quantity Badge */}
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-black font-black text-xs rounded-full shadow-md flex items-center gap-0.5">
                    ×{stack.units.length}
                  </div>

                  <div className="flex justify-between items-center w-full pr-8">
                    <span className="font-bold text-white text-sm truncate">{stack.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase mt-0.5">{stack.type}</span>
                  
                  <div className="text-[11px] text-slate-400 mt-2 font-mono flex justify-between w-full">
                    <span>HP: {stack.hp}</span>
                    <span>DMG: {stack.damage}</span>
                  </div>

                  {isSelectedStack && (
                    <div className="mt-2 text-[10px] text-cyan-300 font-bold flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Ready to Place 1-by-1
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
      </div>

      {/* Action Bar */}
      <div className="flex-shrink-0 flex justify-between items-center p-4 border-t border-slate-700 bg-slate-900 z-10">
        {onBackToMap && (
          <button 
            onClick={onBackToMap}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase tracking-wider rounded-lg flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> {isSandboxMode ? 'Back to Mode Select' : 'Back to Map'}
          </button>
        )}

        {onStartBattle && (
          <button 
            onClick={onStartBattle}
            className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all hover:scale-105 flex items-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" /> {isSandboxMode ? 'Launch Simulation' : 'Start Wave'} ({assignedUnits.length} Deployed)
          </button>
        )}
      </div>
    </div>
  );
};
