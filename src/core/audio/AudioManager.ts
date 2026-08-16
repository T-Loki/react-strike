import { Howl, Howler } from 'howler';
import type { SFXKey, BGMKey } from '../../data/audioManifest';
import { getSFXSources, getBGMSource } from '../../data/audioManifest';
import type { Settings } from '../../types/game';

export interface SFXOptions {
  volume?: number; // 0.0 to 1.0 multiplier
  pitchVariation?: number; // e.g. 0.05 for +/- 5% rate modulation
  rate?: number; // base playback speed
  loop?: boolean;
  minIntervalMs?: number; // minimal interval between plays to prevent distortion
}

export interface BGMOptions {
  fadeDurationMs?: number;
  loop?: boolean;
}

export class AudioManager {
  private static instance: AudioManager | null = null;

  // Normalized volumes [0.0, 1.0]
  private masterVolume: number = 1.0;
  private sfxVolume: number = 1.0;
  private bgmVolume: number = 1.0;
  private characterVolume: number = 1.0;

  // Mute flags
  private isMuted: boolean = false;
  private isSfxMuted: boolean = false;
  private isBgmMuted: boolean = false;
  private isCharacterMuted: boolean = false;

  // Howl Cache & Active BGM state
  private soundCache: Map<string, Howl> = new Map();
  private lastSFXPlayTimes: Map<string, number> = new Map();
  private currentBGMKey: string | null = null;
  private currentBGMHowl: Howl | null = null;
  private isBgmPaused: boolean = false;

