# Proof-of-Pipeline Sliver: Arena Battle Prototype Spec

> An agent-executable specification for building a working Arena Battle prototype. Three Claude Code agents — Tech Lead, Game Designer, Backend Engineer — execute this spec independently to produce a playable game that proves the data-first art pipeline.

**Date:** 2026-02-21

**Status:** Draft

**Proves:** Phaser 3.88 + Claude Code SVGs + jsfxr sounds + architectural separation = playable game from data alone.

---

## 1. What This Sliver Is

One complete battle. Player vs. one AI opponent. Five hardcoded JEE Physics (Thermodynamics) questions. Correct answer = player attacks. Wrong answer = opponent attacks. Health bars, SVG characters, tween animations, jsfxr sounds. Runs locally via `npm run dev`.

### What's In

- 5 hardcoded MCQs (real JEE Thermodynamics questions)
- 1 player character, 1 opponent character (SVG, Claude Code generated)
- Health bars, question panel, answer buttons
- jsfxr sound effects (7 sounds)
- Tween-based animations from JSON spec
- Victory screen with score, defeat screen with explanations
- CSS gradient background (no AI-generated art)
- Full `state/` / `systems/` / `rendering/` / `events/` separation

### What's Cut

- No backend, auth, API, database, or Supabase
- No FSRS, IRT, or adaptive difficulty
- No multiple opponents or stage selection
- No Nano Banana Pro backgrounds
- No Vercel deploy, PWA manifest, or Capacitor
- No external AI art tools (PixelLab, Scenario)
- No Hindi or regional language support
- No combo multipliers or streak mechanics

---

## 2. The State Machine

Five states. Fixed damage model: 20 HP per hit, 100 HP total, 5 questions.

```
BATTLE_INTRO
  → show both characters, health bars at 100%
  → play battleStart sound
  → auto-transition after 1.5s → QUESTION_DISPLAY

QUESTION_DISPLAY
  → show question text + 4 answer buttons (slide-in animation)
  → enable input, wait for player tap
  → on answer selected → ANSWER_RESOLVE

ANSWER_RESOLVE
  → if correct:
      emit ANSWER_CORRECT
      emit ATTACK_PLAYER (player attacks opponent)
      opponent HP -= 20
      emit HP_CHANGED
      play correct sound, then attackHit sound
  → if wrong:
      emit ANSWER_WRONG
      emit ATTACK_OPPONENT (opponent attacks player)
      player HP -= 20
      emit HP_CHANGED
      play wrong sound, then attackHit sound
      emit SHOW_EXPLANATION (display for 1.5s)
  → then check end conditions (in this order):
      → if opponent HP ≤ 0 → VICTORY
      → if player HP ≤ 0 → DEFEAT
      → if currentQuestionIndex ≥ 5 (all questions exhausted):
          → if player HP > opponent HP → VICTORY
          → else → DEFEAT  (opponent HP > player HP; ties impossible with even damage)
      → else → QUESTION_DISPLAY (next question)

VICTORY
  → emit VICTORY event
  → play victory sound
  → show score (X/5 correct), time taken
  → "Play Again" button → BATTLE_INTRO (full reset)

DEFEAT
  → emit DEFEAT event
  → play defeat sound
  → show missed questions with explanations
  → "Try Again" button → BATTLE_INTRO (full reset)
```

**Damage math:** 3 correct + 2 wrong → opponent at 40 HP, player at 60 HP. Neither HP is ≤ 0, but all 5 questions are exhausted, so the "all questions exhausted" check fires: player HP (60) > opponent HP (40) → VICTORY. A draw is impossible with symmetric 20 HP damage. The outcome is always decisive.

---

## 3. Folder Structure

