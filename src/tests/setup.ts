import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global Howler Mock for Node / JSDOM vitest environment
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
      (globalThis as any).__lastMockHowl = this;
      if (!(globalThis as any).__mockHowls) {
        (globalThis as any).__mockHowls = [];
      }
      (globalThis as any).__mockHowls.push(this);
    }

    play() {
      this._playing = true;
      this.playCalls++;
      return 1;
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
