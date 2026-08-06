import React, { useState } from 'react';
import { useCampaign } from '../../context/CampaignContext';
import type { GameState } from '../../types/game';
import type { UnitTemplate } from '../../types/combat';
import { Shield, Play, ArrowLeft, FlaskConical, X, Sparkles, UserCheck, Layers, Infinity } from 'lucide-react';
import { UNIT_ROSTER } from '../../data/units';
import { FormationGrid } from './FormationGrid';
import { UnitRosterList } from './UnitRosterList';

interface Props {
  onStartBattle?: () => void;
  onBackToMap?: () => void;
  onNavigate?: (view: GameState) => void;
  isSandboxMode?: boolean;
}

// Non-hero unit templates used for the sandbox infinite bench
const SANDBOX_INFINITE_UNITS: UnitTemplate[] = UNIT_ROSTER.filter(u => u.type !== 'hero');

export const PreBattleSetup: React.FC<Props> = ({ 
  onStartBattle, 
  onBackToMap, 
  onNavigate,
  isSandboxMode = false 
}) => {
  const { territories, globalUnitPool, updateUnitGridPosition } = useCampaign();
  // In sandbox mode, selectedUnitId may refer to either a real pool unit or a
  // template name (prefixed with "sandbox:") for the infinite bench.
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const territory = territories.find(t => t.hasActiveBattle) || territories[0];

  // ── Sandbox infinite bench logic ─────────────────────────────────────────────
  // In sandbox mode non-hero units are always available (infinite copies).
  // Hero units still come from the real pool (limited to 1).


  // Combined list of defenders for the grid (always uses territory.allocatedDefenders)
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

  // ── Stack display ──────────────────────────────────────────────────────────
  // For sandbox: show infinite non-hero stacks + real hero stack from pool.
  // For campaign: normal limited stacks from unassigned pool.

  type StackEntry = {
    name: string;
    type: string;
    hp: number;
    damage: number;
    units: UnitTemplate[];
    infinite: boolean;   // true = sandbox unlimited
    template?: UnitTemplate; // source template for spawning infinite copies
  };

  let displayStacks: StackEntry[];

  if (isSandboxMode) {
    // Infinite non-hero types (always present, never depleted)
    const infiniteStacks: StackEntry[] = SANDBOX_INFINITE_UNITS.map(tmpl => ({
      name: tmpl.name,
      type: tmpl.type,
      hp: tmpl.hp,
      damage: tmpl.damage,
      units: [],          // empty — we create fresh copies on demand
      infinite: true,
      template: tmpl,
    }));

    // Real hero units from pool (limited)
    const heroStacksMap: Record<string, StackEntry> = {};
    unassignedUnits
      .filter(u => u.type === 'hero')
      .forEach(u => {
        if (!heroStacksMap[u.name]) {
          heroStacksMap[u.name] = { name: u.name, type: u.type, hp: u.hp, damage: u.damage, units: [], infinite: false };
        }
        heroStacksMap[u.name].units.push(u);
      });

    displayStacks = [...infiniteStacks, ...Object.values(heroStacksMap)];
  } else {
    // Standard campaign mode: group unassigned into stacks by name
    const map: Record<string, StackEntry> = {};
    unassignedUnits.forEach(unit => {
      if (!map[unit.name]) {
        map[unit.name] = { name: unit.name, type: unit.type, hp: unit.hp, damage: unit.damage, units: [], infinite: false };
      }
      map[unit.name].units.push(unit);
    });
    displayStacks = Object.values(map);
  }

  // ── Selected unit resolution ──────────────────────────────────────────────
  // selectedUnitId can be:
  //   - a real unit ID (from pool)
  //   - "sandbox:<templateName>" for infinite bench selections
  const isSandboxSelection = selectedUnitId?.startsWith('sandbox:');
  const sandboxSelectedName = isSandboxSelection ? selectedUnitId!.slice('sandbox:'.length) : null;
  const selectedUnit = isSandboxSelection
    ? undefined
    : unassignedUnits.find(u => u.id === selectedUnitId);
  const isAnySelected = selectedUnitId !== null;

  // ── Cell click ────────────────────────────────────────────────────────────
  const handleCellClick = (x: number, y: number) => {
    const occupant = assignedUnits.find(u => u.gridPosition?.x === x && u.gridPosition?.y === y);

    if (occupant) {
      const isSameUnit = occupant.id === selectedUnitId || 
        (isSandboxSelection && occupant.name === sandboxSelectedName) ||
        (selectedUnit && occupant.name === selectedUnit.name);

      if (isSameUnit) {
        // Recall occupant back to bench
        updateUnitGridPosition(territory.id, occupant.id, undefined);
        if (!isSandboxSelection) {
          setSelectedUnitId(null);
        }
      } else if (selectedUnitId) {
        if (isSandboxSelection && sandboxSelectedName) {
          // Replace occupant with a brand-new copy of the infinite unit
          updateUnitGridPosition(territory.id, occupant.id, undefined);
          const tmpl = SANDBOX_INFINITE_UNITS.find(t => t.name === sandboxSelectedName);
          if (tmpl) {
            const newId = `sandbox_${tmpl.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            updateUnitGridPosition(territory.id, newId, { x, y }, tmpl);
          }
          // keep selection active so player can keep placing
        } else {
          // Swap real unit
          updateUnitGridPosition(territory.id, occupant.id, undefined);
          updateUnitGridPosition(territory.id, selectedUnitId!, { x, y });
          // Advance to next in same stack
          const currentSelected = selectedUnit;
          if (currentSelected) {
            const remaining = unassignedUnits.filter(u => u.name === currentSelected.name && u.id !== selectedUnitId);
            setSelectedUnitId(remaining[0]?.id ?? null);
          } else {
            setSelectedUnitId(null);
          }
        }
      } else {
        // No unit selected: Recall occupant back to bench
        updateUnitGridPosition(territory.id, occupant.id, undefined);
        setSelectedUnitId(null);
      }
    } else if (selectedUnitId) {
      if (isSandboxSelection && sandboxSelectedName) {
        // Spawn a fresh copy of the infinite unit
        const tmpl = SANDBOX_INFINITE_UNITS.find(t => t.name === sandboxSelectedName);
        if (tmpl) {
          const newId = `sandbox_${tmpl.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          updateUnitGridPosition(territory.id, newId, { x, y }, tmpl);
        }
        // Keep the sandbox selection active so the user can keep placing
      } else {
        // Place real unit
        const currentSelected = selectedUnit;
        updateUnitGridPosition(territory.id, selectedUnitId!, { x, y });
        if (currentSelected) {
          const remaining = unassignedUnits.filter(u => u.name === currentSelected.name && u.id !== selectedUnitId);
          setSelectedUnitId(remaining[0]?.id ?? null);
        } else {
          setSelectedUnitId(null);
        }
      }
    }
  };

  const handleStackClick = (stack: StackEntry) => {
    if (stack.infinite) {
      // Toggle sandbox infinite selection
      const key = `sandbox:${stack.name}`;
      setSelectedUnitId(selectedUnitId === key ? null : key);
    } else {
      if (stack.units.length === 0) return;
      const firstUnit = stack.units[0];
      if (selectedUnit && selectedUnit.name === firstUnit.name) {
        setSelectedUnitId(null);
      } else {
        setSelectedUnitId(firstUnit.id);
      }
    }
  };

  const handleClearAll = () => {
    assignedUnits.forEach(u => {
      updateUnitGridPosition(territory.id, u.id, undefined);
    });
    setSelectedUnitId(null);
  };

  // Label for the active selection
  const selectionLabel = isSandboxSelection
    ? sandboxSelectedName
    : selectedUnit?.name ?? null;

  return (
    <div className="w-full h-full bg-slate-950 text-slate-200 flex flex-col">
      {/* ── Top Intel Header ── */}
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

      {/* ── Main Content: Left (Unit Bench) + Right (Deployment Grid) ── */}
      <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
        <UnitRosterList
          isSandboxMode={isSandboxMode}
          unassignedUnits={unassignedUnits}
          assignedUnits={assignedUnits}
          displayStacks={displayStacks}
          selectionLabel={selectionLabel}
          isSandboxSelection={isSandboxSelection || false}
          sandboxSelectedName={sandboxSelectedName}
          selectedUnit={selectedUnit}
          handleStackClick={handleStackClick}
          handleClearAll={handleClearAll}
        />
        <FormationGrid
          assignedUnits={assignedUnits}
          isAnySelected={isAnySelected}
          handleCellClick={handleCellClick}
        />
      </div>

      {/* ── Action Bar ── */}
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
