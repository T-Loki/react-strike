import React, { useEffect, useRef, useState } from 'react';
import type { GameState } from '../../types/game';
import { ArrowLeft, Play, Pause, Trash2, Users, Skull } from 'lucide-react';

interface SandboxCanvasProps {
  onNavigate: (view: GameState) => void;
}

export const SandboxCanvas: React.FC<SandboxCanvasProps> = ({ onNavigate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({ fps: 0, defenders: 0, horde: 0 });
  
  // Game state refs (no useState for 60fps)
  const engineState = useRef({
    defenders: [] as { x: number; y: number; id: number }[],
    horde: [] as { x: number; y: number; id: number }[],
    lastTime: performance.now(),
    frames: 0,
    lastFpsUpdate: performance.now()
  });

  // Controls
  const spawnDefenders = () => {
    for (let i = 0; i < 10; i++) {
      engineState.current.defenders.push({
        id: Math.random(),
        x: 100 + Math.random() * 200,
        y: 100 + Math.random() * (window.innerHeight - 200)
      });
    }
  };

  const spawnHorde = () => {
    for (let i = 0; i < 20; i++) {
      engineState.current.horde.push({
        id: Math.random(),
        x: window.innerWidth - 300 + Math.random() * 200,
        y: 100 + Math.random() * (window.innerHeight - 200)
      });
    }
  };

  const clearBoard = () => {
    engineState.current.defenders = [];
    engineState.current.horde = [];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;

    const render = (time: number) => {
      const state = engineState.current;
      const deltaTime = time - state.lastTime;
      state.lastTime = time;
      
      // FPS Calculation
      state.frames++;
      if (time - state.lastFpsUpdate >= 1000) {
        setStats({
          fps: state.frames,
          defenders: state.defenders.length,
          horde: state.horde.length
        });
        state.frames = 0;
        state.lastFpsUpdate = time;
      }

      if (!isPaused) {
        // Move units (mock logic: horde moves left, defenders stand)
        state.horde.forEach(h => { h.x -= deltaTime * 0.05; });
      }

      // Draw
      const computedStyles = getComputedStyle(document.documentElement);
      ctx.fillStyle = computedStyles.getPropertyValue('--bg-color') || '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
      for (let j = 0; j < canvas.height; j += 50) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke(); }
      
      // Draw Defenders (Green)
      ctx.fillStyle = '#22c55e'; // green-500
      state.defenders.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, 8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Horde (Red)
      ctx.fillStyle = '#ef4444'; // red-500
      state.horde.forEach(h => {
        ctx.beginPath();
        ctx.arc(h.x, h.y, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();
    animationFrameId = requestAnimationFrame(render);
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 block w-full h-full" />
      
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        {/* Top Bar */}
        <div className="flex justify-between items-start pointer-events-auto">
          <button onClick={() => onNavigate('mode_select')} className="theme-btn p-3 rounded-full flex items-center justify-center group bg-[var(--panel-bg)]">
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="bg-[var(--panel-bg)]/80 backdrop-blur-md border border-[var(--border-color)] p-4 rounded-xl flex gap-6 text-sm font-mono shadow-2xl">
            <div><span className="opacity-50">FPS:</span> <span className="text-[var(--accent-color)] font-bold">{stats.fps}</span></div>
            <div><span className="opacity-50">Defenders:</span> <span className="text-green-400 font-bold">{stats.defenders}</span></div>
            <div><span className="opacity-50">Horde:</span> <span className="text-red-400 font-bold">{stats.horde}</span></div>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="pointer-events-auto flex justify-center pb-6">
          <div className="bg-[var(--panel-bg)]/90 backdrop-blur-md border border-[var(--border-color)] p-4 rounded-2xl flex gap-4 shadow-2xl">
            <button onClick={spawnDefenders} className="px-6 py-3 rounded-lg border border-green-500/30 hover:bg-green-500/20 text-green-400 font-bold flex gap-2 items-center transition-colors">
              <Users className="w-5 h-5" /> +10 Defenders
            </button>
            <button onClick={spawnHorde} className="px-6 py-3 rounded-lg border border-red-500/30 hover:bg-red-500/20 text-red-400 font-bold flex gap-2 items-center transition-colors">
              <Skull className="w-5 h-5" /> +20 Horde
            </button>
            <div className="w-px h-12 bg-gray-700 mx-2"></div>
            <button onClick={clearBoard} className="px-4 py-3 rounded-lg border border-gray-500/30 hover:bg-gray-500/20 text-gray-300 font-bold flex gap-2 items-center transition-colors">
              <Trash2 className="w-5 h-5" /> Clear
            </button>
            <button onClick={() => setIsPaused(!isPaused)} className="px-4 py-3 rounded-lg border border-[var(--accent-color)]/30 hover:bg-[var(--accent-color)]/20 text-[var(--accent-color)] font-bold flex gap-2 items-center transition-colors">
              {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
