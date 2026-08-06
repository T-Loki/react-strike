import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { GameState } from '../../types/game';
import type { Unit } from '../../types/combat';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useGameEvent } from '../../hooks/useGameEvent';
import { useCampaign } from '../../context/CampaignContext';
import { UNIT_ROSTER } from '../../data/units';
import { EndlessDoomWave } from '../../core/engine/WaveStrategy';
import { BattleCanvasRenderer } from './BattleCanvasRenderer';
import { BattleCanvasOverlay } from './BattleCanvasOverlay';
import { ErrorBoundary } from '../../components/ErrorBoundary';

interface BattleCanvasProps {
  onBackToMap?: () => void;
  onNavigate?: (view: GameState) => void;
  isSandboxMode?: boolean;
  sandboxPool?: import('../../types/combat').UnitTemplate[];
  onSurrenderCity?: () => void;
  onVictoryComplete?: () => void;
}

export const BattleCanvas: React.FC<BattleCanvasProps> = ({
  onBackToMap,
  onNavigate,
  isSandboxMode = false,
  sandboxPool = [],
  onSurrenderCity,
  onVictoryComplete,
}) => {
  const engine = useGameEngine();
  const { territories } = useCampaign();

  const activeTerritory = territories.find(t => t.hasActiveBattle) || territories[0];

  const [isPaused, setIsPaused] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<{ unit: Unit; stateName: string } | null>(null);
  const [enemyMenuOpen, setEnemyMenuOpen] = useState(false);
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

    const placedDefenders = activeTerritory?.allocatedDefenders.filter(
      t => t.gridPosition !== undefined
    ) ?? [];

    if (placedDefenders.length > 0) {
      engine.loadFormation(placedDefenders);
    } else if (isSandboxMode && sandboxPool.length > 0) {
      const withPositions = sandboxPool.map((t, i) => ({
        ...t,
        gridPosition: t.gridPosition ?? {
          x: i % 5,
          y: Math.floor(i / 5),
        },
      }));
      engine.loadFormation(withPositions);
    } else if (activeTerritory && activeTerritory.allocatedDefenders.length > 0) {
      engine.loadFormation(activeTerritory.allocatedDefenders);
    } else {
      engine.loadFormation(UNIT_ROSTER);
    }

    engine.spawnHordeWave(new EndlessDoomWave(), 18);
    setSelectedUnit(null);
  }, [activeTerritory, engine, isSandboxMode, sandboxPool]);

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      initBattlefield();
    }
  }, []);

  const togglePause = () => {
    engine.togglePause();
  };

  const ENEMY_CATALOGUE = [
    { label: 'Goblin Skirmisher', icon: '🏹', color: '#86efac', stats: { name: 'Goblin Skirmisher', hp: 35, maxHp: 35, damage: 6,  speed: 110, armor: 0 } },
    { label: 'Orc Grunt',         icon: '⚔️',  color: '#f87171', stats: { name: 'Orc Grunt',         hp: 65, maxHp: 65, damage: 9,  speed: 70,  armor: 1 } },
    { label: 'Orc Warrior',       icon: '🛡️',  color: '#fb923c', stats: { name: 'Orc Warrior',       hp: 120, maxHp: 120, damage: 14, speed: 60,  armor: 3 } },
    { label: 'Shadow Warg',       icon: '🐺',  color: '#c084fc', stats: { name: 'Shadow Warg',       hp: 80,  maxHp: 80,  damage: 18, speed: 130, armor: 1 } },
    { label: 'Horde Berserker',   icon: '💢',  color: '#f43f5e', stats: { name: 'Horde Berserker',   hp: 90,  maxHp: 90,  damage: 22, speed: 95,  armor: 2 } },
    { label: 'Horde Behemoth',    icon: '💀',  color: '#7f1d1d', stats: { name: 'Horde Behemoth',    hp: 300, maxHp: 300, damage: 30, speed: 40,  armor: 5 } },
  ] as const;

  const spawnEnemies = (stats: Partial<Unit>, count: number) => {
    const { width, height } = engine.getCanvasSize();
    const marginY = 80;
    const availableH = Math.max(100, height - marginY * 2);
    for (let i = 0; i < count; i++) {
      const spawnX = width - 150 + Math.random() * 200;
      const spawnY = marginY + Math.random() * availableH;
      engine.spawnHorde(spawnX, spawnY, { ...stats });
    }
  };

  const frameCountRef = useRef(0);
  const lastFpsCheckRef = useRef(performance.now());

  useGameEvent('tick', () => {
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
  });

  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans select-none">
        <BattleCanvasRenderer 
          selectedUnit={selectedUnit} 
          setSelectedUnit={setSelectedUnit} 
        />
        
        <BattleCanvasOverlay
          hudStats={hudStats}
          selectedUnit={selectedUnit}
          setSelectedUnit={setSelectedUnit}
          isPaused={isPaused}
          togglePause={togglePause}
          gameSpeed={engine.getGameSpeed()}
          setGameSpeed={(s) => engine.setGameSpeed(s)}
          onSurrenderBattle={() => engine.surrenderBattle()}
          enemyMenuOpen={enemyMenuOpen}
          setEnemyMenuOpen={setEnemyMenuOpen}
          ENEMY_CATALOGUE={ENEMY_CATALOGUE}
          spawnEnemies={spawnEnemies}
          initBattlefield={initBattlefield}
          onBackToMap={onBackToMap}
          onNavigate={onNavigate}
          isSandboxMode={isSandboxMode}
          onSurrenderCity={onSurrenderCity}
          onVictoryComplete={onVictoryComplete}
        />
      </div>
    </ErrorBoundary>
  );
};
