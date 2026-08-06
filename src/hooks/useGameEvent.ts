import { useEffect, useRef } from 'react';
import { GameEngine } from '../core/engine/GameEngine';
import type { GameEventPayloads } from '../core/events/EventBus';

export const useGameEvent = <K extends keyof GameEventPayloads>(
  event: K,
  callback: (payload?: GameEventPayloads[K]) => void
) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const engine = GameEngine.getInstance();
    const handler = (payload?: GameEventPayloads[K]) => savedCallback.current(payload);
    engine.events.on(event, handler);
    
    return () => {
      engine.events.off(event, handler);
    };
  }, [event]);
};
