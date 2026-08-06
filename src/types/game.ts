export type GameState = 'menu' | 'mode_select' | 'battle' | 'sandbox' | 'settings';
export type RunPhase = 'empire_management' | 'battle_select' | 'pre_battle' | 'combat' | 'game_over';
export type WaveType = 'skirmish' | 'mid_boss' | 'endless_doom';
export type Theme = 'dark-fantasy' | 'cyberpunk' | 'slate';

export interface Settings {
  masterVolume: number;
  isMuted: boolean;
  theme: Theme;
}
