import React from 'react';
import type { GameState, Theme } from '../types/game';
import { useSettings } from '../context/SettingsContext';
import { ArrowLeft, Volume2, VolumeX, Monitor, Moon, Zap, Target, Music, User, Disc } from 'lucide-react';
import clsx from 'clsx';

interface SettingsPageProps {
  onNavigate: (view: GameState) => void;
}

const THEMES: { id: Theme; name: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'slate', name: 'Classic Slate', icon: <Target className="w-5 h-5" />, desc: 'Minimalist gray & cobalt blue' },
  { id: 'dark-fantasy', name: 'Dark Fantasy', icon: <Moon className="w-5 h-5" />, desc: 'Deep slate & gold accents' },
  { id: 'cyberpunk', name: 'Cyberpunk', icon: <Zap className="w-5 h-5" />, desc: 'Neon cyan & fuchsia on black' },
];

interface AudioRowProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  masterMuted: boolean;
  master?: boolean;
}

const AudioRow: React.FC<AudioRowProps> = ({
  label, icon, value, onChange, isMuted, onToggleMute, masterMuted, master = false,
}) => {
  const effectivelyMuted = masterMuted || isMuted;
  const sliderPct = `${value}%`;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className={clsx('font-medium tracking-wide flex items-center gap-2', master && 'text-lg')}>
          {icon}
          {label}
        </span>
        <div className="flex items-center gap-4">
          <span className={clsx(
            'font-black tabular-nums text-right',
            master ? 'text-xl w-12' : 'text-base w-10',
            effectivelyMuted ? 'text-slate-500' : 'text-[var(--accent-color)]',
          )}>
            {value}%
          </span>
          <button
            onClick={onToggleMute}
            title={isMuted ? `Unmute ${label}` : `Mute ${label}`}
            className={clsx(
              'p-2 rounded-lg transition-all duration-200 border',
              master ? 'p-2.5' : 'p-2',
              isMuted
                ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                : 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--border-color)]/50 hover:bg-[var(--accent-color)]/25 hover:shadow-[0_0_8px_var(--accent-color)]',
            )}
          >
            {isMuted
              ? <VolumeX className={master ? 'w-5 h-5' : 'w-4 h-4'} />
              : <Volume2 className={master ? 'w-5 h-5' : 'w-4 h-4'} />}
          </button>
        </div>
      </div>

      {/* Styled range slider */}
      <div className="relative flex items-center py-1">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          disabled={effectivelyMuted}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ '--slider-pct': sliderPct } as React.CSSProperties}
          className={clsx(
            'volume-slider',
            master && 'volume-slider-master',
          )}
        />
      </div>
    </div>
  );
};

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="w-full h-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Scrollable area — items-start + py padding prevents top cutoff */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative min-h-full flex items-start justify-center p-6 py-8">
          {/* Background glow */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-[600px] h-[600px] rounded-full bg-[var(--accent-color)] blur-[120px]" />
          </div>

          {/* Panel */}
          <div className="relative z-10 w-full max-w-2xl theme-panel rounded-2xl backdrop-blur-md p-10">

            {/* Header */}
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
              {/* ── Audio Section ──────────────────────────────────────── */}
              <section className="space-y-6">
                <h3 className="text-xl font-bold uppercase tracking-wider opacity-80 flex items-center gap-2">
                  <Volume2 className="w-5 h-5" /> Audio Controls
                </h3>

                <div className="bg-black/40 p-6 rounded-xl border border-[var(--border-color)] space-y-6">
                  {/* Master */}
                  <AudioRow
                    master
                    label="Master Volume"
                    icon={<Volume2 className="w-5 h-5" />}
                    value={settings.masterVolume}
                    onChange={(v) => updateSettings({ masterVolume: v })}
                    isMuted={settings.isMuted}
                    onToggleMute={() => updateSettings({ isMuted: !settings.isMuted })}
                    masterMuted={false}
                  />

                  <div className="border-t border-gray-700/60 pt-5 space-y-5">
                    {/* BGM */}
                    <AudioRow
                      label="Background Music"
                      icon={<Disc className="w-4 h-4" />}
                      value={settings.bgmVolume}
                      onChange={(v) => updateSettings({ bgmVolume: v })}
                      isMuted={settings.isBgmMuted}
                      onToggleMute={() => updateSettings({ isBgmMuted: !settings.isBgmMuted })}
                      masterMuted={settings.isMuted}
                    />

                    {/* SFX */}
                    <AudioRow
                      label="Sound Effects"
                      icon={<Music className="w-4 h-4" />}
                      value={settings.sfxVolume}
                      onChange={(v) => updateSettings({ sfxVolume: v })}
                      isMuted={settings.isSfxMuted}
                      onToggleMute={() => updateSettings({ isSfxMuted: !settings.isSfxMuted })}
                      masterMuted={settings.isMuted}
                    />

                    {/* Character Voices */}
                    <AudioRow
                      label="Character Voices"
                      icon={<User className="w-4 h-4" />}
                      value={settings.characterVolume}
                      onChange={(v) => updateSettings({ characterVolume: v })}
                      isMuted={settings.isCharacterMuted}
                      onToggleMute={() => updateSettings({ isCharacterMuted: !settings.isCharacterMuted })}
                      masterMuted={settings.isMuted}
                    />
                  </div>
                </div>
              </section>

              {/* ── Theme Section ──────────────────────────────────────── */}
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
                        'flex flex-col items-center text-center p-6 rounded-xl border transition-all duration-300 gap-4',
                        settings.theme === theme.id
                          ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 shadow-[0_0_20px_var(--border-color)] scale-105'
                          : 'border-[var(--border-color)]/30 hover:border-[var(--border-color)] hover:bg-[var(--border-color)]/10 bg-black/40',
                      )}
                    >
                      <div className={clsx(
                        'p-4 rounded-full transition-colors',
                        settings.theme === theme.id
                          ? 'bg-[var(--accent-color)] text-[var(--bg-color)]'
                          : 'bg-gray-800 text-[var(--text-color)]',
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
    </div>
  );
};
