import React, { useState } from 'react';
import type { GameState } from '../../types/game';
import type { StoryScript } from '../../types/vn';

interface StorySceneProps {
  onNavigate?: (state: GameState) => void;
  script?: StoryScript; // Pass a default script if none provided
}

const DEFAULT_SCRIPT: StoryScript = {
  id: 'intro',
  title: 'The Gathering Storm',
  lines: [
    { id: '1', speaker: 'General Aric', text: 'The hordes are gathering at our borders. We cannot hold them for much longer.' },
    { id: '2', speaker: 'High Priestess', text: 'Have faith, General. The Light will provide.' },
    { id: '3', speaker: 'General Aric', text: 'Faith won\'t stop their axes.' }
  ]
};

export const StoryScene: React.FC<StorySceneProps> = ({ onNavigate, script = DEFAULT_SCRIPT }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  const currentLine = script.lines[currentLineIndex];

  const handleNext = () => {
    if (currentLineIndex < script.lines.length - 1) {
      setCurrentLineIndex(i => i + 1);
    } else {
      if (onNavigate) {
        onNavigate('menu');
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative justify-end pb-12 items-center text-white" onClick={handleNext}>
      {/* Background placeholder */}
      <div className="absolute inset-0 bg-slate-900 -z-10" />

      {/* Portrait placeholder */}
      <div className="w-48 h-48 bg-slate-700 rounded-lg mb-4 flex items-center justify-center text-slate-400">
        Portrait: {currentLine?.speaker}
      </div>

      {/* Dialogue box */}
      <div className="w-3/4 max-w-4xl bg-slate-950/80 border-2 border-amber-500/50 p-6 rounded-md shadow-lg backdrop-blur-sm cursor-pointer">
        <h3 className="text-xl font-bold text-amber-500 mb-2">{currentLine?.speaker}</h3>
        <p className="text-lg leading-relaxed">{currentLine?.text}</p>
        <p className="text-sm text-slate-500 mt-4 text-right">Click anywhere to continue...</p>
      </div>
    </div>
  );
};
