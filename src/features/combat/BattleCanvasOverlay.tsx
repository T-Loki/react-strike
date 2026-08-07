import React from 'react';
import type { GameState } from '../../types/game';
import type { Unit, UnitTemplate } from '../../types/combat';
import { ArrowLeft, Pause, Play, FastForward, RefreshCw, Skull, Shield, Info, X, ChevronUp, ChevronDown, Swords, Flag } from 'lucide-react';

interface Props {
  hudStats: {
    fps: number;
    defendersCount: number;
    hordeCount: number;
    phase: string;
    waveInfo?: import('../../types/combat').WaveInfo;
  };
  selectedUnit: { unit: Unit; stateName: string } | null;
  setSelectedUnit: (val: { unit: Unit; stateName: string } | null) => void;
  isPaused: boolean;
  togglePause: () => void;
  gameSpeed?: number;
  setGameSpeed?: (speed: number) => void;
  onSurrenderBattle?: () => void;
  enemyMenuOpen: boolean;
  setEnemyMenuOpen: (val: boolean | ((prev: boolean) => boolean)) => void;
  enemyCatalog: UnitTemplate[];
  spawnEnemies: (stats: Partial<Unit>, count: number) => void;
  initBattlefield: () => void;
  onBackToMap?: () => void;
  onNavigate?: (view: GameState) => void;
  isSandboxMode?: boolean;
  onSurrenderCity?: () => void;
  onVictoryComplete?: () => void;
}

const QuadrupleArrowIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3" }) => (
  <svg viewBox="0 0 26 24" fill="currentColor" className={className}>
    <polygon points="2,4 9,12 2,20" />
    <polygon points="8,4 15,12 8,20" />
    <polygon points="14,4 21,12 14,20" />
    <polygon points="20,4 25,12 20,20" />
  </svg>
);

