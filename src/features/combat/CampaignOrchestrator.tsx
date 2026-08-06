import React, { useState } from 'react';
import type { GameState, RunPhase } from '../../types/game';
import { EmpireManagement } from '../logistics/EmpireManagement';
import { BattleSelectMenu } from '../logistics/BattleSelectMenu';
import { PreBattleSetup } from './PreBattleSetup';
import { BattleCanvas } from './BattleCanvas';
import { CampaignProvider, useCampaign } from '../../context/CampaignContext';

interface Props {
  onNavigate: (view: GameState) => void;
}

const CampaignRouter: React.FC<Props> = ({ onNavigate }) => {
  const [phase, setPhase] = useState<RunPhase>('empire_management');
  const { remainingBattles } = useCampaign();

  const handleCombatEnd = () => {
    if (remainingBattles > 0) {
      setPhase('battle_select');
    } else {
      setPhase('empire_management');
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black font-sans text-white flex flex-col">
       <div className="absolute top-4 right-4 z-50">
          <button onClick={() => onNavigate('menu')} className="theme-btn px-4 py-2 text-sm bg-slate-800 rounded">
            Return to Menu
          </button>
       </div>
       
       <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-4 text-xs opacity-50 uppercase tracking-widest text-amber-500">Current Phase: {phase}</div>
          
          {phase === 'empire_management' && (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <EmpireManagement />
              <button onClick={() => setPhase('battle_select')} className="mt-4 px-6 py-2 bg-blue-600 rounded font-bold uppercase tracking-widest">
                Proceed to Battle Select
              </button>
            </div>
          )}
          {phase === 'battle_select' && (
             <div className="w-full h-full flex flex-col items-center justify-center">
               <BattleSelectMenu />
               <button onClick={() => setPhase('pre_battle')} className="mt-4 px-6 py-2 bg-red-600 rounded font-bold uppercase tracking-widest">
                 Lock in Battle
               </button>
             </div>
          )}
          {phase === 'pre_battle' && (
             <div className="w-full h-full flex flex-col items-center justify-center">
               <PreBattleSetup />
               <button onClick={() => setPhase('combat')} className="mt-4 px-6 py-2 bg-purple-600 rounded font-bold uppercase tracking-widest">
                 Start Wave
               </button>
             </div>
          )}
          {phase === 'combat' && (
             <div className="w-full h-full flex flex-col items-center justify-center relative">
               <BattleCanvas />
               <button onClick={handleCombatEnd} className="mt-8 px-8 py-3 bg-red-700 hover:bg-red-600 rounded font-bold uppercase tracking-widest">
                 Return to Map (End Combat)
               </button>
             </div>
          )}
       </div>
    </div>
  );
};

export const CampaignOrchestrator: React.FC<Props> = (props) => {
  return (
    <CampaignProvider>
      <CampaignRouter {...props} />
    </CampaignProvider>
  );
};
