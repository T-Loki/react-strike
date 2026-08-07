import React, { useEffect, useRef, useState } from 'react';
import type { Unit } from '../../types/combat';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useGameEvent } from '../../hooks/useGameEvent';
import { getSelectedUnitAtCoordinates } from '../../core/math/canvasSelection';
import { Move, ZoomIn, ZoomOut, Info } from 'lucide-react';
import {
  DEPLOY_GRID_COLS,
  DEPLOY_GRID_ROWS,
  DEPLOY_CELL_PX,
  DEPLOY_MARGIN_X,
  getDeployMarginY,
} from '../../core/factories/UnitFactory';

interface Props {
  selectedUnit: { unit: Unit; stateName: string } | null;
  setSelectedUnit: (val: { unit: Unit; stateName: string } | null) => void;
}

export const BattleCanvasRenderer: React.FC<Props> = ({ selectedUnit, setSelectedUnit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useGameEngine();

  // Pan & Zoom State
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 2.5;

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const didDragRef = useRef(false);
  const touchStartDistanceRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1.0);

  // Helper to clamp pan offsets so map cannot be dragged completely out of sight
  const clampPan = (offset: { x: number; y: number }, scale: number) => {
    const canvas = canvasRef.current;
    const w = canvas?.width || window.innerWidth;
    const h = canvas?.height || window.innerHeight;

    const maxPanX = Math.max(w * 0.3, (w * Math.max(0.2, scale - 0.5)) / 2);
    const maxPanY = Math.max(h * 0.3, (h * Math.max(0.2, scale - 0.5)) / 2);

    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, offset.x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, offset.y)),
    };
  };

  // Mouse drag & zoom handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    didDragRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panOffset };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      didDragRef.current = true;
    }

    setPanOffset(clampPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    }, zoomScale));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoomScale(prev => {
      const nextScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, parseFloat((prev + delta).toFixed(2))));
      setPanOffset(currentPan => clampPan(currentPan, nextScale));
      return nextScale;
    });
  };

  // Touch drag & pinch zoom handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      didDragRef.current = false;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...panOffset };
      touchStartDistanceRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistanceRef.current = dist;
      touchStartZoomRef.current = zoomScale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        didDragRef.current = true;
      }

      setPanOffset(clampPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      }, zoomScale));
    } else if (e.touches.length === 2 && touchStartDistanceRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleRatio = dist / touchStartDistanceRef.current;
      const nextScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, parseFloat((touchStartZoomRef.current * scaleRatio).toFixed(2))));
      setZoomScale(nextScale);
      setPanOffset(currentPan => clampPan(currentPan, nextScale));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistanceRef.current = null;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (didDragRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const clickX = (screenX - centerX - panOffset.x) / zoomScale + centerX;
    const clickY = (screenY - centerY - panOffset.y) / zoomScale + centerY;

    const entities = engine.getEntities();
    const clicked = getSelectedUnitAtCoordinates(clickX, clickY, entities);

    setSelectedUnit(clicked);
  };

  useGameEvent('tick', () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Fill entire screen viewport with dark void background outside the map board
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    const zoneConfig = engine.getZoneConfig();

    const playerSpawnWidth = width * zoneConfig.playerSpawnRatio; 
    const playerAreaWidth = width * zoneConfig.playerAreaRatio;   
    const neutralAreaWidth = width * zoneConfig.neutralAreaRatio; 

    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    ctx.translate(centerX + panOffset.x, centerY + panOffset.y);
    ctx.scale(zoomScale, zoomScale);
    ctx.translate(-centerX, -centerY);

    // Base map board void background
    ctx.fillStyle = '#070a12';
    ctx.fillRect(0, 0, width, height);

    // Section 1: Player Area Tint
    ctx.fillStyle = 'rgba(30, 58, 138, 0.28)';
    ctx.fillRect(0, 0, playerAreaWidth, height);

    // Player Spawn Sub-Zone Highlight
    ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
    ctx.fillRect(0, 0, playerSpawnWidth, height);

    // Section 2: Neutral Area Tint
    ctx.fillStyle = 'rgba(120, 53, 15, 0.20)';
    ctx.fillRect(playerAreaWidth, 0, neutralAreaWidth - playerAreaWidth, height);

    // Section 3: Horde Spawn Area Tint
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

    // Out of Bounds Margins
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

    // Dividers
    ctx.setLineDash([8, 6]);

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.40)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(playerSpawnWidth, 0);
    ctx.lineTo(playerSpawnWidth, height);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.80)'; 
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(playerAreaWidth, 0);
    ctx.lineTo(playerAreaWidth, height);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.80)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(neutralAreaWidth, 0);
    ctx.lineTo(neutralAreaWidth, height);
    ctx.stroke();

    ctx.setLineDash([]);

    {
      const gridMarginY = getDeployMarginY(height);
      const gridW = DEPLOY_GRID_COLS * DEPLOY_CELL_PX;
      const gridH = DEPLOY_GRID_ROWS * DEPLOY_CELL_PX;

      ctx.fillStyle = 'rgba(16, 185, 129, 0.04)';
      ctx.fillRect(DEPLOY_MARGIN_X, gridMarginY, gridW, gridH);

      for (let row = 0; row < DEPLOY_GRID_ROWS; row++) {
        for (let col = 0; col < DEPLOY_GRID_COLS; col++) {
          const cx = DEPLOY_MARGIN_X + col * DEPLOY_CELL_PX;
          const cy = gridMarginY + row * DEPLOY_CELL_PX;
          const isChoke = row === 3 || row === 4;
          if (isChoke) {
            ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';
            ctx.fillRect(cx + 1, cy + 1, DEPLOY_CELL_PX - 2, DEPLOY_CELL_PX - 2);
          }
          ctx.strokeStyle = isChoke ? 'rgba(245, 158, 11, 0.30)' : 'rgba(16, 185, 129, 0.20)';
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
          ctx.strokeRect(cx + 0.5, cy + 0.5, DEPLOY_CELL_PX - 1, DEPLOY_CELL_PX - 1);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
          ctx.font = '8px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`${col},${row}`, cx + 4, cy + 11);
        }
      }

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.50)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(DEPLOY_MARGIN_X, gridMarginY, gridW, gridH);
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(16, 185, 129, 0.60)';
      ctx.fillText('DEPLOY ZONE', DEPLOY_MARGIN_X, gridMarginY - 5);
    }
    ctx.textAlign = 'center';

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

    engine.getDefenders().forEach(d => {
      const isHero = d.name.toLowerCase().includes('aric') || d.color === '#f59e0b';
      const radius = isHero ? 14 : 10;
      const isSelected = selectedUnit?.unit.id === d.id;

      if (isSelected || d.isAttacking) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, radius + (isSelected ? 6 : 4), 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.4)' : 'rgba(245, 158, 11, 0.3)';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#38bdf8' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = d.color || '#22c55e';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isHero ? '#fef08a' : '#f59e0b';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(d.x + radius, d.y);
      ctx.lineTo(d.x + radius + 4, d.y);
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();

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

      ctx.fillStyle = isHero ? '#fef08a' : '#f8fafc';
      ctx.font = isHero ? 'bold 11px sans-serif' : 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.name, d.x, d.y + radius + 12);
    });

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

      ctx.beginPath();
      ctx.moveTo(h.x - radius, h.y);
      ctx.lineTo(h.x - radius - 4, h.y);
      ctx.strokeStyle = '#fca5a5';
      ctx.stroke();

      const barWidth = 24;
      const barHeight = 3;
      const barX = h.x - barWidth / 2;
      const barY = h.y - radius - 7;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      const hpRatio = Math.max(0, Math.min(1, h.hp / (h.maxHp || h.hp)));
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

      ctx.fillStyle = '#fca5a5';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(h.name, h.x, h.y + radius + 11);
    });

    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    engine.getDamageTexts().forEach(dt => {
      ctx.fillStyle = dt.color;
      ctx.globalAlpha = dt.opacity;
      ctx.fillText(dt.text, dt.x, dt.y);
      ctx.globalAlpha = 1.0;
    });

    // Map Board Outer Boundary Glow & Border
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, width, height);

    ctx.restore();
  });

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
    <div className="relative w-full h-full">
      {/* Pan & Zoom Controls HUD + Zone Legend Box */}
      <div className="absolute top-20 left-6 z-20 flex items-start gap-3 font-sans">
        {/* Zoom Bar */}
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400 shadow-md">
          <span className="flex items-center gap-1 text-slate-300 font-semibold mr-2">
            <Move className="w-3.5 h-3.5 text-cyan-400" /> Scroll / Drag Map
          </span>
          <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoomScale(prev => Math.max(MIN_ZOOM, parseFloat((prev - 0.15).toFixed(2))));
              }}
              disabled={zoomScale <= MIN_ZOOM}
              className="p-1 hover:bg-slate-800 text-slate-300 disabled:opacity-30 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono font-bold text-amber-400 w-10 text-center">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoomScale(prev => Math.min(MAX_ZOOM, parseFloat((prev + 0.15).toFixed(2))));
              }}
              disabled={zoomScale >= MAX_ZOOM}
              className="p-1 hover:bg-slate-800 text-slate-300 disabled:opacity-30 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
          {(panOffset.x !== 0 || panOffset.y !== 0 || zoomScale !== 1.0) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPanOffset({ x: 0, y: 0 });
                setZoomScale(1.0);
              }}
              className="ml-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded text-[11px] font-bold transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {/* Zone Intel Legend Box (Positioned to the right of zoom bar) */}
        <div className="relative group">
          <details className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg shadow-md text-xs text-slate-300">
            <summary className="px-3.5 py-1.5 cursor-pointer font-bold flex items-center gap-1.5 text-amber-400 hover:text-amber-300 list-none select-none">
              <Info className="w-4 h-4 text-cyan-400" /> Zone Legend
            </summary>
            <div className="p-3.5 border-t border-slate-800 space-y-2.5 text-xs w-72 bg-slate-950/95 rounded-b-lg">
              <div className="flex items-start gap-2.5">
                <div className="w-3.5 h-3.5 mt-0.5 rounded bg-blue-500/40 border border-blue-400 shrink-0" />
                <div>
                  <span className="font-bold text-blue-400 text-xs">Player Area (0–35%)</span>
                  <p className="text-xs text-slate-300 leading-normal mt-0.5">Defensive deployment & hero movement zone.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-3.5 h-3.5 mt-0.5 rounded bg-amber-500/40 border border-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-amber-400 text-xs">No-Man's Land (35–75%)</span>
                  <p className="text-xs text-slate-300 leading-normal mt-0.5">Neutral skirmish & engagement zone.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-3.5 h-3.5 mt-0.5 rounded bg-red-500/40 border border-red-400 shrink-0" />
                <div>
                  <span className="font-bold text-red-400 text-xs">Horde Spawn (75–100%)</span>
                  <p className="text-xs text-slate-300 leading-normal mt-0.5">Enemy attack vector & spawn origin.</p>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`absolute inset-0 z-0 block w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      />
    </div>
  );
};

