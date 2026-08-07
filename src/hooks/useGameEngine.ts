import { useEffect, useRef } from 'react';
import { GameEngine } from '../core/engine/GameEngine';

export const useGameEngine = () => {
  const engineRef = useRef(GameEngine.getInstance());

  useEffect(() => {
    const engine = engineRef.current;
    engine.start();

    return () => {
      engine.stop();
    };
  }, []);

  return engineRef.current;
};