```
arena-battle/
  package.json              ← Phaser 3.88, TypeScript, Vite, jsfxr
  tsconfig.json
  vite.config.ts
  index.html
  CLAUDE.md                 ← architectural constraints (Phase 0 deliverable)
  public/                   ← Vite serves this statically (no hashing)
    assets/
      characters/
        player/
          player-idle.svg
          player-attack.svg
          player-hit.svg
          player-victory.svg
        opponent/
          opponent-idle.svg
          opponent-attack.svg
          opponent-hit.svg
      sounds/
        sound-params.json   ← jsfxr parameter arrays
      ui/
        health-bar-frame.svg
        button-normal.svg
        button-correct.svg
        button-wrong.svg
      animations/
        animation-spec.json ← tween definitions
  src/
    main.ts                 ← Phaser game config, boots BootScene
    types.ts                ← all shared TypeScript interfaces
    state/
      BattleState.ts        ← pure data, no Phaser imports
      QuestionBank.ts       ← 10 hardcoded MCQs, returns random 5
    systems/
      BattleSystem.ts       ← state transitions, damage calc, win/loss
    events/
      EventBus.ts           ← typed pub/sub, no Phaser dependency
      GameEvents.ts         ← event type enum and payload interfaces
    rendering/
      BootScene.ts          ← asset loading, jsfxr init
      BattleScene.ts        ← main battle view, subscribes to events
      VictoryScene.ts       ← win screen with score
      DefeatScene.ts        ← loss screen with missed questions
      SoundManager.ts       ← jsfxr audio wrapper, event-driven
      AnimationRunner.ts    ← JSON-to-tween translator
```

**Why `public/` not `src/`:** Vite transforms and hashes files inside `src/` during bundling. Phaser loads assets at runtime via string paths (`this.load.svg('player-idle', 'assets/characters/player/player-idle.svg')`). If the SVG lives in `src/`, the hashed filename won't match the string path and the load will 404. Vite serves `public/` as static files at the root — no hashing, no transforms. The path `'assets/characters/player/player-idle.svg'` resolves correctly at runtime.

**The rule:** Files in `state/` and `systems/` and `events/` never import from Phaser. Files in `rendering/` never assign to `BattleState` properties. The event bus is the only bridge.

---

## 4. TypeScript Interfaces

All interfaces live in `src/types.ts`. This is the contract all three agents code against.

```typescript
// ─── MCQ (simplified from full design doc) ───────────────────────
export interface MCQ {
  id: string;
  subject: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

// ─── Character State (pure data) ─────────────────────────────────
export interface CharacterState {
  name: string;
  hp: number;
  maxHp: number;
  isPlayer: boolean;
}

// ─── Battle State (single source of truth) ───────────────────────
export type BattlePhase =
  | 'BATTLE_INTRO'
  | 'QUESTION_DISPLAY'
  | 'ANSWER_RESOLVE'
  | 'VICTORY'
  | 'DEFEAT';

export interface PlayerAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

export interface BattleState {
  phase: BattlePhase;
  player: CharacterState;
  opponent: CharacterState;
  currentQuestionIndex: number;
  questions: MCQ[];
  answers: PlayerAnswer[];
  score: number;
}

// ─── Event System (discriminated union — strict payloads) ────────
// Every event has an exact payload shape. TypeScript will catch any
// agent that reads payload.damage when the field is payload.newHp.
// This is the contract enforcement mechanism — the compiler is the
// architectural police.

export type GameEvent =
  | { type: 'BATTLE_START' }
  | { type: 'QUESTION_SHOW'; payload: { question: MCQ; questionIndex: number } }
  | { type: 'ANSWER_CORRECT'; payload: { questionId: string; selectedIndex: number } }
  | { type: 'ANSWER_WRONG'; payload: { questionId: string; selectedIndex: number; correctIndex: number } }
  | { type: 'ATTACK_PLAYER' }
  | { type: 'ATTACK_OPPONENT' }
  | { type: 'HP_CHANGED'; payload: { character: 'player' | 'opponent'; newHp: number; maxHp: number } }
  | { type: 'SHOW_EXPLANATION'; payload: { explanation: string; correctIndex: number } }
  | { type: 'VICTORY'; payload: { score: number; totalQuestions: number } }
  | { type: 'DEFEAT'; payload: { score: number; totalQuestions: number; missed: PlayerAnswer[] } };

// Extract the type string for use in EventBus generics
export type GameEventType = GameEvent['type'];

// ─── Animation Spec (JSON schema) ────────────────────────────────
export interface AnimationStep {
  property: string;       // "x", "y", "alpha", "angle", "scaleX", "scaleY"
  to?: number;
  from?: number;
  delta?: number;         // relative movement (use instead of to/from)
  duration: number;       // milliseconds
  ease: string;           // Phaser easing name: "quad.out", "back.out", etc.
}

export interface AnimationDef {
  steps: AnimationStep[];
  repeat?: number;        // number of times to repeat the full sequence
}

export interface AnimationSpec {
  playerAttack: AnimationDef;
  opponentAttack: AnimationDef;
  takeHit: AnimationDef;
  questionSlideIn: AnimationDef;
  healthBarDecrease: {
    property: string;
    duration: number;
    ease: string;
  };
}

// ─── Sound Parameters ────────────────────────────────────────────
export interface SoundParams {
  correct: number[];      // jsfxr parameter array
  wrong: number[];
  attackHit: number[];
  victory: number[];
  defeat: number[];
  buttonTap: number[];
  battleStart: number[];
}

// ─── Visual Identity ─────────────────────────────────────────────
export interface VisualIdentity {
  palette: {
    primary: string;      // character accent / attack effects
    secondary: string;    // dark base / backgrounds
    light: string;        // text / highlights
    accent1: string;      // UI elements
    accent2: string;      // health bars / secondary UI
  };
  characters: {
    height: number;       // pixels
    lineWeight: number;
    style: string;        // "flat-geometric"
  };
  ui: {
    minTouchTarget: number;  // pixels
    fontFamily: string;
    healthBarWidth: number;
    healthBarHeight: number;
  };
  timing: {
    introDelay: number;          // ms before auto-transition
    explanationDisplay: number;  // ms to show correct answer
    interQuestionDelay: number;  // ms between questions
  };
}
```

