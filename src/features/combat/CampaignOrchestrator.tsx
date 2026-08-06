import React, { useState } from 'react';
import type { GameState, RunPhase } from '../../types/game';
import { EmpireManagement } from '../logistics/EmpireManagement';
import { BattleSelectMenu } from '../logistics/BattleSelectMenu';
import { PreBattleSetup } from './PreBattleSetup';
import { BattleCanvas } from './BattleCanvas';
import { useCampaign } from '../../context/CampaignContext';
import { ErrorBoundary } from '../../components/ErrorBoundary';

interface Props {
  onNavigate: (view: GameState) => void;
}

interface PhaseContext {
  setPhase: (phase: RunPhase) => void;
  onNavigate: (view: GameState) => void;
  remainingBattles: number;
}

interface PhaseState {
  id: RunPhase;
  render(context: PhaseContext): React.ReactNode;
}

class EmpireManagementState implements PhaseState {
  id: RunPhase = 'empire_management';
  render(context: PhaseContext) {
    return <EmpireManagement onEndPhase={() => context.setPhase('battle_select')} />;
  }
}

class BattleSelectState implements PhaseState {
  id: RunPhase = 'battle_select';
  render(context: PhaseContext) {
    return <BattleSelectMenu onNext={() => context.setPhase('pre_battle')} />;
  }
}

class PreBattleState implements PhaseState {
  id: RunPhase = 'pre_battle';
  render(context: PhaseContext) {
    return (
      <PreBattleSetup 
        onStartBattle={() => context.setPhase('combat')} 
        onBackToMap={() => context.setPhase('battle_select')}
        onNavigate={context.onNavigate}
      />
    );
  }
}

class CombatState implements PhaseState {
  id: RunPhase = 'combat';
  render(context: PhaseContext) {
    const handleCombatEnd = () => {
      if (context.remainingBattles > 0) {
        context.setPhase('battle_select');
      } else {
        context.setPhase('empire_management');
      }
    };
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative">
         <BattleCanvas onBackToMap={handleCombatEnd} onNavigate={context.onNavigate} />
      </div>
    );
  }
}

class GameOverState implements PhaseState {
  id: RunPhase = 'game_over';
  render() {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500 font-bold text-4xl">
        Game Over
      </div>
    );
  }
}

const PHASE_STATES: Record<RunPhase, PhaseState> = {
  empire_management: new EmpireManagementState(),
  battle_select: new BattleSelectState(),
  pre_battle: new PreBattleState(),
  combat: new CombatState(),
  game_over: new GameOverState(),
};

export const CampaignOrchestrator: React.FC<Props> = ({ onNavigate }) => {
  const [phase, setPhase] = useState<RunPhase>('empire_management');
  const { remainingBattles } = useCampaign();

  const context: PhaseContext = {
    setPhase,
    onNavigate,
    remainingBattles
  };

  const currentState = PHASE_STATES[phase];

  return (
    <ErrorBoundary>
      <div className={`relative w-full ${phase === 'combat' ? 'h-screen overflow-hidden' : 'min-h-screen overflow-y-auto'} bg-black font-sans text-white flex flex-col`}>
         <div className="absolute bottom-4 left-4 z-50">
            <button onClick={() => onNavigate('menu')} className="theme-btn px-4 py-2 text-sm bg-slate-800 rounded shadow-md">
              Return to Menu
            </button>
         </div>
         
         <div className="absolute top-4 left-4 z-50 text-xs opacity-50 uppercase tracking-widest text-amber-500 pointer-events-none">
           Current Phase: {phase}
         </div>
         
         <div className="flex-1 w-full min-h-0">
            {currentState.render(context)}
         </div>
      </div>
    </ErrorBoundary>
  );
};
