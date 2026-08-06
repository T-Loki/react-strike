import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { GameState } from '../../types/game';
import type { Unit } from '../../types/combat';
import { ArrowLeft, Play, Pause, RefreshCw, Users, Skull, Shield, Info, X } from 'lucide-react';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useGameEvent } from '../../hooks/useGameEvent';
import { useCampaign } from '../../context/CampaignContext';
import { UNIT_ROSTER } from '../../data/units';
import { getDistance } from '../../core/math/utils';
import { EndlessDoomWave, SkirmishWave } from '../../core/engine/WaveStrategy';

interface BattleCanvasProps {
  onBackToMap?: () => void;
  onNavigate?: (view: GameState) => void;
}

export const BattleCanvas: React.FC<BattleCanvasProps> = ({
  onBackToMap,
  onNavigate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useGameEngine();
  const { territories } = useCampaign();

  const activeTerritory = territories.find(t => t.hasActiveBattle) || territories[0];

  const [isPaused, setIsPaused] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<{ unit: Unit; stateName: string } | null>(null);
  const [hudStats, setHudStats] = useState({
    fps: 60,
    defendersCount: 0,
    hordeCount: 0,
    phase: 'HOLDING_POSITION',
  });

  useGameEvent('pause', () => setIsPaused(true));
  useGameEvent('resume', () => setIsPaused(false));

  const initBattlefield = useCallback(() => {
    engine.clearBoard();
    if (activeTerritory && activeTerritory.allocatedDefenders.length > 0) {
      engine.loadFormation(activeTerritory.allocatedDefenders);
    } else {
      engine.loadFormation(UNIT_ROSTER);
    }
    engine.spawnHordeWave(new EndlessDoomWave(), 18);
    setSelectedUnit(null);
  }, [activeTerritory, engine]);

  // Load formation on mount
  useEffect(() => {
    initBattlefield();
  }, [initBattlefield]);

  const togglePause = () => {
    engine.togglePause();
  };

  const spawnMoreDefenders = () => {
    const zoneConfig = engine.getZoneConfig();
    const { width } = engine.getCanvasSize();
    const spawnWidth = width * zoneConfig.playerSpawnRatio;
    
    UNIT_ROSTER.forEach((template, i) => {
      const px = 30 + Math.random() * (spawnWidth - 60);
      const py = 60 + (i * 90) + Math.random() * 40;
      engine.spawnDefender(px, py, template);
    });
  };

  const spawnMoreHorde = () => {
    engine.spawnHordeWave(new SkirmishWave(), 10);
  };

  // Canvas Click Handler to select unit for inspection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const entities = engine.getEntities();
    let clicked: { unit: Unit; stateName: string } | null = null;
    let minDist = 25;

    entities.forEach(ent => {
      if (ent.data.hp > 0) {
        const dist = getDistance(ent.data.x, ent.data.y, clickX, clickY);
        if (dist < minDist) {
          minDist = dist;
          clicked = { unit: ent.data, stateName: ent.getStateName() };
        }
      }
    });

    setSelectedUnit(clicked);
  };

  // 60 FPS Render loop
  const frameCountRef = useRef(0);
  const lastFpsCheckRef = useRef(performance.now());

  useGameEvent('tick', () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Update HUD Stats every 500ms
    frameCountRef.current++;
    const now = performance.now();
    if (now - lastFpsCheckRef.current >= 500) {
      const elapsedSec = (now - lastFpsCheckRef.current) / 1000;
      const currentFps = Math.round(frameCountRef.current / elapsedSec);
      setHudStats({
        fps: currentFps,
        defendersCount: engine.getDefenders().length,
        hordeCount: engine.getHorde().length,
        phase: engine.getBattlePhase(),
      });

      if (selectedUnit) {
        const updatedEnt = engine.getEntities().find(e => e.data.id === selectedUnit.unit.id && e.data.hp > 0);
        if (updatedEnt) {
          setSelectedUnit({ unit: updatedEnt.data, stateName: updatedEnt.getStateName() });
        } else {
          setSelectedUnit(null);
        }
      }

      frameCountRef.current = 0;
      lastFpsCheckRef.current = now;
    }

    // -------------------------------------------------------------
    // 1. Configurable Dynamic Zone Boundaries
    // -------------------------------------------------------------
    const zoneConfig = engine.getZoneConfig();

    const playerSpawnWidth = width * zoneConfig.playerSpawnRatio; // Default 30%
    const playerAreaWidth = width * zoneConfig.playerAreaRatio;   // Default 40%
    const neutralAreaWidth = width * zoneConfig.neutralAreaRatio; // Default 70%

    // Base background void
    ctx.fillStyle = '#070a12';
    ctx.fillRect(0, 0, width, height);

    // Section 1: Player Area Tint (0% to 40%) - Navy Slate Overlay
    ctx.fillStyle = 'rgba(30, 58, 138, 0.28)';
    ctx.fillRect(0, 0, playerAreaWidth, height);

    // Player Spawn Sub-Zone Highlight (0% to 30%)
    ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
    ctx.fillRect(0, 0, playerSpawnWidth, height);

    // Section 2: Neutral Area Tint (40% to 70%) - Charcoal / Amber Tint
    ctx.fillStyle = 'rgba(120, 53, 15, 0.20)';
    ctx.fillRect(playerAreaWidth, 0, neutralAreaWidth - playerAreaWidth, height);

    // Section 3: Horde Spawn Area Tint (70% to 100%) - Dark Crimson Overlay
    ctx.fillStyle = 'rgba(153, 27, 27, 0.28)';
    ctx.fillRect(neutralAreaWidth, 0, width - neutralAreaWidth, height);

    // Grid Overlay
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Out of Bounds Margins (Top/Bottom)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.fillRect(0, 0, width, 28);
    ctx.fillRect(0, height - 28, width, 28);

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, 28);
    ctx.lineTo(width, 28);
    ctx.moveTo(0, height - 28);
    ctx.lineTo(width, height - 28);
    ctx.stroke();

    // -------------------------------------------------------------
    // 2. Zone Dividers & Crisp Section Headers
    // -------------------------------------------------------------
    ctx.setLineDash([8, 6]);

    // Player Spawn Grid Line (30%)
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.40)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(playerSpawnWidth, 0);
    ctx.lineTo(playerSpawnWidth, height);
    ctx.stroke();

    // Player / Neutral Main Divider Line (40%)
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.80)'; // Glowing Amber Gold
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(playerAreaWidth, 0);
    ctx.lineTo(playerAreaWidth, height);
    ctx.stroke();

    // Neutral / Horde Divider Line (70%)
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.80)'; // Crimson Red
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(neutralAreaWidth, 0);
    ctx.lineTo(neutralAreaWidth, height);
    ctx.stroke();

    ctx.setLineDash([]); // Reset dash

    // Section Header Banners
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';

    const pSpawnPct = Math.round(zoneConfig.playerSpawnRatio * 100);
    const pAreaPct = Math.round(zoneConfig.playerAreaRatio * 100);
    const neutralPct = Math.round(zoneConfig.neutralAreaRatio * 100);

    // Player Area Header & Sub-labels
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`🛡️ PLAYER AREA (0-${pAreaPct}%)`, playerAreaWidth * 0.5, 45);
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.fillText(`Spawn (0-${pSpawnPct}%) | Movement & Defense Zone (${pSpawnPct}-${pAreaPct}%)`, playerAreaWidth * 0.5, 58);

    // Neutral Area Header
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`⚔️ NEUTRAL NO-MAN'S LAND (${pAreaPct}-${neutralPct}%)`, playerAreaWidth + (neutralAreaWidth - playerAreaWidth) * 0.5, 45);

    // Horde Area Header
    ctx.fillStyle = '#f87171';
    ctx.fillText(`💀 HORDE SPAWN ZONE (${neutralPct}-100%)`, neutralAreaWidth + (width - neutralAreaWidth) * 0.5, 45);

    // -------------------------------------------------------------
    // 3. Draw Attack Line Effects
    // -------------------------------------------------------------
    engine.getAttackEffects().forEach(eff => {
      const alpha = eff.duration / eff.maxDuration;
      ctx.strokeStyle = eff.color;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(eff.startX, eff.startY);
      ctx.lineTo(eff.endX, eff.endY);
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    });

    // -------------------------------------------------------------
    // 4. Draw Defender Units (Roster: Spearmen / Crossbowmen / Hero)
    // -------------------------------------------------------------
    engine.getDefenders().forEach(d => {
      const isHero = d.name.toLowerCase().includes('aric') || d.color === '#f59e0b';
      const radius = isHero ? 14 : 10;
      const isSelected = selectedUnit?.unit.id === d.id;

      // Selection Ring / Attack Flash
      if (isSelected || d.isAttacking) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius + (isSelected ? 6 : 4), 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.4)' : 'rgba(245, 158, 11, 0.3)';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#38bdf8' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Unit Body Sprite
      ctx.beginPath();
      ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = d.color || '#22c55e';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isHero ? '#fef08a' : '#f59e0b';
      ctx.stroke();

      // Direction Notch
      ctx.beginPath();
      ctx.moveTo(d.x + radius, d.y);
      ctx.lineTo(d.x + radius + 4, d.y);
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();

      // Health Bar
      const barWidth = isHero ? 36 : 28;
      const barHeight = 4;
      const barX = d.x - barWidth / 2;
      const barY = d.y - radius - 8;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      const hpRatio = Math.max(0, Math.min(1, d.hp / (d.maxHp || d.hp)));
      ctx.fillStyle = hpRatio > 0.5 ? (isHero ? '#f59e0b' : '#22c55e') : hpRatio > 0.2 ? '#eab308' : '#ef4444';
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);

      // Exact Assigned Unit Name Label
      ctx.fillStyle = isHero ? '#fef08a' : '#f8fafc';
      ctx.font = isHero ? 'bold 11px sans-serif' : 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.name, d.x, d.y + radius + 12);
    });

    // -------------------------------------------------------------
    // 5. Draw Horde Units (Crimson Red)
    // -------------------------------------------------------------
    engine.getHorde().forEach(h => {
      const radius = 8;
      const isSelected = selectedUnit?.unit.id === h.id;

      if (isSelected || h.isAttacking) {
        ctx.beginPath();
        ctx.arc(h.x, h.y, radius + (isSelected ? 5 : 3), 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? 'rgba(248, 113, 113, 0.4)' : 'rgba(239, 68, 68, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(h.x, h.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = h.color || '#ef4444';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#991b1b';
      ctx.stroke();

      // Direction Notch (Leftwards)
      ctx.beginPath();
      ctx.moveTo(h.x - radius, h.y);
      ctx.lineTo(h.x - radius - 4, h.y);
      ctx.strokeStyle = '#fca5a5';
      ctx.stroke();

      // Health Bar
      const barWidth = 24;
      const barHeight = 3;
      const barX = h.x - barWidth / 2;
      const barY = h.y - radius - 7;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      const hpRatio = Math.max(0, Math.min(1, h.hp / (h.maxHp || h.hp)));
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

      // Name Label
      ctx.fillStyle = '#fca5a5';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(h.name, h.x, h.y + radius + 11);
    });

    // -------------------------------------------------------------
    // 6. Draw Floating Damage Text
    // -------------------------------------------------------------
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    engine.getDamageTexts().forEach(dt => {
      ctx.fillStyle = dt.color;
      ctx.globalAlpha = dt.opacity;
      ctx.fillText(dt.text, dt.x, dt.y);
      ctx.globalAlpha = 1.0;
    });
  });

  // Canvas Resize Handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvasRef.current.width = w;
        canvasRef.current.height = h;
        engine.setCanvasSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [engine]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans select-none">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 z-0 block w-full h-full cursor-crosshair"
      />

      {/* Main UI Overlay Layer */}
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
        <div className="pointer-events-auto flex justify-center pb-4">
          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl flex gap-3 shadow-2xl items-center">
            <button
              onClick={initBattlefield}
              className="px-4 py-2.5 rounded-xl border border-amber-500/40 hover:bg-amber-500/10 text-amber-300 text-xs font-bold flex gap-2 items-center transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reset Formation
            </button>
            <div className="w-px h-6 bg-slate-800"></div>
            <button
              onClick={spawnMoreDefenders}
              className="px-4 py-2.5 rounded-xl border border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400 text-xs font-bold flex gap-2 items-center transition-colors"
            >
              <Users className="w-4 h-4" /> +3 Mix Defenders (Spear/Crossbow/Hero)
            </button>
            <button
              onClick={spawnMoreHorde}
              className="px-4 py-2.5 rounded-xl border border-red-500/40 hover:bg-red-500/10 text-red-400 text-xs font-bold flex gap-2 items-center transition-colors"
            >
              <Skull className="w-4 h-4" /> +10 Horde Wave
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
    </div>
  );
};
