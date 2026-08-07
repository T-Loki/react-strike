import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { GameState } from '../../types/game';
import type { Unit, WaveContext, WaveInfo } from '../../types/combat';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useGameEvent } from '../../hooks/useGameEvent';
import { useCampaign } from '../../context/CampaignContext';
import { FACTIONS } from '../../data/units';
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
  const [hudStats, setHudStats] = useState<{
    fps: number;
    defendersCount: number;
    hordeCount: number;
    phase: string;
    waveInfo?: WaveInfo;
  }>({
    fps: 60,
    defendersCount: 0,
    hordeCount: 0,
    phase: 'HOLDING_POSITION',
  });

  useGameEvent('pause', () => setIsPaused(true));
  useGameEvent('resume', () => setIsPaused(false));

  const initBattlefield = useCallback(() => {
    engine.clearBoard();

    if (isSandboxMode) {
      const deployedSandbox = sandboxPool.filter(u => u.gridPosition !== undefined);
      const unitsToLoad = deployedSandbox.length > 0 ? deployedSandbox : sandboxPool;
      if (unitsToLoad.length > 0) {
        engine.loadFormation(unitsToLoad);
      } else {
        engine.loadFormation(FACTIONS.pantheon.roster);
      }
    } else if (activeTerritory && activeTerritory.allocatedDefenders.length > 0) {
      const assigned = activeTerritory.allocatedDefenders.filter(u => u.gridPosition !== undefined);
      const unitsToLoad = assigned.length > 0 ? assigned : activeTerritory.allocatedDefenders;
      engine.loadFormation(unitsToLoad);
    } else {
      engine.loadFormation(FACTIONS.pantheon.roster);
    }

    const context: WaveContext = {
      isSandbox: isSandboxMode,
      territoryId: isSandboxMode ? undefined : activeTerritory?.id,
      waveIndex: 0,
    };
    engine.spawnHordeWave(undefined, context);
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
        waveInfo: engine.getWaveInfo(),
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
          enemyCatalog={FACTIONS.horde.catalog}
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
