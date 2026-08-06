export type GameState = 'menu' | 'mode_select' | 'battle' | 'sandbox' | 'settings' | 'story';
export type RunPhase = 'empire_management' | 'battle_select' | 'pre_battle' | 'combat' | 'round_summary' | 'game_over';
export type WaveType = 'skirmish' | 'mid_boss' | 'endless_doom';
export type Theme = 'dark-fantasy' | 'cyberpunk' | 'slate';

export interface Settings {
  masterVolume: number;
  sfxVolume: number;
  characterVolume: number;
  bgmVolume: number;
  isMuted: boolean;
  isSfxMuted: boolean;
  isCharacterMuted: boolean;
  isBgmMuted: boolean;
  theme: Theme;
}

export interface EmporiumItem {
  id: string;
  name: string;
  category: 'decree' | 'perk' | 'spell';
  cost: number;
  costType: 'gold' | 'faith';
  description: string;
  icon: string;
  purchased?: boolean;
  effectValue?: number;
}
