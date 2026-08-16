import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioManager } from '../core/audio/AudioManager';
import { getSFXSources, getBGMSource } from '../data/audioManifest';
import type { Settings } from '../types/game';

// Create flexible mock instances
const mockHowlInstances: any[] = [];

vi.mock('howler', () => {
  class MockHowl {
    src: string[];
    options: any;
    private _volume: number = 1.0;
    private _rate: number = 1.0;
    private _playing: boolean = false;
    private _loop: boolean = false;
    public fadeCalls: any[] = [];
    public stopCalls: number = 0;
    public playCalls: number = 0;
    public unloadCalls: number = 0;

    constructor(options: any) {
      this.src = options.src;
      this.options = options;
      this._loop = !!options.loop;
      mockHowlInstances.push(this);
    }

    play() {
      this._playing = true;
      this.playCalls++;
      return 123; // mock soundId
    }

    stop() {
      this._playing = false;
      this.stopCalls++;
      return this;
    }

    pause() {
      this._playing = false;
      return this;
    }

    playing() {
      return this._playing;
    }

    volume(vol?: number, _id?: number) {
      if (vol !== undefined) {
        this._volume = vol;
        return this;
      }
      return this._volume;
    }

    rate(val?: number, _id?: number) {
      if (val !== undefined) {
        this._rate = val;
        return this;
      }
      return this._rate;
    }

    loop(val?: boolean, _id?: number) {
      if (val !== undefined) {
        this._loop = val;
        return this;
      }
      return this._loop;
    }

    fade(from: number, to: number, duration: number, _id?: number) {
      this.fadeCalls.push({ from, to, duration });
      this._volume = to;
      return this;
    }

    unload() {
      this.unloadCalls++;
    }
  }

  const MockHowler = {
    _volume: 1.0,
    volume(v?: number) {
      if (v !== undefined) {
        this._volume = v;
      }
      return this._volume;
    },
  };

  return {
    Howl: MockHowl,
    Howler: MockHowler,
  };
});