---

## 5. JSON Schemas

### Animation Spec (`public/assets/animations/animation-spec.json`)

```json
{
  "playerAttack": {
    "steps": [
      { "property": "x", "delta": 80, "duration": 200, "ease": "quad.out" },
      { "property": "x", "delta": -80, "duration": 150, "ease": "quad.in" }
    ]
  },
  "opponentAttack": {
    "steps": [
      { "property": "x", "delta": -80, "duration": 200, "ease": "quad.out" },
      { "property": "x", "delta": 80, "duration": 150, "ease": "quad.in" }
    ]
  },
  "takeHit": {
    "steps": [
      { "property": "alpha", "to": 0.3, "duration": 80, "ease": "linear" },
      { "property": "alpha", "to": 1, "duration": 80, "ease": "linear" }
    ],
    "repeat": 2
  },
  "questionSlideIn": {
    "steps": [
      { "property": "y", "from": 600, "to": 400, "duration": 300, "ease": "back.out" }
    ]
  },
  "healthBarDecrease": {
    "property": "scaleX",
    "duration": 400,
    "ease": "cubic.out"
  }
}
```

### Sound Parameters (`public/assets/sounds/sound-params.json`)

Each entry is a jsfxr parameter array. Values are tuned interactively at sfxr.me, then exported.

```json
{
  "correct":     [2, , 0.2, , 0.3, 0.5, , , , , , , , , , , , , 1, , , , , 0.5],
  "wrong":       [3, , 0.3, , 0.2, 0.2, , , , , , , , , , 0.4, , , 1, , , , , 0.5],
  "attackHit":   [3, , 0.1, , 0.1, 0.3, , 0.4, , , , , , , , , , , 1, , , , , 0.5],
  "victory":     [2, , 0.2, 0.2, 0.4, 0.5, , , , , , , , 0.1, , , , , 1, , , 0.1, , 0.5],
  "defeat":      [3, , 0.4, 0.2, 0.3, 0.2, , , , , , , , , , , , , 1, , , , , 0.5],
  "buttonTap":   [0, , 0.05, , 0.1, 0.5, , , , , , , , , , , , , 1, , , , , 0.5],
  "battleStart": [2, , 0.3, 0.3, 0.5, 0.4, , 0.1, , , , , , , , , , , 1, , , , , 0.5]
}
```

**Note:** These are starting values generated via jsfxr presets. The Backend Engineer's SoundManager reads whatever values are in this file — no code changes needed when sounds change.