  private constructor() {
    this.applyMasterVolume();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  /**
   * Resets singleton state (primarily for test harness cleanup).
   */
  public static resetInstance(): void {
    if (AudioManager.instance) {
      AudioManager.instance.stopBGM(0);
      AudioManager.instance.soundCache.forEach((howl) => {
        try {
          howl.unload();
        } catch {
          // Ignore unload errors in tests
        }
      });
      AudioManager.instance.soundCache.clear();
      AudioManager.instance.lastSFXPlayTimes.clear();
      AudioManager.instance = null;
    }
  }

  /**
   * Clamps any numeric value strictly to [0.0, 1.0].
   */
  public clamp01(val: number): number {
    if (Number.isNaN(val)) return 0;
    return Math.max(0, Math.min(1, val));
  }

  // ---------------------------------------------------------------------------
  // Volume Calculations & Synchronization
  // ---------------------------------------------------------------------------

  public getEffectiveSFXVolume(): number {
    if (this.isMuted || this.isSfxMuted) return 0;
    return this.clamp01(this.masterVolume * this.sfxVolume);
  }

  public getEffectiveBGMVolume(): number {
    if (this.isMuted || this.isBgmMuted) return 0;
    return this.clamp01(this.masterVolume * this.bgmVolume);
  }

  public getEffectiveCharacterVolume(): number {
    if (this.isMuted || this.isCharacterMuted) return 0;
    return this.clamp01(this.masterVolume * this.characterVolume);
  }

  /**
   * Synchronizes AudioManager state directly with React Settings state.
   */
  public syncSettings(settings: Settings): void {
    this.masterVolume = this.clamp01(settings.masterVolume / 100);
    this.sfxVolume = this.clamp01(settings.sfxVolume / 100);
    this.bgmVolume = this.clamp01(settings.bgmVolume / 100);
    this.characterVolume = this.clamp01(settings.characterVolume / 100);

    this.isMuted = !!settings.isMuted;
    this.isSfxMuted = !!settings.isSfxMuted;
    this.isBgmMuted = !!settings.isBgmMuted;
    this.isCharacterMuted = !!settings.isCharacterMuted;

    this.applyMasterVolume();
    this.updateActiveBGMVolume();
  }

  public setMasterVolume(val: number, isMuted?: boolean): void {
    this.masterVolume = this.clamp01(val);
    if (isMuted !== undefined) this.isMuted = isMuted;
    this.applyMasterVolume();
    this.updateActiveBGMVolume();
  }

  public setSFXVolume(val: number, isMuted?: boolean): void {
    this.sfxVolume = this.clamp01(val);
    if (isMuted !== undefined) this.isSfxMuted = isMuted;
  }

  public setBGMVolume(val: number, isMuted?: boolean): void {
    this.bgmVolume = this.clamp01(val);
    if (isMuted !== undefined) this.isBgmMuted = isMuted;
    this.updateActiveBGMVolume();
  }

  public setCharacterVolume(val: number, isMuted?: boolean): void {
    this.characterVolume = this.clamp01(val);
    if (isMuted !== undefined) this.isCharacterMuted = isMuted;
  }

  private applyMasterVolume(): void {
    try {
      Howler.volume(this.isMuted ? 0 : this.masterVolume);
    } catch {
      // Catch mock / headless errors
    }
  }

  private updateActiveBGMVolume(): void {
    if (this.currentBGMHowl && this.currentBGMHowl.playing()) {
      const targetVol = this.getEffectiveBGMVolume();
      this.currentBGMHowl.volume(targetVol);
    }
  }

  // ---------------------------------------------------------------------------
  // SFX Playback with Randomization & Pitch Variation
  // ---------------------------------------------------------------------------

  public playSFX(key: SFXKey | string, options?: SFXOptions): number | null {
    const effectiveVol = this.getEffectiveSFXVolume();
    if (effectiveVol <= 0) {
      return null;
    }

    const minInterval = options?.minIntervalMs ?? 0;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (minInterval > 0) {
      const lastPlay = this.lastSFXPlayTimes.get(key) || 0;
      if (now - lastPlay < minInterval) {
        return null;
      }
      this.lastSFXPlayTimes.set(key, now);
    }

    const sources = getSFXSources(key);
    if (!sources || sources.length === 0) {
      console.warn(`[AudioManager] No audio source registered for SFX key: "${key}"`);
      return null;
    }

    // Pick random sound variant if multiple samples exist
    const selectedSource = sources[Math.floor(Math.random() * sources.length)];
    const howl = this.getOrCreateHowl(selectedSource, false);

    // Calculate pitch/rate variation (+/- 0.05 default modulation)
    const variation = options?.pitchVariation ?? 0.05;
    const baseRate = options?.rate ?? 1.0;
    const randomOffset = (Math.random() * 2 - 1) * variation;
    const finalRate = Math.max(0.5, Math.min(2.0, baseRate + randomOffset));

    const soundVolume = this.clamp01(effectiveVol * (options?.volume ?? 1.0));

    try {
      const soundId = howl.play();
      howl.rate(finalRate, soundId);
      howl.volume(soundVolume, soundId);
      if (options?.loop) {
        howl.loop(true, soundId);
      }
      return soundId;
    } catch (err) {
      console.warn(`[AudioManager] Failed to play SFX "${key}":`, err);
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Smooth Cross-Fading BGM Management
  // ---------------------------------------------------------------------------

  public playBGM(trackKey: BGMKey | string, options?: BGMOptions | number): void {
    const fadeDurationMs = typeof options === 'number' 
      ? options 
      : (options?.fadeDurationMs ?? 1000);
    const loop = typeof options === 'object' && options?.loop !== undefined 
      ? options.loop 
      : true;

    // Check if already playing the exact same track
    if (this.currentBGMKey === trackKey && this.currentBGMHowl && this.currentBGMHowl.playing()) {
      this.updateActiveBGMVolume();
      return;
    }

    const source = getBGMSource(trackKey) || trackKey;
    const targetVolume = this.getEffectiveBGMVolume();

    const previousHowl = this.currentBGMHowl;
    const newHowl = this.getOrCreateHowl(source, true, loop);

    // Cross-fade out existing track
    if (previousHowl && previousHowl.playing()) {
      if (fadeDurationMs > 0) {
        const currentVol = previousHowl.volume() as number;
        previousHowl.fade(currentVol, 0, fadeDurationMs);
        setTimeout(() => {
          try {
            previousHowl.stop();
          } catch {
            // Ignore
          }
        }, fadeDurationMs + 50);
      } else {
        previousHowl.stop();
      }
    }

    // Fade in new track
    this.currentBGMKey = trackKey;
    this.currentBGMHowl = newHowl;
    this.isBgmPaused = false;

    try {
      newHowl.volume(0);
      newHowl.play();
      if (fadeDurationMs > 0 && targetVolume > 0) {
        newHowl.fade(0, targetVolume, fadeDurationMs);
      } else {
        newHowl.volume(targetVolume);
      }
    } catch (err) {
      console.warn(`[AudioManager] Failed to play BGM "${trackKey}":`, err);
    }
  }

  public stopBGM(fadeDurationMs: number = 1000): void {
    if (!this.currentBGMHowl) return;

    const howl = this.currentBGMHowl;
    this.currentBGMKey = null;
    this.currentBGMHowl = null;
    this.isBgmPaused = false;

    try {
      if (fadeDurationMs > 0 && howl.playing()) {
        const currentVol = (howl.volume() as number) || 0;
        howl.fade(currentVol, 0, fadeDurationMs);
        setTimeout(() => {
          try {
            howl.stop();
          } catch {
            // Ignore
          }
        }, fadeDurationMs + 50);
      } else {
        howl.stop();
      }
    } catch {
      // Ignore
    }
  }

  public pauseBGM(): void {
    if (this.currentBGMHowl && this.currentBGMHowl.playing()) {
      this.currentBGMHowl.pause();
      this.isBgmPaused = true;
    }
  }

  public resumeBGM(): void {
    if (this.currentBGMHowl && this.isBgmPaused) {
      this.currentBGMHowl.play();
      this.isBgmPaused = false;
    }
  }

  // ---------------------------------------------------------------------------
  // Internal Helpers & Caching
  // ---------------------------------------------------------------------------

  private getOrCreateHowl(src: string, isStream: boolean = false, loop: boolean = false): Howl {
    const cacheKey = `${src}_${isStream ? 'stream' : 'static'}_${loop ? 'loop' : 'once'}`;
    let howl = this.soundCache.get(cacheKey);

    if (!howl) {
      howl = new Howl({
        src: [src],
        html5: isStream,
        loop,
        preload: true,
        onloaderror: (_id, err) => {
          console.warn(`[AudioManager] Audio file failed to load: ${src}`, err);
        },
        onplayerror: (_id, err) => {
          console.warn(`[AudioManager] Audio playback error: ${src}`, err);
        },
      });
      this.soundCache.set(cacheKey, howl);
    }

    return howl;
  }

  // Getters for inspection / tests
  public getMasterVolume(): number { return this.masterVolume; }
  public getBGMVolume(): number { return this.bgmVolume; }
  public getSFXVolume(): number { return this.sfxVolume; }
  public getCharacterVolume(): number { return this.characterVolume; }
  public getCurrentBGMKey(): string | null { return this.currentBGMKey; }
  public isBGMPlaying(): boolean {
    return !!(this.currentBGMHowl && this.currentBGMHowl.playing() && !this.isBgmPaused);
  }
}
