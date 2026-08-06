import React from 'react';
import type { GameState } from '../types/game';
import { Shield, FlaskConical, ArrowLeft } from 'lucide-react';

interface ModeSelectMenuProps {
  onNavigate: (view: GameState) => void;
}

export const ModeSelectMenu: React.FC<ModeSelectMenuProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative p-6">
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
         <div className="w-[800px] h-[800px] rounded-full bg-[var(--accent-color)] blur-[150px]"></div>
      </div>

      <div className="z-10 flex flex-col w-full max-w-4xl p-10 theme-panel rounded-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-10 border-b border-[var(--border-color)] pb-6">
          <h2 className="text-3xl font-black tracking-widest uppercase text-[var(--accent-color)]">
            Select Operation Mode
          </h2>
          <button 
            onClick={() => onNavigate('menu')}
            className="theme-btn p-3 rounded-full flex items-center justify-center group"
            title="Back to Main Menu"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Campaign */}
          <button 
            onClick={() => onNavigate('battle')}
            className="theme-btn text-left p-8 rounded-xl flex flex-col gap-4 group h-full hover:bg-[var(--accent-color)] hover:bg-opacity-10 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-[var(--accent-color)] text-[var(--bg-color)]">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-wider">Valhalla Defense</h3>
            </div>
            <p className="opacity-80 leading-relaxed font-medium">
              Command the localized pantheon. Cannibalize outer realms, manage choke points, and execute a glorious last stand.
            </p>
          </button>

          {/* Sandbox Testing Lab */}
          <button 
            onClick={() => onNavigate('sandbox')}
            className="theme-btn text-left p-8 rounded-xl flex flex-col gap-4 group h-full hover:bg-cyan-500 hover:bg-opacity-10 hover:border-cyan-500 hover:text-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 border-gray-600 text-gray-300"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-gray-700 text-white group-hover:bg-cyan-500 transition-colors">
                <FlaskConical className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-wider">Combat Sandbox</h3>
            </div>
            <p className="opacity-80 leading-relaxed font-medium">
              Isolated tactical arena. Spawn units, benchmark FPS, and verify combat math.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
