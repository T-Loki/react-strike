# Fantasy Strike Development Guidelines

## Engine & Architecture Rules
1. **Separation of Renderers**:
   * HTML5 `<canvas>` handles real-time unit movement, combat math, and 60 FPS sprite drawing via `requestAnimationFrame`.
   * React DOM components handle menus, HUD, wave triggers, and unit shop controls.
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

## Domain Segregation & Campaign Loop Guidelines
1. **Three Core Pillars**: The codebase is split into `combat` (Canvas Auto-Battler), `logistics` (React DOM Economy), and `visual_novel` (Story Dialogue). Never mix VN state with Combat canvas logic.
2. **The Last-Stand Loop**: Campaign logic must adhere to this cyclic state machine:
   * `empire_management`: Global phase (Allocate units, build/upgrade, abandon towns).
   * `battle_select`: Map phase (Choose which besieged territory to resolve next).
   * `pre_battle`: Local phase (Place allocated units on the local defensive grid).
   * `combat`: Execution phase (60 FPS Canvas Auto-Battler).
   * *Loop Condition*: Return to `battle_select` if battles remain; otherwise, return to `empire_management`.

## Testing Guidelines
1. **Sandbox QA**: New combat mechanics must be manually testable in `SandboxCanvas.tsx`.
2. **Automated Verification**: Run `npx vitest run` before finalizing tasks to ensure zero mathematical regressions.