export const BattleCanvasOverlay: React.FC<Props> = ({
  hudStats,
  selectedUnit,
  setSelectedUnit,
  isPaused,
  togglePause,
  gameSpeed = 1,
  setGameSpeed,
  onSurrenderBattle,
  enemyMenuOpen,
  setEnemyMenuOpen,
  enemyCatalog,
  spawnEnemies,
  initBattlefield,
  onBackToMap,
  onNavigate,
  isSandboxMode = false,
  onSurrenderCity,
  onVictoryComplete,
}) => {

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Banner Alert (Wave Title & Boss Alert) */}
      {hudStats.waveInfo && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-1 z-30">
          <div className={`px-4 py-1.5 rounded-full backdrop-blur-md border text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl ${
            hudStats.waveInfo.isBossWave
              ? 'bg-red-950/90 border-red-600 text-red-400 animate-pulse'
              : 'bg-slate-950/90 border-slate-700 text-amber-300'
          }`}>
            {hudStats.waveInfo.isBossWave ? <Skull className="w-4 h-4 text-red-500" /> : <Swords className="w-3.5 h-3.5 text-amber-400" />}
            <span>{hudStats.waveInfo.waveTitle || `Wave ${hudStats.waveInfo.currentWave}`}</span>
            {hudStats.waveInfo.isBossWave && (
              <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                BOSS WAVE!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Control Bar & Debug HUD */}
      <div className="flex justify-between items-start pointer-events-auto">
        {/* Left Action Buttons */}
        <div className="flex gap-3 items-center">
          {onBackToMap ? (
            <button
              onClick={onBackToMap}
              className="px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold text-sm shadow-xl backdrop-blur-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> {isSandboxMode ? 'Back to Sandbox' : 'Return to Pre-Battle Planning'}
            </button>
          ) : onNavigate ? (
            <button
              onClick={() => onNavigate('battle')}
              className="px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold text-sm shadow-xl backdrop-blur-md transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> {isSandboxMode ? 'Back to Sandbox' : 'Return to Pre-Battle Planning'}
            </button>
          ) : null}

          {/* Integrated Segmented Speed Control (0x / 0.5x / 1x / 2x / 4x) */}
          <div className="flex bg-slate-950/90 border border-slate-800 p-1 rounded-xl shadow-xl backdrop-blur-md items-center gap-1 font-mono text-xs font-bold">
            {[0, 0.5, 1, 2, 4].map((speed) => {
              const isActive = speed === 0 ? isPaused : (!isPaused && gameSpeed === speed);
              return (
                <button
                  key={speed}
                  onClick={() => {
                    if (speed === 0) {
                      if (!isPaused) togglePause();
                    } else {
                      if (isPaused) togglePause();
                      setGameSpeed?.(speed);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold scale-[1.03]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title={speed === 0 ? 'Pause simulation (0x speed)' : `Set speed to ${speed}x`}
                >
                  {speed === 0 && <Pause className="w-3 h-3 fill-current" />}
                  {speed === 0.5 && <Play className="w-3 h-3 fill-current opacity-60" />}
                  {speed === 1 && <Play className="w-3 h-3 fill-current" />}
                  {speed === 2 && <FastForward className="w-3 h-3 fill-current" />}
                  {speed === 4 && <QuadrupleArrowIcon className="w-3.5 h-3 fill-current" />}
                  {speed}x
                </button>
              );
            })}
          </div>

          {onSurrenderBattle && hudStats.phase !== 'DEFEAT' && hudStats.phase !== 'SURRENDERED' && hudStats.phase !== 'VICTORY' && (
            <button
              onClick={onSurrenderBattle}
              className="px-4 py-2 rounded-xl flex items-center justify-center gap-2 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 font-bold text-sm shadow-xl backdrop-blur-md transition-all hover:scale-[1.02]"
              title="Surrender battle immediately"
            >
              <Flag className="w-4 h-4 text-red-400" /> Surrender
            </button>
          )}
        </div>

        {/* Right Compact Stats Overlay */}
        <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-lg flex gap-3 text-[11px] font-mono shadow-xl items-center border-l-2 border-l-amber-500">
          <div className="flex items-center gap-1.5">
            <span className="opacity-50 text-[9px] uppercase tracking-wider">FPS</span>
            <span className="text-amber-400 font-bold text-xs">{hudStats.fps}</span>
          </div>
          <div className="w-px h-3.5 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="opacity-50 text-[9px] uppercase tracking-wider">Def</span>
            <span className="text-emerald-400 font-bold text-xs">{hudStats.defendersCount}</span>
          </div>
          <div className="w-px h-3.5 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="opacity-50 text-[9px] uppercase tracking-wider">Horde</span>
            <span className="text-red-400 font-bold text-xs">{hudStats.hordeCount}</span>
          </div>
          {hudStats.waveInfo && (
            <>
              <div className="w-px h-3.5 bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <span className="opacity-50 text-[9px] uppercase tracking-wider">Wave</span>
                <span className="text-purple-400 font-extrabold text-xs">
                  {hudStats.waveInfo.totalWaves 
                    ? `${hudStats.waveInfo.currentWave}/${hudStats.waveInfo.totalWaves}` 
                    : `${hudStats.waveInfo.currentWave}`}
                </span>
              </div>
            </>
          )}
          <div className="w-px h-3.5 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="opacity-50 text-[9px] uppercase tracking-wider">Phase</span>
            <span className={`font-bold text-[10px] uppercase ${
              hudStats.phase === 'VICTORY' ? 'text-emerald-400' :
              hudStats.phase === 'DEFEAT' || hudStats.phase === 'SURRENDERED' ? 'text-red-400' :
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
              <span className="opacity-60">Faction:</span>
              <span className={`font-bold uppercase ${selectedUnit.unit.faction === 'pantheon' ? 'text-amber-400' : 'text-red-400'}`}>
                {selectedUnit.unit.faction || (selectedUnit.unit.team === 'defender' ? 'pantheon' : 'horde')}
              </span>
            </div>
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
              <span className="opacity-60">Weight (Mass):</span>
              <span className="text-purple-300 font-bold">{selectedUnit.unit.weight ?? 1.0}</span>
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

      {/* Bottom Interactive Control Panel (Sandbox Mode Only) */}
      {isSandboxMode && (
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
                {enemyCatalog.map(entry => (
                  <div
                    key={entry.id || entry.name}
                    className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 transition-colors"
                  >
                    <span className="text-lg leading-none select-none">{entry.icon || '⚔️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{entry.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        HP {entry.hp} · DMG {entry.damage} · SPD {entry.speed ?? 70}
                        {(entry.armor ?? 0) > 0 ? ` · ARM ${entry.armor}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {([1, 5, 10] as const).map(n => (
                        <button
                          key={n}
                          onClick={() => spawnEnemies({
                            name: entry.name,
                            hp: entry.hp,
                            maxHp: entry.maxHp,
                            damage: entry.damage,
                            speed: entry.speed ?? 70,
                            armor: entry.armor ?? 0,
                            faction: (entry.faction as 'pantheon' | 'horde') || 'horde',
                            weight: entry.weight
                          }, n)}
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
      )}

      {/* Victory / Defeat Overlay Banners */}
      {hudStats.phase === 'VICTORY' && (
        <div className="absolute inset-0 z-50 pointer-events-auto flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-emerald-500/80 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
            <Shield className="w-16 h-16 text-emerald-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-extrabold text-emerald-400 uppercase tracking-widest mb-2">Victory!</h2>
            <p className="text-slate-300 text-sm mb-6">The defensive line held strong against the horde infestation.</p>
            <button
              onClick={onVictoryComplete || onBackToMap || (() => onNavigate?.('battle'))}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              {isSandboxMode ? 'Return to Sandbox' : 'Continue Campaign'}
            </button>
          </div>
        </div>
      )}

      {(hudStats.phase === 'DEFEAT' || hudStats.phase === 'SURRENDERED') && (
        <div className="absolute inset-0 z-50 pointer-events-auto flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-red-500/80 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
            {hudStats.phase === 'SURRENDERED' ? (
              <Flag className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
            ) : (
              <Skull className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
            )}
            <h2 className="text-3xl font-extrabold text-red-500 uppercase tracking-widest mb-2">
              {hudStats.phase === 'SURRENDERED' ? 'Surrender!' : 'Defeat!'}
            </h2>
            <p className="text-slate-300 text-sm mb-6">
              {hudStats.phase === 'SURRENDERED'
                ? 'You chose to surrender this engagement.'
                : 'The defenders were overwhelmed. The territory has fallen.'}
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={initBattlefield}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold rounded-xl text-sm transition-all"
                >
                  Retry Battle
                </button>
                <button
                  onClick={onBackToMap || (() => onNavigate?.('battle'))}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-bold rounded-xl text-sm transition-all"
                >
                  {isSandboxMode ? 'Retreat' : 'Pre-Battle Planning'}
                </button>
              </div>
              {!isSandboxMode && (
                <button
                  onClick={onSurrenderCity || onBackToMap}
                  className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-wider rounded-xl text-xs shadow-lg transition-all"
                >
                  Give Up City (+250g Salvage)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
