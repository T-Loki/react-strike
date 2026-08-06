import React, { useState, useRef } from 'react';
import { Sparkles, X, ArrowLeft, Move, ZoomIn, ZoomOut } from 'lucide-react';
import {
  DEPLOY_GRID_COLS,
  DEPLOY_GRID_ROWS,
  DEPLOY_CELL_PX,
} from '../../core/factories/UnitFactory';

import type { UnitTemplate } from '../../types/combat';

interface Props {
  assignedUnits: UnitTemplate[];
  isAnySelected: boolean;
  handleCellClick: (x: number, y: number) => void;
}

const GRID_COLS = DEPLOY_GRID_COLS;
const GRID_ROWS = DEPLOY_GRID_ROWS;
const CELL_SIZE = DEPLOY_CELL_PX;

export const FormationGrid: React.FC<Props> = ({ assignedUnits, isAnySelected, handleCellClick }) => {
  // Pan & Zoom State
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const MIN_ZOOM = 0.6;
  const MAX_ZOOM = 1.8;

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const didDragRef = useRef(false);

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

    setPanOffset({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoomScale(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, parseFloat((prev + delta).toFixed(2)))));
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale(prev => Math.min(MAX_ZOOM, parseFloat((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale(prev => Math.max(MIN_ZOOM, parseFloat((prev - 0.15).toFixed(2))));
  };

  const handleResetView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPanOffset({ x: 0, y: 0 });
    setZoomScale(1.0);
  };

  const onCellClickWrapper = (x: number, y: number) => {
    if (!didDragRef.current) {
      handleCellClick(x, y);
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className={`flex-1 relative flex flex-col items-center justify-center bg-slate-950 overflow-hidden select-none p-6 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Pan & Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/85 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400 font-sans shadow-md">
        <span className="flex items-center gap-1 text-slate-300 font-semibold mr-2">
          <Move className="w-3.5 h-3.5 text-cyan-400" /> Scroll / Drag Grid
        </span>
        <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
          <button
            onClick={handleZoomOut}
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
            onClick={handleZoomIn}
            disabled={zoomScale >= MAX_ZOOM}
            className="p-1 hover:bg-slate-800 text-slate-300 disabled:opacity-30 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
        {(panOffset.x !== 0 || panOffset.y !== 0 || zoomScale !== 1.0) && (
          <button
            onClick={handleResetView}
            className="ml-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded text-[11px] font-bold transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Draggable & Scalable Grid Container */}
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
        className="flex flex-col items-center justify-center"
      >
        <div className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 mb-3 font-bold flex justify-between w-full" style={{ maxWidth: GRID_COLS * CELL_SIZE + 120 }}>
          <span>← Player Defence Zone ({GRID_COLS}×{GRID_ROWS})</span>
          <span className="text-amber-400">★ Gold = Choke Point (+20% Def)</span>
        </div>

        <div className="flex items-center gap-4">
          <div 
            className="grid bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-2xl"
            style={{
              gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL_SIZE}px)`,
              gap: '6px',
            }}
          >
            {Array.from({ length: GRID_ROWS }).map((_, y) => 
              Array.from({ length: GRID_COLS }).map((_, x) => {
                const isChokePoint = y === 3 || y === 4;
                const occupant = assignedUnits.find(u => u.gridPosition?.x === x && u.gridPosition?.y === y);

                return (
                  <button
                    key={`${x}-${y}`}
                    onClick={() => onCellClickWrapper(x, y)}
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center relative transition-all shrink-0 group ${
                      occupant 
                        ? 'bg-slate-800 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                        : isChokePoint
                          ? 'border-amber-400/60 bg-amber-950/20 hover:bg-amber-900/30'
                          : 'border-slate-800 bg-slate-900/80 hover:border-slate-600'
                    } ${isAnySelected && !occupant ? 'hover:border-cyan-400 hover:bg-cyan-950/30 animate-pulse' : ''}`}
                  >
                    {isChokePoint && !occupant && (
                      <Sparkles className="w-3 h-3 text-amber-400/40 absolute top-1 right-1" />
                    )}

                    {occupant ? (
                      <div className="flex flex-col items-center justify-between p-1 text-center w-full h-full relative z-0">
                        <div className="w-full h-1.5 bg-slate-950 border border-slate-700 rounded-full overflow-hidden shrink-0 mt-0.5">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${Math.max(0, Math.min(100, (occupant.hp / (occupant.maxHp || occupant.hp)) * 100))}%` }}
                          />
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 shrink-0 shadow-md flex items-center justify-center ${
                          occupant.type === 'hero' 
                            ? 'bg-amber-500 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                            : occupant.type === 'elite'
                            ? 'bg-purple-600 border-purple-300 shadow-[0_0_8px_rgba(147,51,234,0.5)]'
                            : 'bg-blue-600 border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                        }`} />
                        <span className="text-[8px] font-bold text-slate-200 truncate max-w-full leading-tight text-center mb-0.5">
                          {occupant.name}
                        </span>
                        <div className="absolute inset-0 bg-red-900/80 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity z-10">
                          <X className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-[8px] text-slate-700 font-mono">
                        {x},{y}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="flex flex-col items-center justify-center bg-red-950/40 border border-red-800/80 p-3 rounded-xl text-red-400 shrink-0 shadow-lg select-none">
            <div className="flex items-center gap-1 animate-pulse">
              <ArrowLeft className="w-6 h-6 text-red-500 stroke-[3]" />
              <span className="text-xs font-black tracking-widest text-red-400 hidden sm:inline">
                ATTACK
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-300/80 mt-1 text-center leading-tight">
              Enemy Wave<br />Direction
            </span>
          </div>
        </div>

        <p className="text-[10px] text-slate-600 mt-4 text-center">
          Each grid cell = {CELL_SIZE}px in battle · Formation shape is preserved exactly on launch
        </p>
      </div>
    </div>
  );
};
