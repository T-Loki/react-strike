import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Settings } from '../types/game';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  masterVolume: 100,
  sfxVolume: 100,
  characterVolume: 100,
  bgmVolume: 100,
  isMuted: false,
  isSfxMuted: false,
  isCharacterMuted: false,
  isBgmMuted: false,
  theme: 'slate',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('direct-strike-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<Settings>;
        // Merge field-by-field with nullish coalescing so stale saves
        // never produce undefined for newly added fields.
        return {
          masterVolume: parsed.masterVolume ?? defaultSettings.masterVolume,
          sfxVolume: parsed.sfxVolume ?? defaultSettings.sfxVolume,
          characterVolume: parsed.characterVolume ?? defaultSettings.characterVolume,
          bgmVolume: parsed.bgmVolume ?? defaultSettings.bgmVolume,
          isMuted: parsed.isMuted ?? defaultSettings.isMuted,
          isSfxMuted: parsed.isSfxMuted ?? defaultSettings.isSfxMuted,
          isCharacterMuted: parsed.isCharacterMuted ?? defaultSettings.isCharacterMuted,
          isBgmMuted: parsed.isBgmMuted ?? defaultSettings.isBgmMuted,
          theme: parsed.theme ?? defaultSettings.theme,
        };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('direct-strike-settings', JSON.stringify(settings));
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
