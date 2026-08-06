import React, { useState } from 'react';
import type { GameState } from '../../types/game';
import { PreBattleSetup } from './PreBattleSetup';
import { SandboxCanvas } from './SandboxCanvas';

interface SandboxOrchestratorProps {
  onNavigate: (view: GameState) => void;
}

export const SandboxOrchestrator: React.FC<SandboxOrchestratorProps> = ({ onNavigate }) => {
  const [sandboxPhase, setSandboxPhase] = useState<'planning' | 'combat'>('planning');

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {sandboxPhase === 'planning' && (
        <PreBattleSetup 
          isSandboxMode={true}
          onStartBattle={() => setSandboxPhase('combat')}
          onBackToMap={() => onNavigate('mode_select')}
          onNavigate={onNavigate}
        />
      )}
      {sandboxPhase === 'combat' && (
        <SandboxCanvas 
          isSandboxLoop={true}
          onBackToPlanning={() => setSandboxPhase('planning')}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
