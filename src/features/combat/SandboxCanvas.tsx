import React from 'react';
import type { GameState } from '../../types/game';
import { BattleCanvas } from './BattleCanvas';

interface SandboxCanvasProps {
  onNavigate: (view: GameState) => void;
  isSandboxLoop?: boolean;
  onBackToPlanning?: () => void;
}

export const SandboxCanvas: React.FC<SandboxCanvasProps> = ({ 
  onNavigate, 
  onBackToPlanning 
}) => {
  return (
    <BattleCanvas 
      onBackToMap={onBackToPlanning}
      onNavigate={onNavigate}
    />
  );
};
