import React, { useState, useRef } from 'react';
import type { Territory } from '../../types/combat';
import { Flame, Shield, Skull, Zap, Move, ZoomIn, ZoomOut } from 'lucide-react';
import { getTerritoryPosition } from '../../core/math/empireCalculations';

interface Props {
  territories: Territory[];
  selectedTerritoryId: string | null;
  onSelectTerritory: (territoryId: string) => void;
  validTerritoryIds?: string[];
}

export const RingMapView: React.FC<Props> = ({
  territories,
  selectedTerritoryId,
  onSelectTerritory,
  validTerritoryIds,
}) => {
  // Pan & Zoom State
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const MIN_ZOOM = 0.6;
  const MAX_ZOOM = 1.8;

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const didDragRef = useRef(false);
  const touchStartDistanceRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1.0);

  const center = { x: 400, y: 300 };
  const positions = territories.map(t => ({
    territory: t,
    pos: getTerritoryPosition(t, territories),
  }));

  // Pan Handlers
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

    const maxPanX = 380;
    const maxPanY = 280;

    setPanOffset({
      x: Math.max(-maxPanX, Math.min(maxPanX, panStartRef.current.x + dx)),
      y: Math.max(-maxPanY, Math.min(maxPanY, panStartRef.current.y + dy)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom Wheel Handler
  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoomScale(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, parseFloat((prev + delta).toFixed(2)))));
  };

  // Touch Handlers
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
    const maxPanX = 380;
    const maxPanY = 280;

    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        didDragRef.current = true;
      }

      setPanOffset({
        x: Math.max(-maxPanX, Math.min(maxPanX, panStartRef.current.x + dx)),
        y: Math.max(-maxPanY, Math.min(maxPanY, panStartRef.current.y + dy)),
      });
    } else if (e.touches.length === 2 && touchStartDistanceRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleRatio = dist / touchStartDistanceRef.current;
      setZoomScale(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, parseFloat((touchStartZoomRef.current * scaleRatio).toFixed(2)))));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistanceRef.current = null;
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

  const handleNodeClick = (e: React.MouseEvent, territoryId: string) => {
    e.stopPropagation();
    if (!didDragRef.current) {
      onSelectTerritory(territoryId);
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-full min-h-[500px] flex items-center justify-center bg-slate-950 overflow-hidden select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Pan & Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/85 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400 font-sans shadow-md">
        <span className="flex items-center gap-1 text-slate-300 font-semibold mr-2">
          <Move className="w-3.5 h-3.5 text-cyan-400" /> Scroll / Drag Map
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

      {/* SVG Canvas View */}
      <svg className="w-full h-full max-w-[900px] max-h-[650px]" viewBox="0 0 800 600">
        <defs>
          <radialGradient id="ringBgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#0f172a" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </radialGradient>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Draggable & Scalable Map Wrapper */}
        <g
          transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomScale})`}
          style={{ transformOrigin: '400px 300px' }}
        >
          {/* Ambient Ring Grid Background */}
          <circle cx={center.x} cy={center.y} r="350" fill="url(#ringBgGrad)" />

          {/* Concentric Orbital Rings */}
          <circle cx={center.x} cy={center.y} r="275" stroke="#334155" strokeWidth="1.5" strokeDasharray="6 6" fill="none" />
          <circle cx={center.x} cy={center.y} r="195" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
          <circle cx={center.x} cy={center.y} r="110" stroke="#64748b" strokeWidth="2" fill="none" />

          {/* Outer Ring Radial Spokes */}
          {positions.map(({ territory, pos }) => {
            if (territory.ringLevel === 0) return null;
            return (
              <line
                key={`line-${territory.id}`}
                x1={center.x}
                y1={center.y}
                x2={pos.x}
                y2={pos.y}
                stroke={territory.hasActiveBattle ? "#ef4444" : territory.isScorched ? "#334155" : "#475569"}
                strokeWidth={territory.hasActiveBattle ? "2.5" : "1.5"}
                strokeDasharray={territory.isScorched ? "4 4" : "none"}
                opacity={0.6}
              />
            );
          })}

          {/* Ring Labels */}
          <text x={center.x} y={center.y - 280} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="2">
            OUTER RING III
          </text>
          <text x={center.x} y={center.y - 200} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="2">
            MIDDLE RING II
          </text>
          <text x={center.x} y={center.y - 115} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle" letterSpacing="2">
            INNER FORTRESS RING I
          </text>

          {/* Interactive Territory Nodes */}
          {positions.map(({ territory, pos }) => {
            const isSelected = territory.id === selectedTerritoryId;
            const isDanger = territory.hasActiveBattle;
            const isScorched = territory.isScorched;
            const isCitadel = territory.ringLevel === 0;
            const isValidTarget = !validTerritoryIds || validTerritoryIds.includes(territory.id);

            const nodeColor = isScorched
              ? "#334155"
              : isDanger
              ? "#ef4444"
              : isCitadel
              ? "#f59e0b"
              : "#06b6d4";

            return (
              <g
                key={territory.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={(e) => isValidTarget && handleNodeClick(e, territory.id)}
                className={isValidTarget ? "cursor-pointer group" : "opacity-25 grayscale pointer-events-none"}
              >
                {/* Scalable Node Group with perfectly centered origin transform */}
                <g className="transition-transform duration-200 ease-out group-hover:scale-110">
                  {/* Selection Glow Pulse */}
                  {isSelected && (
                    <circle
                      cx={0}
                      cy={0}
                      r={isCitadel ? 42 : 36}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="3"
                      filter="url(#glow)"
                      className="animate-pulse"
                    />
                  )}

                  {/* Danger Pulsing Ring */}
                  {isDanger && !isScorched && (
                    <circle
                      cx={0}
                      cy={0}
                      r={isCitadel ? 46 : 38}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      opacity="0.8"
                      className="animate-ping"
                    />
                  )}

                  {/* Node Base Circle */}
                  <circle
                    cx={0}
                    cy={0}
                    r={isCitadel ? 34 : 28}
                    fill={isScorched ? "#0f172a" : "#1e293b"}
                    stroke={nodeColor}
                    strokeWidth={isSelected ? "4" : "2.5"}
                  />

                  {/* Inner Node Glow */}
                  <circle
                    cx={0}
                    cy={0}
                    r={isCitadel ? 24 : 18}
                    fill={nodeColor}
                    opacity={isScorched ? 0.2 : 0.4}
                  />

                  {/* Center Icon */}
                  <foreignObject
                    x={-14}
                    y={-14}
                    width="28"
                    height="28"
                    className="pointer-events-none"
                  >
                    <div className="w-full h-full flex items-center justify-center text-white">
                      {isScorched ? (
                        <Skull className="w-5 h-5 text-slate-500" />
                      ) : isDanger ? (
                        <Flame className="w-6 h-6 text-red-400 animate-bounce" />
                      ) : isCitadel ? (
                        <Zap className="w-6 h-6 text-amber-300" />
                      ) : (
                        <Shield className="w-5 h-5 text-cyan-300" />
                      )}
                    </div>
                  </foreignObject>

                  {/* Defender Count Badge */}
                  {!isScorched && (
                    <g transform="translate(16, -20)">
                      <rect
                        x="0"
                        y="0"
                        width="24"
                        height="18"
                        rx="9"
                        fill="#0f172a"
                        stroke="#fbbf24"
                        strokeWidth="1.5"
                      />
                      <text
                        x="12"
                        y="13"
                        fill="#fbbf24"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {territory.allocatedDefenders.length}
                      </text>
                    </g>
                  )}

                  {/* Territory Name Tag */}
                  <text
                    x={0}
                    y={isCitadel ? 48 : 42}
                    fill={isSelected ? "#fbbf24" : isScorched ? "#64748b" : "#f8fafc"}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="drop-shadow-md font-serif"
                  >
                    {territory.name}
                  </text>

                  {/* Status Subtitle */}
                  <text
                    x={0}
                    y={isCitadel ? 60 : 54}
                    fill={isDanger ? "#f87171" : isScorched ? "#475569" : "#94a3b8"}
                    fontSize="9"
                    fontWeight="semibold"
                    textAnchor="middle"
                  >
                    {isScorched
                      ? "[SCORCHED]"
                      : isDanger
                      ? "! BATTLE FRONT !"
                      : `Yield: +${territory.resourceYield}g | +${territory.faithYield ?? 10}f`}
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
