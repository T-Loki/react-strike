import React, { useState } from 'react';
import type { GameState } from '../types/game';
import { Sword, Settings as SettingsIcon, LogOut } from 'lucide-react';

declare global {
  interface Window {
    __TAURI__?: {
      process: { exit: () => void };
    };
    electron?: {
      ipcRenderer: { send: (channel: string, ...args: unknown[]) => void };
    };
  }
}

interface MainMenuProps {
  onNavigate: (view: GameState) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  const [showExitToast, setShowExitToast] = useState(false);

  const handleExit = () => {
    // Check if running in a desktop shell (Tauri/Electron)
    if (window.__TAURI__ || window.electron) {
      if (window.__TAURI__) {
         window.__TAURI__.process.exit();
      } else if (window.electron) {
         window.electron.ipcRenderer.send('app-quit');
      }
    } else {
      // Browser tab close attempt
      try {
        window.close();
        // If window is still open after a tiny delay, show toast
        setTimeout(() => {
          if (!window.closed) {
            setShowExitToast(true);
            setTimeout(() => setShowExitToast(false), 3000);
          }
        }, 300);
      } catch (e) {
        setShowExitToast(true);
        setTimeout(() => setShowExitToast(false), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
         <div className="w-[800px] h-[800px] rounded-full bg-[var(--accent-color)] blur-[150px] animate-pulse"></div>
      </div>

      <div className="z-10 flex flex-col items-center gap-8 w-full max-w-md p-10 theme-panel rounded-2xl backdrop-blur-md">
        <div className="text-center mb-4">
          <h1 className="text-5xl font-black mb-2 tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-color)] to-[var(--accent-color)] drop-shadow-[0_0_15px_var(--accent-color)]">
            Fantasy Strike
          </h1>
          <p className="text-sm opacity-80 tracking-widest uppercase text-[var(--accent-color)]">Auto-Battler Defense</p>
        </div>

        <div className="flex flex-col gap-5 w-full">
          <button 
            onClick={() => onNavigate('mode_select')}
            className="theme-btn flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-bold uppercase tracking-wider text-lg w-full group"
          >
            <Sword className="w-6 h-6 group-hover:animate-bounce" />
            <span>Start Game</span>
          </button>

          <button 
            onClick={() => onNavigate('settings')}
            className="theme-btn flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-bold uppercase tracking-wider text-lg w-full group"
          >
            <SettingsIcon className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
            <span>Settings</span>
          </button>

          <button 
            onClick={handleExit}
            className="theme-btn flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-bold uppercase tracking-wider text-lg w-full group opacity-80 hover:opacity-100"
          >
            <LogOut className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            <span>Exit Game</span>
          </button>
        </div>
      </div>

      {showExitToast && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[var(--panel-bg)] text-[var(--text-color)] border border-[var(--border-color)] px-8 py-4 rounded-xl shadow-2xl animate-fade-in z-50 flex items-center gap-3">
          <LogOut className="w-5 h-5 text-red-400" />
          <p className="font-bold tracking-wide">Please close your browser tab to exit.</p>
        </div>
      )}
    </div>
  );
};
