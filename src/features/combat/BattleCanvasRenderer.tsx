import React, { useEffect, useRef } from 'react';
import type { Unit } from '../../types/combat';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useGameEvent } from '../../hooks/useGameEvent';
import { getDistance } from '../../core/math/utils';
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

  useGameEvent('tick', () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const zoneConfig = engine.getZoneConfig();

    const playerSpawnWidth = width * zoneConfig.playerSpawnRatio; 
    const playerAreaWidth = width * zoneConfig.playerAreaRatio;   
    const neutralAreaWidth = width * zoneConfig.neutralAreaRatio; 

    // Base background void
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

    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';

    const pSpawnPct = Math.round(zoneConfig.playerSpawnRatio * 100);
    const pAreaPct = Math.round(zoneConfig.playerAreaRatio * 100);
    const neutralPct = Math.round(zoneConfig.neutralAreaRatio * 100);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`🛡️ PLAYER AREA (0-${pAreaPct}%)`, playerAreaWidth * 0.5, 110);
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.fillText(`Spawn (0-${pSpawnPct}%) | Movement & Defense Zone (${pSpawnPct}-${pAreaPct}%)`, playerAreaWidth * 0.5, 124);

    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`⚔️ NEUTRAL NO-MAN'S LAND (${pAreaPct}-${neutralPct}%)`, playerAreaWidth + (neutralAreaWidth - playerAreaWidth) * 0.5, 110);

    ctx.fillStyle = '#f87171';
    ctx.fillText(`💀 HORDE SPAWN ZONE (${neutralPct}-100%)`, neutralAreaWidth + (width - neutralAreaWidth) * 0.5, 110);

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
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="absolute inset-0 z-0 block w-full h-full cursor-crosshair"
    />
  );
};
