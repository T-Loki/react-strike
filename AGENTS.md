# Fantasy Strike Development Guidelines

## Engine & Architecture Rules
1. **Separation of Renderers**:
   * HTML5 `<canvas>` handles real-time unit movement, combat math, and 60 FPS sprite drawing via `requestAnimationFrame`.
   * React DOM components handle menus, HUD, wave triggers, and unit shop controls.
   * **Component Decomposition**: Complex views must be strictly divided by responsibility (e.g. `BattleCanvas` is decomposed into `BattleCanvasRenderer` for the canvas and `BattleCanvasOverlay` for the React HUD. `PreBattleSetup` is decomposed into `FormationGrid` and `UnitRosterList`).
2. **State Management**:
   * NEVER store 60 FPS combat unit arrays inside React `useState`. Store combat unit data in pure JavaScript `useRef` arrays to avoid Virtual DOM re-rendering lag.
3. **UI Aesthetics**:
   * Dark fantasy theme using Tailwind CSS (Deep slate backgrounds `bg-slate-950`, gold accents `border-amber-500/50`, glowing hover effects).

## Software Architecture Patterns
1. **Hybrid Layer Separation**:
   * `src/engine/`: Pure TypeScript classes/functions for 60 FPS combat simulation, pathfinding, unit AI, and Canvas rendering. NO React state here.
   * `src/components/`: React DOM components for UI overlays, phase controls, economy management, and meta-menus.
2. **Domain-Driven Organization**:
   * Keep related features grouped in their respective domains (`economy`, `combat`, `miracles`, `metaprogression`).
3. **Type Safety & Data-Driven Design**:
   * All balance numbers (unit stats, territory yields, wave counts) must live in JSON/TS configuration files in `src/data/`, NOT hardcoded inside rendering loops or UI components.
4. **GoF Design Patterns**:
   * **State Pattern**: Used in `CampaignOrchestrator` to map phase transitions using explicit strategy maps instead of inline conditionals.
   * **Strategy Pattern**: Used in `WaveStrategy` for modular horde wave generation (`SkirmishWave`, `MidBossWave`, `EndlessDoomWave`).
   * **Factory Method**: Always use `UnitFactory.createDefender` or `UnitFactory.fromTemplate` to instantiate units; do not manually construct object literals.
   * **Observer Pattern**: `EventBus` typed strictly with `GameEventPayloads` to decouple 60 FPS combat events from React rendering loops.

## Defensive Error Handling
1. **React Error Boundaries**: Wrap all major top-level views (`CampaignOrchestrator`, `BattleCanvas`, `EmpireManagement`, `SandboxCanvas`) within `<ErrorBoundary>` components to degrade gracefully instead of white-screening on crashes.
2. **Combat Math Guards**: Ensure operations producing potentially dangerous states (`NaN`, `Infinity`) such as vector distance and `dx/dist` division are protected via checks or defaults (e.g., `dist === 0` defaults, using `getDirection` shared util).

## Domain Segregation & Campaign Loop Guidelines
1. **Three Core Pillars**: The codebase is split into `combat` (Canvas Auto-Battler), `logistics` (React DOM Economy), and `visual_novel` (Story Dialogue). Never mix VN state with Combat canvas logic.
2. **The Last-Stand Loop**: Campaign logic must adhere to this cyclic state machine:
   * `empire_management`: Global phase (Allocate units, build/upgrade, abandon towns).
   * `battle_select`: Map phase (Choose which besieged territory to resolve next).
   * `pre_battle`: Local phase (Place allocated units on the local defensive grid).
   * `combat`: Execution phase (60 FPS Canvas Auto-Battler).
   * *Loop Condition*: Return to `battle_select` if battles remain; otherwise, return to `empire_management`.
3. **State Management**: `CampaignContext.tsx` is the absolute single source of truth for the cyclic loop and macro state. UI components must strictly update Context and never interact directly with the `GameEngine`'s 60FPS physics layers (which handles its own memory space).

## Battlefield Geometry & 60 FPS Unit Tracking Rules
1. **3-Section Spatial Layout Boundaries**:
   * **Player Area** ($x \in [0, 0.35 \times \text{canvasWidth}]$): Friendly units spawn, hold position, and intercept breached enemies here. Friendly units are strictly clamped to $x \le 0.35 \times \text{canvasWidth}$.
   * **Neutral Area** ($x \in [0.35 \times \text{canvasWidth}, 0.75 \times \text{canvasWidth}]$): No-man's land where enemy horde units advance. Defenders cannot enter under any circumstances.
   * **Horde Spawn Zone** ($x \in [0.75 \times \text{canvasWidth}, \text{canvasWidth}]$): Horde units spawn on the right and march left towards the player core.
2. **Defender Engagement Triggers**:
   * Friendly defenders remain in `DefenderHoldState` inside the Player Area by default.
   * When a Horde unit breaches the 35% boundary ($x \le 0.35 \times \text{canvasWidth}$), defenders switch to `DefenderEngageState`, acquiring the breached enemy as a target to intercept.
3. **Unmanaged Canvas State**:
   * Engine update and rendering loop run strictly via `requestAnimationFrame` inside `GameEngine` and `BattleCanvas.tsx` to maintain 60 FPS performance without triggering React state re-renders for unit movements, attack flashes, or floating damage numbers.

## UI Layout & View Boundary Guidelines
1. **Fixed Viewport Shell**: The root `App.tsx` must be constrained to `h-screen w-screen overflow-hidden`.
2. **Page-Level Scrolling**: Full-page views (`EmpireManagement`, `PreBattleSetup`, etc.) must use a `flex flex-col h-full` layout where the top header is `flex-shrink-0` and the main body container is `flex-1 overflow-y-auto`. Never apply isolated `overflow-y-auto` to tiny child components if the page itself clips off-screen.
3. **Sandbox Testing Bridge**: Any unit formation placed in `PreBattleSetup` must be testable inside `SandboxCanvas.tsx` via `activeBattleTerritoryId`.

## Automated Testing & Regression Safety Rules
1. **Mandatory Test Verification**: Every new feature or balance tweak MUST pass the Vitest suite (`npm run test`).
2. **Context & Math Test Protection**: Any changes to `CampaignContext.tsx`, `updateFrontlines()`, or combat formulas require updating or adding corresponding unit tests in `src/tests/`.
3. **Zero-Regression Bar**: Never mark a task as complete if `npm run test` reports failing assertions.

## Strict Typing Rules
1. **The 'any' Purge**: The use of explicit or implicit `any` types is strictly forbidden across the codebase.
2. **Domain Interfaces**: Use strict interfaces for all component props, state objects, and combat payload structures. This is critical for preventing cross-domain pollution (e.g. leaking React DOM data into Canvas memory).