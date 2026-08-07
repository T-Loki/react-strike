import type { WaveContext } from '../../types/combat';
import type { WaveStrategy } from './WaveStrategy';
import { ScriptedWaveStrategy, ScaledEndlessStrategy, SkirmishWaveStrategy } from './WaveStrategy';

export class WaveStrategyFactory {
  static getStrategy(context: WaveContext = {}): WaveStrategy {
    if (context.isSandbox) {
      return new ScaledEndlessStrategy();
    }

    if (context.pointBudget !== undefined && !context.territoryId) {
      return new SkirmishWaveStrategy();
    }

    // Default to scripted strategy for territory / campaign context
    return new ScriptedWaveStrategy();
  }
}
