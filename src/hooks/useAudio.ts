import { useCallback } from 'react';
import { AudioManager } from '../core/audio/AudioManager';
import type { SFXOptions, BGMOptions } from '../core/audio/AudioManager';
import type { SFXKey, BGMKey } from '../data/audioManifest';

export function useAudio() {
  const audioManager = AudioManager.getInstance();

  const playSFX = useCallback(
    (key: SFXKey | string, options?: SFXOptions) => {
      return audioManager.playSFX(key, options);
    },
    [audioManager]
  );

  const playBGM = useCallback(
    (trackKey: BGMKey | string, options?: BGMOptions | number) => {
      audioManager.playBGM(trackKey, options);
    },
    [audioManager]
  );

  const stopBGM = useCallback(
    (fadeDurationMs?: number) => {
      audioManager.stopBGM(fadeDurationMs);
    },
    [audioManager]
  );

  const pauseBGM = useCallback(() => {
    audioManager.pauseBGM();
  }, [audioManager]);

  const resumeBGM = useCallback(() => {
    audioManager.resumeBGM();
  }, [audioManager]);

  return {
    audioManager,
    playSFX,
    playBGM,
    stopBGM,
    pauseBGM,
    resumeBGM,
  };
}
