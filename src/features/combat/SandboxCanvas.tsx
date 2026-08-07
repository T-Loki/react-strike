import React from 'react';
import type { GameState } from '../../types/game';
import { BattleCanvas } from './BattleCanvas';
import { useCampaign } from '../../context/CampaignContext';
import { ErrorBoundary } from '../../components/ErrorBoundary';

interface SandboxCanvasProps {
  onNavigate: (view: GameState) => void;
  isSandboxLoop?: boolean;
  onBackToPlanning?: () => void;
}

export const SandboxCanvas: React.FC<SandboxCanvasProps> = ({ 
  onNavigate, 
  onBackToPlanning 
}) => {
  const { sandboxDefenders } = useCampaign();

  return (
    <ErrorBoundary>
      <div className="relative w-full h-screen overflow-hidden bg-black text-white font-sans select-none">
        <BattleCanvas 
          onBackToMap={onBackToPlanning}
          onNavigate={onNavigate}
          isSandboxMode={true}
          sandboxPool={sandboxDefenders}
        />
      </div>
    </ErrorBoundary>
  );
};
