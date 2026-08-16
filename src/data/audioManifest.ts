export type SFXKey =
  | 'sword_strike'
  | 'bow_shoot'
  | 'magic_cast'
  | 'unit_spawn'
  | 'unit_death'
  | 'button_click'
  | 'victory'
  | 'defeat'
  | 'error'
  | 'coin_clink'
  | 'level_up';

export type BGMKey =
  | 'bgm_menu'
  | 'bgm_campaign'
  | 'bgm_battle'
  | 'bgm_victory'
  | 'bgm_gameover';

export type AudioEntry = string | string[];

/**
 * Manifest of all Sound Effects (SFX).
 * Can be a single asset path or an array of sample paths for randomized audio variation.
 */
export const SFX_REGISTRY: Record<SFXKey | string, AudioEntry> = {
  sword_strike: [
    '/audio/sfx/sword1.mp3',
    '/audio/sfx/sword2.mp3',
    '/audio/sfx/sword3.mp3',
  ],
  bow_shoot: [
    '/audio/sfx/bow1.mp3',
    '/audio/sfx/bow2.mp3',
  ],
  magic_cast: [
    '/audio/sfx/magic1.mp3',
    '/audio/sfx/magic2.mp3',
  ],
  unit_spawn: '/audio/sfx/unit_spawn.mp3',
  unit_death: [
    '/audio/sfx/death1.mp3',
    '/audio/sfx/death2.mp3',
  ],
  button_click: '/audio/sfx/click.mp3',
  victory: '/audio/sfx/victory_fanfare.mp3',
  defeat: '/audio/sfx/defeat_horn.mp3',
  error: '/audio/sfx/error.mp3',
  coin_clink: '/audio/sfx/coin.mp3',
  level_up: '/audio/sfx/levelup.mp3',
};

/**
 * Manifest of Background Music (BGM) tracks.
 */
export const BGM_REGISTRY: Record<BGMKey | string, string> = {
  bgm_menu: '/audio/bgm/menu_theme.mp3',
  bgm_campaign: '/audio/bgm/campaign_map.mp3',
  bgm_battle: '/audio/bgm/combat_action.mp3',
  bgm_victory: '/audio/bgm/victory_theme.mp3',
  bgm_gameover: '/audio/bgm/game_over.mp3',
};

/**
 * Resolves SFX sources for a key. Returns an array of paths or empty array if missing.
 */
export function getSFXSources(key: SFXKey | string): string[] {
  const entry = SFX_REGISTRY[key];
  if (!entry) return [];
  return Array.isArray(entry) ? entry : [entry];
}

/**
 * Resolves BGM source for a key.
 */
export function getBGMSource(key: BGMKey | string): string | undefined {
  return BGM_REGISTRY[key];
}