**Audio tuning requires a human.** Claude Code cannot hear audio output. The jsfxr parameter arrays are non-intuitive floating-point values — asking an LLM to "make the attack sound punchier" will produce guesses that likely sound like static noise or silence. During Phase 3 (Polish), a human Game Designer uses the visual interface at [sfxr.me](https://sfxr.me) to interactively design sounds, then pastes the exported parameter arrays into this JSON file. The *pipeline* is data-driven (change JSON → game changes), but the *tuning* is human-driven.

---

## 6. Three Agent Roles — Deliverables and Boundaries

### 6.1 Tech Lead Agent

**Mission:** Build the skeleton and contracts. Every data structure, every interface, every state transition. Own everything *except* rendering and visual design.

#### Deliverables

| ID | File | Description |
|----|------|-------------|
| T1 | `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` | Project scaffold: **Phaser 3.88** (latest stable — NOT Phaser 4 beta), TypeScript strict, Vite dev server. This sliver tests the architecture pipeline, not the AI's ability to guess beta APIs. |
| T2 | `src/types.ts` | All TypeScript interfaces from Section 4 of this spec |
| T3 | `src/events/EventBus.ts`, `src/events/GameEvents.ts` | Typed event emitter with `on<T extends GameEventType>(type: T, callback)`, `off()`, `emit()`. The `emit` and `on` signatures must be generic over the discriminated `GameEvent` union so that TypeScript enforces correct payload shapes at every call site. Zero Phaser dependencies. |
| T4 | `src/state/BattleState.ts` | Pure data class. Initializes player HP=100, opponent HP=100, phase=BATTLE_INTRO. Read-only getters. No Phaser imports. |
| T5 | `src/systems/BattleSystem.ts` | State machine implementation: `startBattle()`, `showNextQuestion()`, `submitAnswer(selectedIndex: number)`, `restart()`. Emits events via EventBus. Imports NOTHING from Phaser. **Critical:** `submitAnswer` must check end conditions in order: (1) opponent HP ≤ 0 → VICTORY, (2) player HP ≤ 0 → DEFEAT, (3) all questions exhausted → compare HP → VICTORY or DEFEAT, (4) else → next question. See Section 2 state machine. |
| T6 | `src/state/QuestionBank.ts` | 10 hardcoded real JEE Physics Thermodynamics MCQs. `getQuestions(count: number): MCQ[]` returns a random subset. |
| T7 | `CLAUDE.md` | Project-level architectural constraints (see Phase 0) |
| T8 | `src/main.ts` | Phaser game config — this is the ONE file where Tech Lead touches Phaser, only to configure the game instance and declare scenes |

#### Verification

- `npm run build` completes with zero errors
- `grep -r "Phaser" src/state/ src/systems/ src/events/` returns zero matches
- BattleSystem can be unit-tested without a browser (import it in Node, call methods, check state transitions)

#### Must NOT

- Write any Phaser scene code (no files in `rendering/`)
- Choose colors, fonts, or animation timings
- Optimize for performance
- Add any backend, API, or database code
- Add any build pipeline beyond Vite dev server

---

### 6.2 Game Designer Agent

**Mission:** Define the visual identity and produce all creative assets as data files. Every color, every dimension, every timing value, every sound, every character. Output is JSON and SVG — never TypeScript.

#### Deliverables

| ID | File(s) | Description |
|----|---------|-------------|
| G1 | Visual identity section in `CLAUDE.md` | Palette: `#E63946` (primary/fire), `#1D3557` (dark base), `#F1FAEE` (light/text), `#457B9D` (accent/UI), `#A8DADC` (health/secondary). Character height: 128px. Line weight: 2px. Style: bold flat geometric. Min touch target: 48px. Font: system sans-serif. Timing table: intro 1500ms, explanation 1500ms, inter-question 500ms. Easing defaults. |
| G2 | `public/assets/characters/player/player-idle.svg`, `player-attack.svg`, `player-hit.svg`, `player-victory.svg` | Player character SVGs. Faces right. Named SVG groups for body parts (`<g id="body">`, `<g id="weapon">`, etc.). **Keep shapes extremely primitive** — rectangles, circles, triangles. The goal is well-formed XML with named groups that the animation system can target, not visual polish. Expect "programmer art" quality. Uses only palette colors. |
| G3 | `public/assets/characters/opponent/opponent-idle.svg`, `opponent-attack.svg`, `opponent-hit.svg` | Opponent character SVGs. Faces left. Different palette variant (proves parameter variation). Same primitive-shape conventions as player. **The pipeline proof is that changing palette hex codes produces a visibly different opponent — not that the characters look like professional game art.** |
| G4 | `public/assets/ui/health-bar-frame.svg`, `button-normal.svg`, `button-correct.svg`, `button-wrong.svg` | UI element SVGs. Health bar frame at specified dimensions. Buttons at 48px minimum touch target. |
| G5 | `public/assets/sounds/sound-params.json` | 7 jsfxr parameter arrays (correct, wrong, attackHit, victory, defeat, buttonTap, battleStart). **Starting values use jsfxr presets** (e.g., `pickupCoin` for correct, `hitHurt` for attackHit) — do NOT attempt to "design" sounds from scratch. Phase 3 tuning requires a human at sfxr.me. |
| G6 | `public/assets/animations/animation-spec.json` | Animation definitions per Section 5. All tween values (duration, easing, displacement) specified here. |

#### Verification

- All SVGs validate (well-formed XML)
- All SVGs use only declared palette colors (grep for hex codes)
- `sound-params.json` and `animation-spec.json` parse as valid JSON matching the TypeScript interfaces
- No `.ts` files authored or modified by this agent

#### Must NOT

- Write TypeScript code
- Make decisions about state machine transitions
- Create raster images (PNG/JPG) — SVG only for this sliver
- Design a title screen, menu, or any UI beyond battle/victory/defeat
- Use any external AI art tool (Nano Banana Pro, PixelLab, Scenario) — Claude Code SVG generation only

---

### 6.3 Backend Engineer Agent

**Mission:** Wire everything together into a playable game. Build Phaser scenes that subscribe to the event bus, render state, play sounds, and run animations. Read state — never write it (except through `BattleSystem.submitAnswer()`).

#### Deliverables

| ID | File | Description |
|----|------|-------------|
| B1 | `src/rendering/BootScene.ts` | Loads all SVGs via `this.load.svg()` using paths relative to root (e.g., `'assets/characters/player/player-idle.svg'` — Vite serves `public/` at root). Generates jsfxr AudioBuffers from `sound-params.json`. Parses `animation-spec.json`. Transitions to BattleScene when complete. |
| B2 | `src/rendering/SoundManager.ts` | jsfxr wrapper. Subscribes to EventBus: `ANSWER_CORRECT→correct`, `ANSWER_WRONG→wrong`, `ATTACK_PLAYER→attackHit`, `ATTACK_OPPONENT→attackHit`, `VICTORY→victory`, `DEFEAT→defeat`, `BATTLE_START→battleStart`. All sound params come from JSON — no hardcoded values. |
| B3 | `src/rendering/BattleScene.ts` | Main scene. Places characters, health bars, question panel, 4 answer buttons. Subscribes to ALL game events. Answer button `onClick` calls `BattleSystem.submitAnswer(index)` — the ONE place where rendering calls into systems. Updates visuals in response to events (HP_CHANGED → tween health bar, ATTACK_PLAYER → run playerAttack animation, etc.). |
| B4 | `src/rendering/VictoryScene.ts` | Score display (X/5 correct). "Play Again" button calls `BattleSystem.restart()` and transitions back to BattleScene. |
| B5 | `src/rendering/DefeatScene.ts` | Shows missed questions with explanations (reads from `BattleState.answers` and `BattleState.questions`). "Try Again" button calls `BattleSystem.restart()` and transitions back to BattleScene. |
| B6 | `src/rendering/AnimationRunner.ts` | `runAnimation(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, animationKey: string): Promise<void>`. Reads `animation-spec.json`, translates steps to Phaser tweens, returns Promise for sequencing. |

#### Verification

- No file in `rendering/` directly assigns to any `BattleState` property (except via `BattleSystem` method calls)
- All animation values come from `animation-spec.json` — no hardcoded tween parameters in `.ts` files
- All sound parameters come from `sound-params.json` — no hardcoded jsfxr values in `.ts` files
- `BattleSystem.submitAnswer()` is the only system method called from rendering code

#### Must NOT

- Modify `BattleState.ts`, `BattleSystem.ts`, `EventBus.ts`, or `QuestionBank.ts` (consume only, never author)
- Choose visual design values (all come from Game Designer's data files)
- Hardcode animation parameters or sound parameters
- Add any game logic (win/loss conditions, damage calculations)
- Build any networking, storage, or API integration

---

## 7. Phased Execution

### Phase 0: Contracts (Sequential — all three agents align)

**Goal:** Establish the shared foundation before any parallel work begins.

| Step | Agent | Deliverable | Depends On |
|------|-------|-------------|------------|
| 0.1 | Tech Lead | `CLAUDE.md` with architectural constraints | Nothing |
| 0.2 | Tech Lead | `src/types.ts` with all interfaces | 0.1 |
| 0.3 | Game Designer | Visual identity section in `CLAUDE.md` | 0.1 |
| 0.4 | Tech Lead | `package.json` + scaffold (npm install works) | 0.2 |

**Phase 0 gate:** All three agents review `types.ts` and `CLAUDE.md`. No one proceeds until the contracts are agreed.

### Phase 1: Parallel Build (Independent — no cross-agent dependencies)

Each agent works against the contracts from Phase 0. No coordination needed.

| Agent | Builds | Reads | Writes |
|-------|--------|-------|--------|
| Tech Lead | T3, T4, T5, T6, T8 | `types.ts` | `src/state/`, `src/systems/`, `src/events/`, `src/main.ts` |
| Game Designer | G2, G3, G4, G5, G6 | `CLAUDE.md` visual identity, `types.ts` interfaces | `public/assets/` |
| Backend Engineer | B1, B2, B3, B4, B5, B6 | `types.ts`, `CLAUDE.md` | `src/rendering/` |

**The Backend Engineer can start immediately** with placeholder rectangles and `console.log` event stubs, coding against the EventBus interface contract. Real assets and real state machine arrive via git merge — no waiting.

### Phase 2: Integration (Backend Engineer leads)

| Step | Action | Agent |
|------|--------|-------|
| 2.1 | Merge all Phase 1 branches | Tech Lead |
| 2.2 | Resolve any import/path issues | Backend Engineer |
| 2.3 | Wire real SVGs into BootScene loaders | Backend Engineer |
| 2.4 | Wire real sound params into SoundManager | Backend Engineer |
| 2.5 | Wire real animation spec into AnimationRunner | Backend Engineer |
| 2.6 | `npm run dev` — game launches, full battle plays through | All verify |

### Phase 3: Polish (Game Designer leads, zero code changes)

| Action | Who | How |
|--------|-----|-----|
| Tweak attack animation speed | Game Designer | Edit `duration` in `animation-spec.json` |
| Adjust sound tone | Game Designer (human) | Design sounds at sfxr.me visual interface → export parameter array → paste into `sound-params.json`. This step requires a human — LLMs cannot hear audio output. |
| Change color accent | Game Designer | Edit palette in `CLAUDE.md`, regenerate SVGs |
| Adjust explanation display time | Game Designer | Edit `timing.explanationDisplay` in visual identity |

**The proof:** Every polish change is a data edit. No `.ts` file is modified. If the game changes correctly, the pipeline works.

---

## 8. Dependency Graph

```
Phase 0 (sequential)
  ├─ T7: CLAUDE.md ──────────────────────────┐
  ├─ T2: types.ts ───────────────────────────┤
  └─ G1: Visual identity in CLAUDE.md ───────┤
                                              │
Phase 1 (parallel) ──────────────────────────┤
  ├─ Tech Lead: T3→T4→T5→T6→T8 (sequential) │
  │    T3: EventBus                           │
  │    T4: BattleState (uses EventBus)        │
  │    T5: BattleSystem (uses State+Events)   │
  │    T6: QuestionBank                       │
  │    T8: main.ts (Phaser config)            │
  │                                           │
  ├─ Game Designer: G2→G3→G4→G5→G6 (any order)
  │    G2: Player SVGs                        │
  │    G3: Opponent SVGs                      │
  │    G4: UI SVGs                            │
  │    G5: Sound params JSON                  │
  │    G6: Animation spec JSON                │
  │                                           │
  └─ Backend Engineer: B6→B2→B1→B3→B4→B5     │
       B6: AnimationRunner (needs anim types) │
       B2: SoundManager (needs event types)   │
       B1: BootScene (needs asset file paths) │
       B3: BattleScene (needs everything)     │
       B4: VictoryScene                       │
       B5: DefeatScene                        │
                                              │
Phase 2 (sequential) ────────────────────────┘
  merge → wire real assets → verify launch

Phase 3 (Game Designer only)
  tweak JSON values → reload → feel test → repeat
```

---

## 9. CLAUDE.md Template (Phase 0 Deliverable)

The `arena-battle/CLAUDE.md` file that the Tech Lead writes in Phase 0:

```markdown
# Arena Battle — Proof-of-Pipeline Sliver

## Architecture Rules (Non-Negotiable)

1. Files in `src/state/` and `src/systems/` NEVER import from Phaser
2. Files in `src/rendering/` NEVER directly modify BattleState properties
3. All state→rendering communication flows through EventBus
4. All animation values come from `public/assets/animations/animation-spec.json`
5. All sound parameters come from `public/assets/sounds/sound-params.json`
6. All visual design values (colors, dimensions, timing) come from the Visual Identity below

Violations of rules 1-3 are bugs — same priority as crashes.

## Visual Identity

- **Palette:**
  - Primary (fire/attack): #E63946
  - Dark base: #1D3557
  - Light (text/highlights): #F1FAEE
  - Accent (UI): #457B9D
  - Secondary (health): #A8DADC
- **Background:** CSS linear gradient from #1D3557 to #0D1B2A (no image)
- **Characters:** 128px height, 2px line weight, bold flat geometric style
- **Touch targets:** minimum 48px
- **Font:** system sans-serif stack
- **Timing:**
  - Battle intro delay: 1500ms
  - Explanation display: 1500ms
  - Inter-question delay: 500ms

## File Ownership

| Folder | Owner | Rule |
|--------|-------|------|
| `src/state/` | Tech Lead | Pure data. No Phaser. |
| `src/systems/` | Tech Lead | Logic only. No Phaser. |
| `src/events/` | Tech Lead | Typed pub/sub. No Phaser. |
| `src/rendering/` | Backend Engineer | Reads state, never writes. |
| `public/assets/` | Game Designer | JSON + SVG data files only. Served statically by Vite. |
| `src/types.ts` | Tech Lead | Shared contract. |
| `src/main.ts` | Tech Lead | Phaser config only. |
```

---

## 10. Hardcoded Question Bank

Ten real JEE Physics (Thermodynamics) MCQs for `QuestionBank.ts`. The `getQuestions(5)` method returns a random subset of 5 per battle.

**Sourced from:** NCERT Class 11 Physics, Chapter 12 (Thermodynamics) — standard JEE syllabus.

Topics covered: First Law, Second Law, isothermal/adiabatic processes, Carnot engine, heat capacity, work done by gas.

The Tech Lead writes these as a TypeScript array of `MCQ` objects with:
- Real physics questions at Bloom's Level 2-3 (Understanding/Application)
- Four plausible options per question (no obviously wrong distractors)
- Correct index randomized across 0-3
- Concise explanation for each correct answer

---

## 11. Risks and Fallbacks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| jsfxr npm package stale or incompatible | Low | Vendor the raw jsfxr function from sfxr.me directly (single MIT-licensed JS file). |
| SVG loading in Phaser 3.88 is slow or glitchy | Medium | Pre-render to PNG via Puppeteer as a build step. Add `scripts/render-svgs.ts` to package.json. |
| Claude Code SVGs look like "programmer art" | High (expected) | This is acceptable. The pipeline proof requires well-formed SVGs with named `<g>` groups that the tween system can target — not visual polish. Constrain to primitive shapes (rects, circles, triangles) to ensure valid XML. Visual quality improves in later slivers. |
| Claude Code guesses wrong jsfxr parameters | High | Starting values come from jsfxr presets (pickupCoin, hitHurt, etc.), not from Claude "designing" sounds. All tuning happens via a human at sfxr.me during Phase 3. The pipeline proof is that changing JSON changes the sound — not that the AI can compose audio. |
| Backend Engineer struggles with Phaser tween API | Low | AnimationRunner abstraction isolates all tween complexity to one file (B6). |

**Resolved risks (decisions already made):**
- ~~Phaser 4 beta API instability~~ → Locked to **Phaser 3.88** (latest stable). Claude's training data covers Phaser 3 thoroughly. Phaser 4 migration is a future sliver concern.

---

## 12. Verification Criteria

### Functional Tests (10 pass/fail)

| # | Test | Pass Criteria |
|---|------|---------------|
| F1 | Launch | `npm run dev` opens the game in browser with no console errors |
| F2 | Battle intro | Two characters visible on screen, health bars at 100%, battleStart sound plays |
| F3 | Question display | Question text and 4 answer buttons appear with slide-in animation |
| F4 | Correct answer | Tapped button flashes green, player character attacks (tween), opponent health bar decreases, correct + attackHit sounds play |
| F5 | Wrong answer | Tapped button flashes red, correct answer highlighted, opponent attacks player, player health bar decreases, wrong + attackHit sounds play, explanation appears for 1.5s |
| F6 | Victory | After majority correct, victory screen shows score (X/5) and victory sound plays |
| F7 | Defeat | After majority wrong, defeat screen shows missed questions with explanations and defeat sound plays |
| F8 | Restart | "Play Again" / "Try Again" fully resets the battle — new random 5 questions, both HPs at 100 |
| F9 | Five questions | Exactly 5 questions are asked per battle, no more, no less |
| F10 | Sound | At least 5 distinct sounds play at appropriate moments during a full battle |

### Architectural Tests (6 tests)

| # | Test | Pass Criteria |
|---|------|---------------|
| A1 | State isolation | `grep -r "Phaser" src/state/ src/systems/ src/events/` returns zero matches |
| A2 | Rendering read-only | No file in `src/rendering/` directly assigns to any `BattleState` property (only calls `BattleSystem` methods) |
| A3 | Event bus bridge | All communication from state changes to rendering updates flows through EventBus — no direct function calls from systems to rendering |
| A4 | Data-driven animations | No hardcoded tween values (duration, displacement, easing) in any `.ts` file — all come from `animation-spec.json` |
| A5 | Data-driven sound | No hardcoded jsfxr parameters in any `.ts` file — all come from `sound-params.json` |
| A6 | SVG asset pipeline | All character and UI art is SVG, generated by Claude Code, version-controlled as text files in `public/assets/` |

### Pipeline Proof Tests (4 tests — the actual proof)

These are the tests that validate the thesis. If all four pass, the data-first pipeline works.

| # | Test | Procedure | Pass Criteria |
|---|------|-----------|---------------|
| P1 | Change palette | Edit hex codes in visual identity → regenerate SVGs with Claude Code → reload | Game characters appear in new colors. Zero `.ts` files changed. |
| P2 | Change timing | Edit a `duration` value in `animation-spec.json` → reload | Animation plays at new speed. Zero `.ts` files changed. |
| P3 | Change sound | Edit a parameter in `sound-params.json` → reload | Sound is audibly different. Zero `.ts` files changed. |
| P4 | Change questions | Swap a question object in `QuestionBank.ts` → reload | New question appears in battle. Zero rendering code changed. |

---

## 13. The Hypothesis

> **Can three agents, working independently against shared contracts, produce a playable game where all visual identity — characters, animations, sounds, timing — is driven by data files, not code?**

If verification passes:
- The data-first art pipeline works for Arena Battle
- The architectural separation (state/systems/events/rendering) holds under real game conditions
- The team's agentic workflow can produce a real game, not just documents about games
- The next sliver can confidently build on this foundation

If verification fails:
- We know exactly which assumption broke (functional? architectural? pipeline?)
- We fix the contracts or the pipeline approach before investing in a larger sliver
- The cost of failure is one prototype — not a full product

---

## Appendix: What Comes After This Sliver

This sliver proves the pipeline. It does NOT prove engagement, retention, or educational value. The next steps (not part of this spec):

1. **Sliver 2:** Real question bank via content pipeline (Tech Lead), multiple opponents with progression (Backend Engineer), polished visual identity with Nano Banana Pro backgrounds (Game Designer)
2. **Sliver 3:** Supabase backend, FSRS scheduling, async multiplayer challenge mode
3. **User testing:** Put Sliver 2 in front of 5-10 real JEE/NEET students and watch them play
