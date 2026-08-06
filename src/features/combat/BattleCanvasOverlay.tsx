import React from 'react';
import type { GameState } from '../../types/game';
import type { Unit } from '../../types/combat';
import { ArrowLeft, Play, Pause, RefreshCw, Skull, Shield, Info, X, ChevronUp, ChevronDown, Swords } from 'lucide-react';

interface Props {
  hudStats: {
    fps: number;
    defendersCount: number;
    hordeCount: number;
    phase: string;
  };
  selectedUnit: { unit: Unit; stateName: string } | null;
  setSelectedUnit: (val: { unit: Unit; stateName: string } | null) => void;
  isPaused: boolean;
  togglePause: () => void;
  enemyMenuOpen: boolean;
  setEnemyMenuOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  ENEMY_CATALOGUE: readonly any[];
  spawnEnemies: (stats: any, count: number) => void;
  initBattlefield: () => void;
  onBackToMap?: () => void;
  onNavigate?: (view: GameState) => void;
  isSandboxMode?: boolean;
}

export const BattleCanvasOverlay: React.FC<Props> = ({
  hudStats,
  selectedUnit,
  setSelectedUnit,
  isPaused,
  togglePause,
  enemyMenuOpen,
  setEnemyMenuOpen,
  ENEMY_CATALOGUE,
  spawnEnemies,
  initBattlefield,
  onBackToMap,
  onNavigate,
  isSandboxMode
}) => {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Control Bar & Debug HUD */}
      <div className="flex justify-between items-start pointer-events-auto">
        {/* Left Action Buttons */}
        <div className="flex gap-3">
          {onBackToMap ? (
            <button
              onClick={onBackToMap}
              className="px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold text-sm shadow-xl backdrop-blur-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Retreat to Map
            </button>
          ) : onNavigate ? (
            <button
              onClick={() => onNavigate('battle')}
              className="px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold text-sm shadow-xl backdrop-blur-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Campaign Map
            </button>
          ) : null}

          <button
            onClick={togglePause}
            className={`px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm border shadow-xl backdrop-blur-md transition-all ${
              isPaused
                ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:border-slate-500'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Pause className="w-4 h-4 text-slate-300" />}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>

        {/* Right Debug HUD Overlay */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3.5 rounded-xl flex gap-5 text-xs font-mono shadow-2xl items-center border-l-4 border-l-amber-500">
          <div>
            <span className="opacity-50 uppercase tracking-wider block text-[10px]">FPS</span>
            <span className="text-amber-400 font-bold text-sm">{hudStats.fps}</span>
          </div>
          <div className="w-px h-6 bg-slate-800"></div>
          <div>
            <span className="opacity-50 uppercase tracking-wider block text-[10px]">Defenders</span>
            <span className="text-emerald-400 font-bold text-sm">{hudStats.defendersCount}</span>
          </div>
          <div className="w-px h-6 bg-slate-800"></div>
          <div>
            <span className="opacity-50 uppercase tracking-wider block text-[10px]">Horde</span>
            <span className="text-red-400 font-bold text-sm">{hudStats.hordeCount}</span>
          </div>
          <div className="w-px h-6 bg-slate-800"></div>
          <div>
            <span className="opacity-50 uppercase tracking-wider block text-[10px]">Phase</span>
            <span className={`font-bold text-xs uppercase ${
              hudStats.phase === 'VICTORY' ? 'text-emerald-400' :
              hudStats.phase === 'DEFEAT' ? 'text-red-400' :
              hudStats.phase === 'ENGAGING_ENEMY' ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              {hudStats.phase}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Unit Inspection Card Overlay */}
      {selectedUnit && (
        <div className="absolute top-20 left-6 z-40 pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-cyan-500/50 p-4 rounded-xl shadow-2xl w-64 text-xs font-sans">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm text-white">{selectedUnit.unit.name}</span>
            </div>
            <button onClick={() => setSelectedUnit(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1.5 font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="opacity-60">Team:</span>
              <span className={`font-bold uppercase ${selectedUnit.unit.team === 'defender' ? 'text-emerald-400' : 'text-red-400'}`}>
                {selectedUnit.unit.team}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">HP:</span>
              <span className="text-emerald-400 font-bold">{selectedUnit.unit.hp} / {selectedUnit.unit.maxHp}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Damage:</span>
              <span className="text-amber-400 font-bold">{selectedUnit.unit.damage}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Armor:</span>
              <span className="text-cyan-400 font-bold">{selectedUnit.unit.armor || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">Range:</span>
              <span className="text-slate-200">{selectedUnit.unit.range}px</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-60">AI State:</span>
              <span className="text-purple-400 font-bold">{selectedUnit.stateName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Interactive Control Panel */}
      <div className="pointer-events-auto flex flex-col items-center gap-2 pb-4">
        {/* Enemy Spawn Menu */}
        {enemyMenuOpen && (
          <div className="bg-slate-950/95 backdrop-blur-md border border-red-900/60 rounded-2xl shadow-2xl p-4 w-[660px] max-w-[95vw]">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
              <Skull className="w-4 h-4 text-red-400" />
              <span className="text-xs font-black uppercase tracking-widest text-red-400">Spawn Enemies</span>
              <span className="text-[10px] text-slate-500 ml-1">— unlimited, spawns from the right</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ENEMY_CATALOGUE.map(entry => (
                <div
                  key={entry.label}
                  className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 transition-colors"
                >
                  <span className="text-lg leading-none select-none">{entry.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{entry.label}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      HP {entry.stats.hp} · DMG {entry.stats.damage} · SPD {entry.stats.speed}
                      {entry.stats.armor > 0 ? ` · ARM ${entry.stats.armor}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {([1, 5, 10] as const).map(n => (
                      <button
                        key={n}
                        onClick={() => spawnEnemies(entry.stats, n)}
                        className="px-2 py-1 rounded-lg text-[10px] font-black border border-red-800/60 hover:bg-red-900/30 text-red-300 transition-colors"
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Persistent Action Bar */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl flex gap-3 shadow-2xl items-center">
          <button
            onClick={initBattlefield}
            className="px-4 py-2.5 rounded-xl border border-amber-500/40 hover:bg-amber-500/10 text-amber-300 text-xs font-bold flex gap-2 items-center transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reset Formation
          </button>
          <div className="w-px h-6 bg-slate-800" />
          <button
            onClick={() => setEnemyMenuOpen(o => !o)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex gap-2 items-center transition-colors ${
              enemyMenuOpen
                ? 'border-red-500 bg-red-900/30 text-red-300'
                : 'border-red-500/40 hover:bg-red-500/10 text-red-400'
            }`}
          >
            <Swords className="w-4 h-4" />
            Spawn Enemies
            {enemyMenuOpen
              ? <ChevronDown className="w-3 h-3" />
              : <ChevronUp className="w-3 h-3" />
            }
          </button>
        </div>
      </div>

      {/* Victory / Defeat Overlay Banners */}
      {hudStats.phase === 'VICTORY' && (
        <div className="absolute inset-0 z-50 pointer-events-auto flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/80 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
            <Shield className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-extrabold text-emerald-400 uppercase tracking-widest mb-2">Victory!</h2>
            <p className="text-slate-300 text-sm mb-6">The defensive line held strong against the horde infestation.</p>
            <button
              onClick={onBackToMap || (() => onNavigate?.('battle'))}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl uppercase tracking-wider shadow-lg transition-all"
            >
              Return to Campaign Map
            </button>
          </div>
        </div>
      )}

      {hudStats.phase === 'DEFEAT' && (
        <div className="absolute inset-0 z-50 pointer-events-auto flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-red-500/80 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
            <Skull className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-extrabold text-red-500 uppercase tracking-widest mb-2">Defeat!</h2>
            <p className="text-slate-300 text-sm mb-6">The defenders were overwhelmed. The territory has fallen.</p>
            <div className="flex gap-4">
              <button
                onClick={initBattlefield}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold rounded-xl text-sm transition-all"
              >
                Retry Battle
              </button>
              <button
                onClick={onBackToMap || (() => onNavigate?.('battle'))}
                className="flex-1 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition-all"
              >
                Retreat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
