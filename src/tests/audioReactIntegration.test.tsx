import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import React from 'react';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import { useAudio } from '../hooks/useAudio';
import { AudioManager } from '../core/audio/AudioManager';

vi.mock('howler', () => {
  class MockHowl {
    src: string[];
    options: any;
    private _volume: number = 1.0;
    private _rate: number = 1.0;
    private _playing: boolean = false;

    constructor(options: any) {
      this.src = options.src;
      this.options = options;
    }

    play() {
      this._playing = true;
      return 1;
    }

    stop() {
      this._playing = false;
      return this;
    }

    pause() {
      this._playing = false;
      return this;
    }

    playing() {
      return this._playing;
    }

    volume(vol?: number) {
      if (vol !== undefined) {
        this._volume = vol;
        return this;
      }
      return this._volume;
    }

    rate(val?: number) {
      if (val !== undefined) {
        this._rate = val;
        return this;
      }
      return this._rate;
    }

    fade(_from: number, to: number, _duration: number) {
      this._volume = to;
      return this;
    }

    unload() {}
  }

  const MockHowler = {
    volume: vi.fn(),
  };

  return {
    Howl: MockHowl,
    Howler: MockHowler,
  };
});

const AudioTestComponent: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const { playSFX, playBGM } = useAudio();

  return (
    <div>
      <div data-testid="master-vol">{settings.masterVolume}</div>
      <button onClick={() => updateSettings({ masterVolume: 50 })}>Set Master 50</button>
      <button onClick={() => updateSettings({ isSfxMuted: true })}>Mute SFX</button>
      <button onClick={() => playSFX('button_click')}>Play Click</button>
      <button onClick={() => playBGM('bgm_battle')}>Play Battle BGM</button>
    </div>
  );
};

describe('Audio React Integration (SettingsContext + useAudio)', () => {
  beforeEach(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // Ignore if localStorage unavailable
    }
    AudioManager.resetInstance();
  });

  it('updates live AudioManager state when SettingsContext values change', () => {
    render(
      <SettingsProvider>
        <AudioTestComponent />
      </SettingsProvider>
    );

    const manager = AudioManager.getInstance();
    expect(manager.getMasterVolume()).toBe(1.0);

    // Click set master 50
    fireEvent.click(screen.getByText('Set Master 50'));
    expect(manager.getMasterVolume()).toBeCloseTo(0.5, 4);

    // Click mute SFX
    fireEvent.click(screen.getByText('Mute SFX'));
    expect(manager.getEffectiveSFXVolume()).toBe(0.0);
  });

  it('useAudio hook triggers playback without throwing', () => {
    const { result } = renderHook(() => useAudio());

    act(() => {
      const soundId = result.current.playSFX('button_click');
      expect(soundId).toBe(1);
    });

    act(() => {
      result.current.playBGM('bgm_campaign');
    });

    expect(result.current.audioManager.getCurrentBGMKey()).toBe('bgm_campaign');
  });
});
