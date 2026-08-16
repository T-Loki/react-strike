# ⚔️ Fantasy Strike

> A dark fantasy strategy auto-battler and campaign game combining high-performance 60 FPS HTML5 Canvas combat simulation with grand logistics, territory defense, visual novel storytelling, and an interactive audio engine.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-136%20Passed-success.svg)](https://vitest.dev/)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Available Scripts](#available-scripts)
- [Audio System & Audio Files Guide](#-audio-system--audio-files-guide)
  - [Where to Put Audio Files](#where-to-put-audio-files)
  - [Supported Audio Formats](#supported-audio-formats)
  - [Audio Manifest & Expected Assets](#audio-manifest--expected-assets)
  - [Adding New Sound Effects or Music](#adding-new-sound-effects-or-music)
  - [Audio Engine Features](#audio-engine-features)
- [Architecture & Design Principles](#-architecture--design-principles)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [License](#-license)

---

## 🌟 Overview

**Fantasy Strike** is a hybrid tactical RPG built on a dual-engine architecture:
1. **Canvas Combat Engine**: Runs an unmanaged 60 FPS physics, pathfinding, and attack simulation loop via `requestAnimationFrame`.
2. **React DOM Management Layer**: Handles campaign orchestration, economic logistics, unit positioning grids, character dialogue, and user settings.

---

## 🎮 Key Features

- **⚔️ 60 FPS Canvas Auto-Battler**: Real-time melee, ranged, and magic combat with custom spatial geometry, friendly hold/engage state machines, targeting algorithms, and particle effects.
- **🏰 Grand Campaign & Logistics**: Turn-based empire management featuring territory yield collection, town garrison allocation, settlement investments, and besieged province defense.
- **📖 Visual Novel Narrative Scenes**: Dialogue scenes with character portraits, branchable story states, and atmospheric audio triggers.
- **🧪 Sandbox Battle Simulator**: Dedicated testing grounds allowing arbitrary unit placement, balance experiments, and combat scenario debugging.
- **🔊 Dynamic Multi-Channel Audio Engine**: Built on Howler.js with support for randomized sample variations, pitch modulation (anti-ear-fatigue), crossfading BGM tracks, and independent audio channel volume sliders.
- **🛡️ Rock-Solid Typing & Testing**: Complete test suite with 100+ unit and integration tests across game math, state machines, audio pipelines, and UI views.

---

## 🛠️ Tech Stack

- **Core Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/) with `@vitejs/plugin-react`
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with `@tailwindcss/vite`
- **Audio Library**: [Howler.js](https://howlerjs.com/) (`howler` + `@types/howler`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/), [jsdom](https://github.com/jsdom/jsdom)
- **Linting & Code Health**: [Oxlint](https://oxc.rs/), [ts-prune](https://github.com/nadecode/ts-prune)

---

## 📂 Project Directory Structure

```text
react-strike/
├── public/                       # Static public assets
│   ├── audio/                    # 🎵 Game audio files (SFX & BGM)
│   │   ├── bgm/                  # Background music soundtracks
│   │   └── sfx/                  # Sound effects (swords, magic, UI clicks, etc.)
│   ├── favicon.svg               # App favicon
│   └── icons.svg                 # SVG sprite sheet
├── src/
│   ├── components/               # Reusable React UI components & ErrorBoundary
│   ├── context/                  # Global contexts (CampaignContext, SettingsContext)
│   ├── core/                     # Pure TypeScript engine and subsystems
│   │   ├── audio/                # AudioManager singleton (Howler.js engine)
│   │   ├── commands/             # Command pattern implementations
│   │   ├── engine/               # 60 FPS GameEngine, collision & render loops
│   │   ├── entities/             # UnitEntity, Projectiles, and game objects
│   │   ├── events/               # Typed EventBus & combat event payloads
│   │   ├── factories/            # UnitFactory & entity generation
│   │   ├── math/                 # Vector math, spatial boundary clamping
│   │   └── strategies/           # Horde wave spawning algorithms
│   ├── data/                     # Game data, audio manifests, balance configs
│   │   └── audioManifest.ts      # Audio keys, file path registries & sound pools
│   ├── features/                 # Major game domain feature modules
│   │   ├── combat/               # BattleCanvas, PreBattleSetup, CampaignOrchestrator
│   │   ├── logistics/            # EmpireManagement, Garrison allocation
│   │   └── visual_novel/         # StoryScene dialogue & story renderer
│   ├── hooks/                    # Custom React hooks (useAudio, useGameEngine)
│   ├── pages/                    # MainMenu, ModeSelectMenu, SettingsPage
│   ├── tests/                    # Vitest unit & integration test suites
│   ├── types/                    # Domain TypeScript interfaces & types
│   ├── App.tsx                   # Top-level view router & providers
│   ├── index.css                 # Global CSS & Tailwind imports
│   └── main.tsx                  # Application entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher

### Installation

1. Clone or navigate to the repository:
   ```bash
   cd react-strike
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR) |
| `npm run build` | Type-checks with `tsc` and creates an optimized production build in `dist/` |
| `npm run preview` | Locally previews the production build |
| `npm run test` | Runs all Vitest unit and integration tests |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run test:ui` | Opens the Vitest UI visual test runner in your browser |
| `npm run lint` | Runs `oxlint` and checks for unused exports with `ts-prune` |

---

## 🎵 Audio System & Audio Files Guide

Fantasy Strike features a complete audio management pipeline built on **Howler.js**, located in `src/core/audio/AudioManager.ts` and managed via `src/data/audioManifest.ts`.

### Where to Put Audio Files

Audio files are served as static assets from the `public/audio/` directory:

```text
react-strike/public/audio/
├── bgm/                          # Put all background music tracks here
│   ├── menu_theme.mp3
│   ├── campaign_map.mp3
│   ├── combat_action.mp3
│   ├── victory_theme.mp3
│   └── game_over.mp3
└── sfx/                          # Put all sound effects here
    ├── click.mp3
    ├── sword1.mp3
    ├── sword2.mp3
    ├── sword3.mp3
    ├── bow1.mp3
    ├── bow2.mp3
    ├── magic1.mp3
    ├── magic2.mp3
    ├── unit_spawn.mp3
    ├── death1.mp3
    ├── death2.mp3
    ├── victory_fanfare.mp3
    ├── defeat_horn.mp3
    ├── coin.mp3
    ├── levelup.mp3
    └── error.mp3
```

> **Note**: Vite serves everything inside `public/` at the root URL path (e.g. `public/audio/sfx/click.mp3` is accessible at `/audio/sfx/click.mp3`).

### Supported Audio Formats

The audio system supports standard web audio formats:
- **`.mp3`** *(Recommended)*: Excellent balance of fidelity and small file size.
- **`.ogg`**: High quality open-source audio format.
- **`.wav`**: Uncompressed audio (best for short, punchy SFX).

---

### Audio Manifest & Expected Assets

All sound events and music tracks are mapped in `src/data/audioManifest.ts`. The default expected files are:

#### 🎶 Background Music (BGM) (`public/audio/bgm/`)

| BGM Key | Expected Filename | Usage / Trigger Scene |
|---|---|---|
| `bgm_menu` | `menu_theme.mp3` | Main Menu & Mode Selection |
| `bgm_campaign` | `campaign_map.mp3` | Empire Management, Territory Map & Logistics |
| `bgm_battle` | `combat_action.mp3` | Active Canvas Combat & Battle Arena |
| `bgm_victory` | `victory_theme.mp3` | Post-battle victory & Campaign conclusion |
| `bgm_gameover` | `game_over.mp3` | Campaign defeat screen |

#### 🔊 Sound Effects (SFX) (`public/audio/sfx/`)

| SFX Key | Expected Filename(s) | Usage / Trigger Scene |
|---|---|---|
| `button_click` | `click.mp3` | UI button hover / click interactions |
| `sword_strike` | `sword1.mp3`, `sword2.mp3`, `sword3.mp3` *(Randomized pool)* | Melee attack hit on combat canvas |
| `bow_shoot` | `bow1.mp3`, `bow2.mp3` *(Randomized pool)* | Archer unit arrow projectile release |
| `magic_cast` | `magic1.mp3`, `magic2.mp3` *(Randomized pool)* | Mage spell projectile casting |
| `unit_spawn` | `unit_spawn.mp3` | Unit deployed or spawned on grid |
| `unit_death` | `death1.mp3`, `death2.mp3` *(Randomized pool)* | Unit HP reaches 0 and perishes |
| `victory` | `victory_fanfare.mp3` | Battle won fanfare |
| `defeat` | `defeat_horn.mp3` | Battle lost horn |
| `coin_clink` | `coin.mp3` | Purchasing units, spending or earning gold |
| `level_up` | `levelup.mp3` | Upgrading settlements or acquiring perks |
| `error` | `error.mp3` | Invalid formation action or insufficient funds |

---

### Adding New Sound Effects or Music

1. **Copy your audio file** into either:
   - `public/audio/sfx/your_sound.mp3` for sound effects
   - `public/audio/bgm/your_track.mp3` for music tracks

2. **Register the key and path in `src/data/audioManifest.ts`**:
   ```typescript
   // 1. Add key to the type union
   export type SFXKey =
     | 'sword_strike'
     // ...
     | 'shield_block';

   // 2. Add path to the registry (single file or array pool for randomized variations)
   export const SFX_REGISTRY: Record<SFXKey | string, AudioEntry> = {
     // ...
     shield_block: ['/audio/sfx/shield_block1.mp3', '/audio/sfx/shield_block2.mp3'],
   };
   ```

3. **Play the audio in components or engine code**:
   ```typescript
   import { AudioManager } from '../core/audio/AudioManager';

   // Play a sound effect (with automatic pitch variation & pooling)
   AudioManager.getInstance().playSFX('shield_block');

   // Play background music with crossfading
   AudioManager.getInstance().playBGM('bgm_battle', { fadeDurationMs: 800 });
   ```

   Or use the React hook inside UI components:
   ```tsx
   import { useAudio } from '../hooks/useAudio';

   function MyButton() {
     const { playSFX } = useAudio();
     return <button onClick={() => playSFX('button_click')}>Click Me</button>;
   }
   ```

---

### Audio Engine Features

- **Anti-Ear-Fatigue Pitch Variation**: SFX automatically apply a small, natural pitch modulation ($\pm 5\%$) on playback to prevent repetitive sound fatigue during intense battles.
- **Sample Pooling & Randomization**: Multi-file arrays in `SFX_REGISTRY` automatically pick a random sample on each trigger.
- **Smooth BGM Crossfading**: Switching music tracks smoothly fades out the previous track and fades in the new one.
- **Independent Channels & Settings**:
  - Master Volume (`0% - 100%`)
  - BGM Volume (`0% - 100%`)
  - SFX Volume (`0% - 100%`)
  - Character / Dialogue Voice Volume (`0% - 100%`)
  - Per-channel mute toggles

---

## 🏛️ Architecture & Design Principles

1. **Separation of Renderers**:
   - **Canvas Layer (`src/core/engine/`)**: 60 FPS combat simulation, pathfinding, unit AI, and particle rendering. Never stores units in React state.
   - **React DOM Layer (`src/features/`)**: High-level campaign loop, menus, unit roster placement, economy management, and story scenes.
2. **Design Patterns**:
   - **State Pattern**: `CampaignOrchestrator` manages cyclic phase transitions (`empire_management` $\rightarrow$ `battle_select` $\rightarrow$ `pre_battle` $\rightarrow$ `combat`).
   - **Factory Method**: `UnitFactory.createDefender` and `UnitFactory.fromTemplate` ensure centralized entity construction.
   - **Strategy Pattern**: `WaveStrategy` handles modular horde generation (skirmishes, boss waves, endless doom).
   - **Observer Pattern**: `EventBus` provides type-safe communication between the 60 FPS canvas loop and React UI overlays without causing unnecessary re-renders.

---

## 🧪 Testing & Quality Assurance

The project enforces high code quality with automated Vitest suites:

```bash
# Run test suite
npm test
```

### Coverage Areas:
- **Combat Math & Vector Geometry**: Boundary clamping, distance calculation, direction vectors.
- **Entity AI & State Transitions**: Defender hold/engage states, targeting, HP deductions.
- **Empire Economics & Yields**: Turn income calculations, garrison allocations, territory defense math.
- **Audio Manager**: Howler wrapper caching, volume scaling, mute states, fallbacks, and event bus integrations.
- **React UI & Contexts**: Pre-battle formation grids, city overviews, round summaries, and story scenes.

---

## 📄 License

Private project. All rights reserved.
