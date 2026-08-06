import React, { useState } from 'react';
import type { GameState, RunPhase } from '../../types/game';
import { EmpireManagement } from '../logistics/EmpireManagement';
import { BattleSelectMenu } from '../logistics/BattleSelectMenu';
import { PreBattleSetup } from './PreBattleSetup';
import { BattleCanvas } from './BattleCanvas';
import { useCampaign } from '../../context/CampaignContext';

interface Props {
  onNavigate: (view: GameState) => void;
}

export const CampaignOrchestrator: React.FC<Props> = ({ onNavigate }) => {
  const [phase, setPhase] = useState<RunPhase>('empire_management');
  const { remainingBattles } = useCampaign();

  const handleCombatEnd = () => {
    if (remainingBattles > 0) {
      setPhase('battle_select');
    } else {
      setPhase('empire_management');
    }
  };

  const phaseRenderer: Record<RunPhase, React.ReactNode> = {
    'empire_management': <EmpireManagement onEndPhase={() => setPhase('battle_select')} />,
    'battle_select': <BattleSelectMenu onNext={() => setPhase('pre_battle')} />,
    'pre_battle': (
      <PreBattleSetup 
        onStartBattle={() => setPhase('combat')} 
        onBackToMap={() => setPhase('battle_select')}
        onNavigate={onNavigate}
      />
    ),
    'combat': (
      <div className="w-full h-full flex flex-col items-center justify-center relative">
         <BattleCanvas onBackToMap={handleCombatEnd} onNavigate={onNavigate} />
      </div>
    ),
    'game_over': (
      <div className="w-full h-full flex items-center justify-center text-red-500 font-bold text-4xl">
        Game Over
      </div>
    )
  };

  return (
    <div className={`relative w-full ${phase === 'combat' ? 'h-screen overflow-hidden' : 'min-h-screen overflow-y-auto'} bg-black font-sans text-white flex flex-col`}>
       <div className="absolute top-4 right-4 z-50">
          <button onClick={() => onNavigate('menu')} className="theme-btn px-4 py-2 text-sm bg-slate-800 rounded shadow-md">
            Return to Menu
          </button>
       </div>
       
       <div className="absolute top-4 left-4 z-50 text-xs opacity-50 uppercase tracking-widest text-amber-500 pointer-events-none">
         Current Phase: {phase}
       </div>
       
       <div className="flex-1 w-full min-h-0">
          {phaseRenderer[phase]}
       </div>
    </div>
  );
};
