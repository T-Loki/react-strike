import React, { useState } from 'react';
import { useCampaign } from '../../context/CampaignContext';
import type { GameState } from '../../types/game';
import type { UnitTemplate } from '../../types/combat';
import { Shield, Play, ArrowLeft, FlaskConical, Home } from 'lucide-react';
import { FACTIONS } from '../../data/units';
import { FormationGrid } from './FormationGrid';
import { UnitRosterList, type StackEntry } from './UnitRosterList';
import { DEPLOY_GRID_COLS, DEPLOY_GRID_ROWS } from '../../core/factories/UnitFactory';

interface Props {
  onStartBattle?: () => void;
  onBackToMap?: () => void;
  onNavigate?: (view: GameState) => void;
  isSandboxMode?: boolean;
}

// Non-hero unit templates used for the sandbox infinite bench
const SANDBOX_INFINITE_UNITS: UnitTemplate[] = FACTIONS.pantheon.roster.filter(
  u => u.type !== 'hero' && u.name !== 'City Militia' && u.name !== 'Garrison Soldier'
);

export const PreBattleSetup: React.FC<Props> = ({ 
  onStartBattle, 
  onBackToMap, 
  onNavigate,
  isSandboxMode = false 
}) => {
  const { territories, globalUnitPool, sandboxDefenders, updateUnitGridPosition } = useCampaign();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const territory = territories.find(t => t.hasActiveBattle) || territories[0];
  const activeLocationId = isSandboxMode ? 'sandbox' : territory.id;

  // Combined list of defenders for the grid
  const poolToUse = globalUnitPool.length > 0 ? globalUnitPool : FACTIONS.pantheon.roster;
  const allocatedDefenders = isSandboxMode
    ? [
        ...sandboxDefenders,
        ...poolToUse.filter(g => !sandboxDefenders.some(a => a.id === g.id))
      ]
    : (territory?.allocatedDefenders || []);

  // Filter units into assigned (has gridPosition) and unassigned
  const unassignedUnits = allocatedDefenders.filter(u => u.gridPosition === undefined);
  const assignedUnits = allocatedDefenders.filter(u => u.gridPosition !== undefined);

  let displayStacks: StackEntry[];

  if (isSandboxMode) {
    const infiniteStacks: StackEntry[] = SANDBOX_INFINITE_UNITS.map(tmpl => ({
      name: tmpl.name,
      type: tmpl.type,
      hp: tmpl.hp,
      damage: tmpl.damage,
      units: [],
      infinite: true,
      template: tmpl,
    }));

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
    const map: Record<string, StackEntry> = {};
    unassignedUnits.forEach(unit => {
      if (!map[unit.name]) {
        map[unit.name] = { name: unit.name, type: unit.type, hp: unit.hp, damage: unit.damage, units: [], infinite: false };
      }
      map[unit.name].units.push(unit);
    });
    displayStacks = Object.values(map);
  }

  const isSandboxSelection = selectedUnitId?.startsWith('sandbox:');
  const sandboxSelectedName = isSandboxSelection ? selectedUnitId!.slice('sandbox:'.length) : null;
  const selectedUnit = isSandboxSelection
    ? undefined
    : unassignedUnits.find(u => u.id === selectedUnitId);
  const isAnySelected = selectedUnitId !== null;

  const handleCellClick = (x: number, y: number) => {
    const occupant = assignedUnits.find(u => u.gridPosition?.x === x && u.gridPosition?.y === y);

    if (occupant) {
      const isSameUnit = occupant.id === selectedUnitId || 
        (isSandboxSelection && occupant.name === sandboxSelectedName) ||
        (selectedUnit && occupant.name === selectedUnit.name);

      if (isSameUnit) {
        updateUnitGridPosition(activeLocationId, occupant.id, undefined);
        if (!isSandboxSelection) {
          setSelectedUnitId(null);
        }
      } else if (selectedUnitId) {
        if (isSandboxSelection && sandboxSelectedName) {
          updateUnitGridPosition(activeLocationId, occupant.id, undefined);
          const tmpl = SANDBOX_INFINITE_UNITS.find(t => t.name === sandboxSelectedName);
          if (tmpl) {
            const newId = `sandbox_${tmpl.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            updateUnitGridPosition(activeLocationId, newId, { x, y }, tmpl);
          }
        } else {
          updateUnitGridPosition(activeLocationId, occupant.id, undefined);
          updateUnitGridPosition(activeLocationId, selectedUnitId!, { x, y });
          const currentSelected = selectedUnit;
          if (currentSelected) {
            const remaining = unassignedUnits.filter(u => u.name === currentSelected.name && u.id !== selectedUnitId);
            setSelectedUnitId(remaining[0]?.id ?? null);
          } else {
            setSelectedUnitId(null);
          }
        }
      } else {
        updateUnitGridPosition(activeLocationId, occupant.id, undefined);
        setSelectedUnitId(null);
      }
    } else if (selectedUnitId) {
      if (isSandboxSelection && sandboxSelectedName) {
        const tmpl = SANDBOX_INFINITE_UNITS.find(t => t.name === sandboxSelectedName);
        if (tmpl) {
          const newId = `sandbox_${tmpl.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          updateUnitGridPosition(activeLocationId, newId, { x, y }, tmpl);
        }
      } else {
        const currentSelected = selectedUnit;
        updateUnitGridPosition(activeLocationId, selectedUnitId!, { x, y });
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
      updateUnitGridPosition(activeLocationId, u.id, undefined);
    });
    setSelectedUnitId(null);
  };

  // ── Auto-fallback spawning when starting wave with 0 deployed units ──
  const handleStartWaveWrapper = () => {
    if (!onStartBattle) return;

    if (assignedUnits.length === 0) {
      // Emergency auto-spawn 3 units into random grid positions
      const candidatesToDeploy = allocatedDefenders.length >= 3
        ? allocatedDefenders.slice(0, 3)
        : [
            ...allocatedDefenders,
            { ...FACTIONS.pantheon.garrison[0], id: `emerg_garrison_1_${Date.now()}` },
            { ...FACTIONS.pantheon.garrison[0], id: `emerg_garrison_2_${Date.now()}` },
            { ...FACTIONS.pantheon.garrison[0], id: `emerg_garrison_3_${Date.now()}` },
          ].slice(0, 3);

      const availableGridCoords: { x: number; y: number }[] = [];
      for (let y = 0; y < DEPLOY_GRID_ROWS; y++) {
        for (let x = 0; x < DEPLOY_GRID_COLS; x++) {
          availableGridCoords.push({ x, y });
        }
      }

      // Shuffle available positions
      const shuffled = [...availableGridCoords].sort(() => Math.random() - 0.5);

      candidatesToDeploy.forEach((unit, idx) => {
        const targetPos = shuffled[idx % shuffled.length];
        updateUnitGridPosition(activeLocationId, unit.id, targetPos, unit);
      });
    }

    onStartBattle();
  };

  const selectionLabel = isSandboxSelection
    ? sandboxSelectedName
    : selectedUnit?.name ?? null;

  return (
    <div className="w-full h-full bg-slate-950 text-slate-200 flex flex-col select-none overflow-hidden">
      {/* ── Top Header ── */}
      <div className="flex-shrink-0 flex flex-wrap justify-between items-center bg-slate-900 border-b border-slate-700 p-3.5 shadow-lg z-20 gap-3">
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
          <p className="text-slate-400 text-xs md:text-sm mt-0.5">
            <span className="text-amber-400 font-semibold">Wave Intel:</span> {isSandboxMode ? '15 Test Orc Grunts (Simulation)' : '12 Orc Grunts, 1 Mid-Boss Commander (Skirmish)'}
          </p>
        </div>

        {/* Top Header Navigation Buttons (Non-overlapping) */}
        <div className="flex flex-wrap items-center gap-2">
          {!isSandboxMode && onNavigate && (
            <button 
              onClick={() => onNavigate('sandbox')}
              className="px-3 py-1.5 bg-cyan-900/80 hover:bg-cyan-700 border border-cyan-500/50 text-cyan-200 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow transition-all"
            >
              <FlaskConical className="w-3.5 h-3.5" /> Test Formation in Sandbox
            </button>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate('menu')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Home className="w-3.5 h-3.5" /> Return to Main Menu
            </button>
          )}
        </div>
      </div>

      {/* ── Main Content: Left (Unit Bench) + Right (Draggable & Zoomable Deployment Grid) ── */}
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

      {/* ── Action Bar Footer ── */}
      <div className="flex-shrink-0 flex justify-between items-center p-4 border-t border-slate-700 bg-slate-900 z-20">
        {onBackToMap && (
          <button 
            onClick={onBackToMap}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {isSandboxMode ? 'Back to Mode Select' : 'Back to Map'}
          </button>
        )}

        {onStartBattle && (
          <button 
            onClick={handleStartWaveWrapper}
            className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all hover:scale-105 flex items-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" /> {isSandboxMode ? 'Launch Simulation' : 'Start Wave'} ({assignedUnits.length} Deployed)
          </button>
        )}
      </div>
    </div>
  );
};
