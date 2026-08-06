import React from 'react';
import type { GameState, Theme } from '../types/game';
import { useSettings } from '../context/SettingsContext';
import { ArrowLeft, Volume2, VolumeX, Monitor, Moon, Zap, Target } from 'lucide-react';
import clsx from 'clsx';

interface SettingsPageProps {
  onNavigate: (view: GameState) => void;
}

const THEMES: { id: Theme; name: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'dark-fantasy', name: 'Dark Fantasy', icon: <Moon className="w-5 h-5" />, desc: 'Deep slate & gold accents' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: <Zap className="w-5 h-5" />, desc: 'Neon cyan & fuchsia on black' },
  { id: 'slate', name: 'Classic Slate', icon: <Target className="w-5 h-5" />, desc: 'Minimalist gray & cobalt blue' },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="h-screen w-full overflow-y-auto overflow-x-hidden">
      <div className="min-h-full flex items-center justify-center relative p-6 py-12">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
           <div className="w-[600px] h-[600px] rounded-full bg-[var(--accent-color)] blur-[120px]"></div>
        </div>

        <div className="z-10 flex flex-col w-full max-w-2xl p-10 theme-panel rounded-2xl backdrop-blur-md my-auto">
        <div className="flex items-center justify-between mb-8 border-b border-[var(--border-color)] pb-6">
          <h2 className="text-3xl font-black tracking-widest uppercase text-[var(--accent-color)] flex items-center gap-3">
            <Monitor className="w-8 h-8" />
            Configuration
          </h2>
          <button 
            onClick={() => onNavigate('menu')}
            className="theme-btn p-3 rounded-full flex items-center justify-center group"
            title="Back to Main Menu"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="space-y-10">
          {/* Audio Section */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
              <Volume2 className="w-5 h-5" /> Audio Controls
            </h3>
            
            <div className="bg-black/40 p-8 rounded-xl border border-[var(--border-color)] space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lg tracking-wide">Master Volume</span>
                  <span className="font-black text-xl text-[var(--accent-color)]">{settings.masterVolume}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={settings.masterVolume}
                  disabled={settings.isMuted}
                  onChange={(e) => updateSettings({ masterVolume: Number(e.target.value) })}
                  className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)] focus:outline-none"
                />
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                <span className="font-medium text-lg tracking-wide">Mute All Sounds</span>
                <button 
                  onClick={() => updateSettings({ isMuted: !settings.isMuted })}
                  className={clsx(
                    "p-4 rounded-xl transition-all duration-300 border shadow-lg",
                    settings.isMuted 
                      ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-red-500/20" 
                      : "bg-[var(--accent-color)]/20 text-[var(--accent-color)] border-[var(--border-color)] shadow-[var(--accent-color)]/20"
                  )}
                >
                  {settings.isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </section>

          {/* Theme Section */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
              <Moon className="w-5 h-5" /> Interface Theme
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => updateSettings({ theme: theme.id })}
                  className={clsx(
                    "flex flex-col items-center text-center p-6 rounded-xl border transition-all duration-300 gap-4",
                    settings.theme === theme.id
                      ? "border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-[0_0_20px_var(--border-color)] transform scale-105"
                      : "border-[var(--border-color)]/30 hover:border-[var(--border-color)] hover:bg-[var(--border-color)]/10 bg-black/40"
                  )}
                >
                  <div className={clsx(
                    "p-4 rounded-full transition-colors",
                    settings.theme === theme.id ? "bg-[var(--accent-color)] text-[var(--bg-color)]" : "bg-gray-800 text-[var(--text-color)]"
                  )}>
                    {theme.icon}
                  </div>
                  <div>
                    <div className="font-black tracking-wide text-lg">{theme.name}</div>
                    <div className="text-sm opacity-60 mt-1">{theme.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
      </div>
    </div>
  );
};
