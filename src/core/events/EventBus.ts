import type { Unit } from '../../types/combat';

export interface GameEventPayloads {
  tick: { deltaTime: number };
  spawn: Unit;
  death: Unit;
  clear: void;
  pause: void;
  resume: void;
}

export type EventCallback<K extends keyof GameEventPayloads> = (
  ...args: GameEventPayloads[K] extends void ? [] : [GameEventPayloads[K]]
) => void;

export class EventBus {
  private listeners: { [K in keyof GameEventPayloads]?: EventCallback<K>[] } = {};

  on<K extends keyof GameEventPayloads>(event: K, callback: EventCallback<K>): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
  }

  off<K extends keyof GameEventPayloads>(event: K, callback: EventCallback<K>): void {
    if (!this.listeners[event]) return;
    const array = this.listeners[event] as EventCallback<K>[];
    Object.assign(this.listeners, { [event]: array.filter(cb => cb !== callback) });
  }

  emit<K extends keyof GameEventPayloads>(
    event: K,
    ...args: GameEventPayloads[K] extends void ? [] : [GameEventPayloads[K]]
  ): void {
    if (!this.listeners[event]) return;
    this.listeners[event]!.forEach(cb => {
      const typedCb = cb as (...a: typeof args) => void;
      typedCb(...args);
    });
  }

  clear(): void {
    this.listeners = {};
  }
}