describe('AudioManager Core Engine', () => {
  beforeEach(() => {
    AudioManager.resetInstance();
    mockHowlInstances.length = 0;
    vi.clearAllMocks();
  });

  afterEach(() => {
    AudioManager.resetInstance();
  });

  describe('Volume & Mute Math Bounds (0.0 <= vol <= 1.0)', () => {
    it('clamps volume inputs strictly to 0.0 to 1.0', () => {
      const manager = AudioManager.getInstance();

      manager.setMasterVolume(1.5);
      expect(manager.getMasterVolume()).toBe(1.0);

      manager.setMasterVolume(-0.5);
      expect(manager.getMasterVolume()).toBe(0.0);

      manager.setSFXVolume(1.2);
      expect(manager.getSFXVolume()).toBe(1.0);

      manager.setSFXVolume(0.45);
      expect(manager.getSFXVolume()).toBeCloseTo(0.45, 4);

      manager.setBGMVolume(0.8);
      expect(manager.getBGMVolume()).toBeCloseTo(0.8, 4);

      manager.setCharacterVolume(-10);
      expect(manager.getCharacterVolume()).toBe(0.0);
    });

    it('calculates effective SFX volume considering master and channel mutes', () => {
      const manager = AudioManager.getInstance();

      manager.setMasterVolume(0.8);
      manager.setSFXVolume(0.5);
      expect(manager.getEffectiveSFXVolume()).toBeCloseTo(0.4, 4);

      // Channel mute
      manager.setSFXVolume(0.5, true);
      expect(manager.getEffectiveSFXVolume()).toBe(0.0);

      // Unmute SFX, mute Master
      manager.setSFXVolume(0.5, false);
      manager.setMasterVolume(0.8, true);
      expect(manager.getEffectiveSFXVolume()).toBe(0.0);
    });

    it('calculates effective BGM volume considering master and channel mutes', () => {
      const manager = AudioManager.getInstance();

      manager.setMasterVolume(0.5);
      manager.setBGMVolume(0.5);
      expect(manager.getEffectiveBGMVolume()).toBeCloseTo(0.25, 4);

      // Mute BGM
      manager.setBGMVolume(0.5, true);
      expect(manager.getEffectiveBGMVolume()).toBe(0.0);
    });

    it('calculates effective Character voice volume considering master and channel mutes', () => {
      const manager = AudioManager.getInstance();

      manager.setMasterVolume(1.0);
      manager.setCharacterVolume(0.6);
      expect(manager.getEffectiveCharacterVolume()).toBeCloseTo(0.6, 4);

      manager.setCharacterVolume(0.6, true);
      expect(manager.getEffectiveCharacterVolume()).toBe(0.0);
    });
  });

  describe('Settings Synchronization', () => {
    it('syncs complete settings payload from SettingsContext', () => {
      const manager = AudioManager.getInstance();

      const sampleSettings: Settings = {
        masterVolume: 75,
        sfxVolume: 60,
        characterVolume: 90,
        bgmVolume: 50,
        isMuted: false,
        isSfxMuted: false,
        isCharacterMuted: false,
        isBgmMuted: false,
        theme: 'slate',
      };

      manager.syncSettings(sampleSettings);

      expect(manager.getMasterVolume()).toBeCloseTo(0.75, 4);
      expect(manager.getSFXVolume()).toBeCloseTo(0.6, 4);
      expect(manager.getBGMVolume()).toBeCloseTo(0.5, 4);
      expect(manager.getCharacterVolume()).toBeCloseTo(0.9, 4);

      expect(manager.getEffectiveSFXVolume()).toBeCloseTo(0.75 * 0.6, 4);
      expect(manager.getEffectiveBGMVolume()).toBeCloseTo(0.75 * 0.5, 4);
    });

    it('updates active BGM volume live when syncing settings', () => {
      const manager = AudioManager.getInstance();
      manager.playBGM('bgm_campaign', 0);

      expect(manager.isBGMPlaying()).toBe(true);

      manager.syncSettings({
        masterVolume: 40,
        sfxVolume: 100,
        characterVolume: 100,
        bgmVolume: 50,
        isMuted: false,
        isSfxMuted: false,
        isCharacterMuted: false,
        isBgmMuted: false,
        theme: 'slate',
      });

      // BGM effective volume should be 0.4 * 0.5 = 0.2
      const activeHowl = mockHowlInstances.find((h) => h.src.includes('/audio/bgm/campaign_map.mp3'));
      expect(activeHowl).toBeDefined();
      expect(activeHowl.volume()).toBeCloseTo(0.2, 4);
    });
  });

  describe('SFX Manifest & Pitch Variation', () => {
    it('resolves SFX registered paths correctly', () => {
      const swordSources = getSFXSources('sword_strike');
      expect(swordSources.length).toBe(3);
      expect(swordSources[0]).toBe('/audio/sfx/sword1.mp3');

      const spawnSources = getSFXSources('unit_spawn');
      expect(spawnSources).toEqual(['/audio/sfx/unit_spawn.mp3']);

      const unknownSources = getSFXSources('non_existent_key');
      expect(unknownSources).toEqual([]);
    });

    it('plays SFX with pitch modulation within bounds', () => {
      const manager = AudioManager.getInstance();
      manager.setMasterVolume(1.0);
      manager.setSFXVolume(1.0);

      const soundId = manager.playSFX('sword_strike', { pitchVariation: 0.05 });
      expect(soundId).toBe(123);

      const createdHowl = mockHowlInstances[0];
      expect(createdHowl).toBeDefined();
      expect(createdHowl.playCalls).toBe(1);

      // Rate should be between 0.95 and 1.05
      const rate = createdHowl.rate();
      expect(rate).toBeGreaterThanOrEqual(0.95);
      expect(rate).toBeLessThanOrEqual(1.05);
    });

    it('does not play SFX when muted or effective volume is 0', () => {
      const manager = AudioManager.getInstance();
      manager.setSFXVolume(0);

      const soundId = manager.playSFX('button_click');
      expect(soundId).toBeNull();
      expect(mockHowlInstances.length).toBe(0);
    });

    it('gracefully handles missing SFX keys without throwing', () => {
      const manager = AudioManager.getInstance();
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = manager.playSFX('unregistered_sfx_key');
      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('BGM Cross-Fading & State Transitions', () => {
    it('resolves BGM registry paths correctly', () => {
      expect(getBGMSource('bgm_battle')).toBe('/audio/bgm/combat_action.mp3');
      expect(getBGMSource('bgm_campaign')).toBe('/audio/bgm/campaign_map.mp3');
      expect(getBGMSource('unknown_track')).toBeUndefined();
    });

    it('initiates playback and fades in new BGM track', () => {
      const manager = AudioManager.getInstance();
      manager.setMasterVolume(0.8);
      manager.setBGMVolume(0.8); // effective = 0.64

      manager.playBGM('bgm_campaign', 500);

      expect(manager.getCurrentBGMKey()).toBe('bgm_campaign');
      expect(manager.isBGMPlaying()).toBe(true);

      const activeHowl = mockHowlInstances[0];
      expect(activeHowl).toBeDefined();
      expect(activeHowl.fadeCalls.length).toBe(1);
      expect(activeHowl.fadeCalls[0].from).toBe(0);
      expect(activeHowl.fadeCalls[0].to).toBeCloseTo(0.64, 4);
      expect(activeHowl.fadeCalls[0].duration).toBe(500);
    });

    it('smoothly cross-fades old track out when transitioning to a new track', () => {
      const manager = AudioManager.getInstance();
      manager.setMasterVolume(1.0);
      manager.setBGMVolume(1.0);

      // Play Track 1
      manager.playBGM('bgm_campaign', 1000);
      const firstHowl = mockHowlInstances[0];
      expect(firstHowl.fadeCalls[0]).toEqual({ from: 0, to: 1.0, duration: 1000 });

      // Transition to Track 2
      manager.playBGM('bgm_battle', 1000);
      const secondHowl = mockHowlInstances[1];

      expect(manager.getCurrentBGMKey()).toBe('bgm_battle');
      expect(firstHowl.fadeCalls.length).toBe(2);
      expect(firstHowl.fadeCalls[1]).toEqual({ from: 1.0, to: 0, duration: 1000 });
      expect(secondHowl.fadeCalls[0]).toEqual({ from: 0, to: 1.0, duration: 1000 });
    });

    it('does not restart or crossfade if requesting the currently playing track', () => {
      const manager = AudioManager.getInstance();
      manager.playBGM('bgm_battle', 1000);

      expect(mockHowlInstances.length).toBe(1);

      // Call again with same key
      manager.playBGM('bgm_battle', 1000);
      expect(mockHowlInstances.length).toBe(1); // No new instance created
    });

    it('stops BGM with fade out', () => {
      const manager = AudioManager.getInstance();
      manager.playBGM('bgm_menu', 1000);

      const activeHowl = mockHowlInstances[0];
      manager.stopBGM(500);

      expect(manager.getCurrentBGMKey()).toBeNull();
      expect(manager.isBGMPlaying()).toBe(false);
      expect(activeHowl.fadeCalls.length).toBe(2); // In and out
    });

    it('pauses and resumes active BGM', () => {
      const manager = AudioManager.getInstance();
      manager.playBGM('bgm_menu', 0);
      expect(manager.isBGMPlaying()).toBe(true);

      manager.pauseBGM();
      expect(manager.isBGMPlaying()).toBe(false);

      manager.resumeBGM();
      expect(manager.isBGMPlaying()).toBe(true);
    });
  });
});
