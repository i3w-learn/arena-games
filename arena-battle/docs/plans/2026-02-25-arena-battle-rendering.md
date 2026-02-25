# Arena Battle — Rendering Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the Phaser rendering layer so the Arena Battle game is fully playable — characters on screen, health bars, question panels, attack animations, jsfxr sounds, and victory/defeat screens.

**Architecture:** All game logic already exists in `src/state/` and `src/systems/` (zero Phaser imports). The rendering layer in `src/rendering/` subscribes to the `EventBus`, reads state via `BattleSystem.getState()`, and calls `BattleSystem.submitAnswer()` as the ONE allowed write path. All animation values come from `animation-spec.json`, all sounds from `sound-params.json`.

**Tech Stack:** Phaser 3.88, TypeScript (strict), Vite, jsfxr (npm), SVG assets in `public/assets/`

---

## Current Status (What's Already Built)

| Layer | Status | Files |
|-------|--------|-------|
| Types & contracts | DONE | `src/types.ts` |
| State management | DONE | `src/state/BattleState.ts`, `src/state/QuestionBank.ts` |
| Game logic | DONE | `src/systems/BattleSystem.ts` |
| Event system | DONE | `src/events/EventBus.ts`, `src/events/GameEvents.ts` |
| Asset loading | DONE | `src/rendering/BootScene.ts` |
| SVG assets | DONE | `public/assets/characters/`, `public/assets/ui/` |
| JSON data | DONE | `public/assets/sounds/sound-params.json`, `public/assets/animations/animation-spec.json` |
| React wrapper | DONE | `src/components/GameCanvas.tsx`, `src/App.tsx`, `src/main.tsx` |
| **BattleScene** | **STUB** | `src/rendering/BattleScene.ts` — placeholder text only |
| **AnimationRunner** | **STUB** | `src/rendering/AnimationRunner.ts` — empty class |
| **SoundManager** | **STUB** | `src/rendering/SoundManager.ts` — empty class |
| **VictoryScene** | **STUB** | `src/rendering/VictoryScene.ts` — placeholder text only |
| **DefeatScene** | **STUB** | `src/rendering/DefeatScene.ts` — placeholder text only |

## Key Architecture Rules (from CLAUDE.md)

1. Files in `src/rendering/` NEVER directly modify BattleState properties
2. All state→rendering communication flows through EventBus
3. All animation values come from `animation-spec.json` — NO hardcoded tweens
4. All sound params come from `sound-params.json` — NO hardcoded jsfxr values
5. `BattleSystem.submitAnswer(index)` is the ONLY system method called from rendering

## Key Files to Reference

- **EventBus API:** `eventBus.on(event, callback)`, `eventBus.off(event, callback)`, `eventBus.emit(event, ...args)` — import from `src/events/EventBus.ts`
- **Event types:** `GameEventType` enum — import from `src/events/GameEvents.ts`
- **BattleSystem API:** `.startBattle()`, `.showNextQuestion()`, `.submitAnswer(index)`, `.getState()`, `.restart()` — import from `src/systems/BattleSystem.ts`
- **Visual Identity palette:** Primary `#E63946`, Dark `#1D3557`, Light `#F1FAEE`, Accent `#457B9D`, Health `#A8DADC`
- **Timing:** intro delay 1500ms, explanation display 1500ms, inter-question delay 500ms
- **Game canvas:** 800×600, Phaser.Scale.FIT

---

## Task 1: SoundManager — jsfxr Integration

**Files:**
- Modify: `src/rendering/SoundManager.ts`

**Why first:** Sound is the simplest rendering component. No visual dependencies. Proves the data-driven pipeline immediately.

**Step 1: Implement SoundManager class**

```typescript
// src/rendering/SoundManager.ts
import { jsfxr } from 'jsfxr';
import type { SoundParams } from '../types';
import { eventBus } from '../events/EventBus';
import { GameEventType } from '../events/GameEvents';

export class SoundManager {
  private params: SoundParams | null = null;
  private audioCache: Map<string, AudioBuffer> = new Map();
  private audioContext: AudioContext | null = null;

  loadParams(params: SoundParams): void {
    this.params = params;
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  play(soundKey: keyof SoundParams): void {
    if (!this.params) return;
    const paramArray = this.params[soundKey];
    if (!paramArray) return;

    // jsfxr returns a URL to a generated WAV
    const url = jsfxr(paramArray);
    const audio = new Audio(url);
    audio.play().catch(() => {
      // Browser may block autoplay before user interaction
    });
  }

  subscribe(): void {
    eventBus.on(GameEventType.BATTLE_START, () => this.play('battleStart'));
    eventBus.on(GameEventType.ANSWER_CORRECT, () => this.play('correct'));
    eventBus.on(GameEventType.ANSWER_WRONG, () => this.play('wrong'));
    eventBus.on(GameEventType.ATTACK_PLAYER, () => this.play('attackHit'));
    eventBus.on(GameEventType.ATTACK_OPPONENT, () => this.play('attackHit'));
    eventBus.on(GameEventType.VICTORY, () => this.play('victory'));
    eventBus.on(GameEventType.DEFEAT, () => this.play('defeat'));
  }

  unsubscribe(): void {
    eventBus.clear();
  }
}
```

**Step 2: Verify build compiles**

Run: `cd /Users/manassingh/Downloads/games-dev/arena-battle && npx tsc --noEmit`
Expected: Zero errors

**Step 3: Commit**

```bash
git add src/rendering/SoundManager.ts
git commit -m "feat: implement SoundManager with jsfxr playback and EventBus wiring"
```

---

## Task 2: AnimationRunner — JSON-to-Tween Translator

**Files:**
- Modify: `src/rendering/AnimationRunner.ts`

**Step 1: Implement AnimationRunner class**

The animation-spec.json has this structure:
- `steps[]` — sequential tweens with `property`, `delta`/`to`/`from`, `duration`, `ease`
- `repeat` — optional repeat count for the full sequence

```typescript
// src/rendering/AnimationRunner.ts
import Phaser from 'phaser';

interface AnimationStep {
  property: string;
  to?: number;
  from?: number;
  delta?: number;
  duration: number;
  ease: string;
}

interface AnimationDef {
  steps: AnimationStep[];
  repeat?: number;
}

export class AnimationRunner {
  private spec: Record<string, AnimationDef> | null = null;

  loadSpec(spec: Record<string, unknown>): void {
    this.spec = spec as Record<string, AnimationDef>;
  }

  async runAnimation(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    animationKey: string
  ): Promise<void> {
    if (!this.spec) return;
    const def = this.spec[animationKey];
    if (!def || !def.steps) return;

    const repeatCount = def.repeat ?? 1;

    for (let r = 0; r < repeatCount; r++) {
      for (const step of def.steps) {
        await this.runStep(scene, target, step);
      }
    }
  }

  private runStep(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    step: AnimationStep
  ): Promise<void> {
    return new Promise((resolve) => {
      const tweenConfig: Phaser.Types.Tweens.TweenBuilderConfig = {
        targets: target,
        duration: step.duration,
        ease: step.ease,
        onComplete: () => resolve(),
      };

      const currentValue = (target as Record<string, unknown>)[step.property] as number;

      if (step.delta !== undefined) {
        tweenConfig[step.property] = currentValue + step.delta;
      } else if (step.from !== undefined && step.to !== undefined) {
        (target as Record<string, number>)[step.property] = step.from;
        tweenConfig[step.property] = step.to;
      } else if (step.to !== undefined) {
        tweenConfig[step.property] = step.to;
      }

      scene.tweens.add(tweenConfig);
    });
  }

  async runHealthBarTween(
    scene: Phaser.Scene,
    healthBar: Phaser.GameObjects.Rectangle,
    newRatio: number
  ): Promise<void> {
    if (!this.spec) return;
    const hbSpec = this.spec['healthBarDecrease'] as unknown as {
      property: string;
      duration: number;
      ease: string;
    };
    if (!hbSpec) return;

    return new Promise((resolve) => {
      scene.tweens.add({
        targets: healthBar,
        [hbSpec.property]: newRatio,
        duration: hbSpec.duration,
        ease: hbSpec.ease,
        onComplete: () => resolve(),
      });
    });
  }
}
```

**Step 2: Verify build compiles**

Run: `cd /Users/manassingh/Downloads/games-dev/arena-battle && npx tsc --noEmit`
Expected: Zero errors

**Step 3: Commit**

```bash
git add src/rendering/AnimationRunner.ts
git commit -m "feat: implement AnimationRunner with JSON-to-tween translation"
```

---

## Task 3: BattleScene — Main Battle UI

**Files:**
- Modify: `src/rendering/BattleScene.ts`

This is the biggest task. The BattleScene places characters, health bars, question text, and 4 answer buttons. It subscribes to all EventBus events and coordinates animations and sounds.

**Step 1: Implement the full BattleScene**

```typescript
// src/rendering/BattleScene.ts
import Phaser from 'phaser';
import { BattleSystem } from '../systems/BattleSystem';
import { eventBus } from '../events/EventBus';
import { GameEventType } from '../events/GameEvents';
import { AnimationRunner } from './AnimationRunner';
import { SoundManager } from './SoundManager';
import type { MCQ } from '../types';

export class BattleScene extends Phaser.Scene {
  private battleSystem!: BattleSystem;
  private animRunner!: AnimationRunner;
  private soundManager!: SoundManager;

  // Character sprites
  private playerSprite!: Phaser.GameObjects.Image;
  private opponentSprite!: Phaser.GameObjects.Image;

  // Health bars (inner colored rectangles)
  private playerHealthBar!: Phaser.GameObjects.Rectangle;
  private opponentHealthBar!: Phaser.GameObjects.Rectangle;

  // Question UI
  private questionText!: Phaser.GameObjects.Text;
  private answerButtons: Phaser.GameObjects.Text[] = [];
  private explanationText!: Phaser.GameObjects.Text;

  // Layout constants
  private readonly PLAYER_X = 180;
  private readonly OPPONENT_X = 620;
  private readonly CHARACTER_Y = 220;
  private readonly HEALTH_BAR_WIDTH = 200;
  private readonly HEALTH_BAR_HEIGHT = 16;

  private isAnimating = false;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(): void {
    this.battleSystem = new BattleSystem();
    this.animRunner = new AnimationRunner();
    this.soundManager = new SoundManager();

    // Load data from BootScene cache
    const animSpec = this.cache.json.get('animation-spec');
    const soundParams = this.cache.json.get('sound-params');
    this.animRunner.loadSpec(animSpec);
    this.soundManager.loadParams(soundParams);
    this.soundManager.subscribe();

    this.createCharacters();
    this.createHealthBars();
    this.createQuestionUI();
    this.subscribeToEvents();

    // Start the battle
    this.battleSystem.startBattle();
  }

  private createCharacters(): void {
    this.playerSprite = this.add.image(this.PLAYER_X, this.CHARACTER_Y, 'player-idle');
    this.playerSprite.setDisplaySize(128, 128);

    this.opponentSprite = this.add.image(this.OPPONENT_X, this.CHARACTER_Y, 'opponent-idle');
    this.opponentSprite.setDisplaySize(128, 128);

    // Player label
    this.add.text(this.PLAYER_X, this.CHARACTER_Y + 80, 'Player', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#F1FAEE',
    }).setOrigin(0.5);

    // Opponent label
    this.add.text(this.OPPONENT_X, this.CHARACTER_Y + 80, 'Opponent', {
      fontFamily: 'sans-serif', fontSize: '16px', color: '#F1FAEE',
    }).setOrigin(0.5);
  }

  private createHealthBars(): void {
    const playerBarX = this.PLAYER_X - this.HEALTH_BAR_WIDTH / 2;
    const opponentBarX = this.OPPONENT_X - this.HEALTH_BAR_WIDTH / 2;
    const barY = this.CHARACTER_Y - 90;

    // Player health bar background
    this.add.rectangle(
      this.PLAYER_X, barY, this.HEALTH_BAR_WIDTH, this.HEALTH_BAR_HEIGHT, 0x1D3557
    ).setStrokeStyle(2, 0x457B9D);

    // Player health bar fill
    this.playerHealthBar = this.add.rectangle(
      playerBarX, barY, this.HEALTH_BAR_WIDTH, this.HEALTH_BAR_HEIGHT - 4, 0xA8DADC
    ).setOrigin(0, 0.5);

    // Player HP text
    this.add.text(this.PLAYER_X, barY - 14, '100 / 100', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#F1FAEE',
    }).setOrigin(0.5).setName('playerHpText');

    // Opponent health bar background
    this.add.rectangle(
      this.OPPONENT_X, barY, this.HEALTH_BAR_WIDTH, this.HEALTH_BAR_HEIGHT, 0x1D3557
    ).setStrokeStyle(2, 0x457B9D);

    // Opponent health bar fill
    this.opponentHealthBar = this.add.rectangle(
      opponentBarX, barY, this.HEALTH_BAR_WIDTH, this.HEALTH_BAR_HEIGHT - 4, 0xE63946
    ).setOrigin(0, 0.5);

    // Opponent HP text
    this.add.text(this.OPPONENT_X, barY - 14, '100 / 100', {
      fontFamily: 'sans-serif', fontSize: '12px', color: '#F1FAEE',
    }).setOrigin(0.5).setName('opponentHpText');
  }

  private createQuestionUI(): void {
    // Question text
    this.questionText = this.add.text(400, 370, '', {
      fontFamily: 'sans-serif',
      fontSize: '18px',
      color: '#F1FAEE',
      wordWrap: { width: 700 },
      align: 'center',
    }).setOrigin(0.5, 0);

    // 4 answer buttons (2x2 grid)
    const buttonPositions = [
      { x: 220, y: 450 }, { x: 580, y: 450 },
      { x: 220, y: 510 }, { x: 580, y: 510 },
    ];

    for (let i = 0; i < 4; i++) {
      const btn = this.add.text(buttonPositions[i].x, buttonPositions[i].y, '', {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        color: '#F1FAEE',
        backgroundColor: '#457B9D',
        padding: { x: 16, y: 10 },
        fixedWidth: 320,
        wordWrap: { width: 300 },
        align: 'center',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => this.onAnswerSelected(i));
      btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#5a8fb0' }));
      btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#457B9D' }));

      this.answerButtons.push(btn);
    }

    // Explanation text (hidden by default)
    this.explanationText = this.add.text(400, 560, '', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#A8DADC',
      fontStyle: 'italic',
      wordWrap: { width: 700 },
      align: 'center',
    }).setOrigin(0.5, 0).setAlpha(0);

    // Hide question UI initially
    this.setQuestionUIVisible(false);
  }

  private setQuestionUIVisible(visible: boolean): void {
    this.questionText.setVisible(visible);
    this.answerButtons.forEach((btn) => btn.setVisible(visible));
  }

  private onAnswerSelected(index: number): void {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Disable buttons during resolution
    this.answerButtons.forEach((btn) => btn.disableInteractive());

    this.battleSystem.submitAnswer(index);
  }

  private subscribeToEvents(): void {
    eventBus.on(GameEventType.BATTLE_START, () => {
      // Reset sprites
      this.playerSprite.setTexture('player-idle');
      this.opponentSprite.setTexture('opponent-idle');
      this.setQuestionUIVisible(false);

      // Auto-transition to first question after intro delay
      this.time.delayedCall(1500, () => {
        this.battleSystem.showNextQuestion();
      });
    });

    eventBus.on(GameEventType.QUESTION_SHOW, (payload: { question: MCQ; questionIndex: number }) => {
      this.showQuestion(payload.question, payload.questionIndex);
    });

    eventBus.on(GameEventType.ANSWER_CORRECT, (payload: { questionId: string; selectedIndex: number }) => {
      // Flash the selected button green
      this.answerButtons[payload.selectedIndex].setStyle({ backgroundColor: '#2a9d4e' });
    });

    eventBus.on(GameEventType.ANSWER_WRONG, (payload: { questionId: string; selectedIndex: number; correctIndex: number }) => {
      // Flash selected button red, correct button green
      this.answerButtons[payload.selectedIndex].setStyle({ backgroundColor: '#E63946' });
      this.answerButtons[payload.correctIndex].setStyle({ backgroundColor: '#2a9d4e' });
    });

    eventBus.on(GameEventType.ATTACK_PLAYER, async () => {
      // Player attacks opponent
      this.playerSprite.setTexture('player-attack');
      await this.animRunner.runAnimation(this, this.playerSprite, 'playerAttack');

      this.opponentSprite.setTexture('opponent-hit');
      await this.animRunner.runAnimation(this, this.opponentSprite, 'takeHit');

      this.playerSprite.setTexture('player-idle');
      this.opponentSprite.setTexture('opponent-idle');
      this.advanceAfterResolve();
    });

    eventBus.on(GameEventType.ATTACK_OPPONENT, async () => {
      // Opponent attacks player
      this.opponentSprite.setTexture('opponent-attack');
      await this.animRunner.runAnimation(this, this.opponentSprite, 'opponentAttack');

      this.playerSprite.setTexture('player-hit');
      await this.animRunner.runAnimation(this, this.playerSprite, 'takeHit');

      this.opponentSprite.setTexture('opponent-idle');
      this.playerSprite.setTexture('player-idle');
      // advanceAfterResolve called after explanation display
    });

    eventBus.on(GameEventType.HP_CHANGED, async (payload: { character: 'player' | 'opponent'; newHp: number; maxHp: number }) => {
      const ratio = payload.newHp / payload.maxHp;
      const bar = payload.character === 'player' ? this.playerHealthBar : this.opponentHealthBar;
      await this.animRunner.runHealthBarTween(this, bar, ratio);

      // Update HP text
      const textName = payload.character === 'player' ? 'playerHpText' : 'opponentHpText';
      const hpText = this.children.getByName(textName) as Phaser.GameObjects.Text;
      if (hpText) hpText.setText(`${payload.newHp} / ${payload.maxHp}`);
    });

    eventBus.on(GameEventType.SHOW_EXPLANATION, (payload: { explanation: string; correctIndex: number }) => {
      this.explanationText.setText(payload.explanation);
      this.explanationText.setAlpha(1);

      this.time.delayedCall(1500, () => {
        this.explanationText.setAlpha(0);
        this.advanceAfterResolve();
      });
    });

    eventBus.on(GameEventType.VICTORY, (payload: { score: number; totalQuestions: number }) => {
      this.playerSprite.setTexture('player-victory');
      this.time.delayedCall(1000, () => {
        this.scene.start('VictoryScene', payload);
      });
    });

    eventBus.on(GameEventType.DEFEAT, (payload: { score: number; totalQuestions: number; missed: unknown[] }) => {
      this.time.delayedCall(1000, () => {
        this.scene.start('DefeatScene', payload);
      });
    });
  }

  private showQuestion(question: MCQ, questionIndex: number): void {
    this.setQuestionUIVisible(true);
    this.questionText.setText(`Q${questionIndex + 1}: ${question.question}`);

    question.options.forEach((option, i) => {
      this.answerButtons[i].setText(option);
      this.answerButtons[i].setStyle({ backgroundColor: '#457B9D' });
      this.answerButtons[i].setInteractive({ useHandCursor: true });
    });

    this.isAnimating = false;
  }

  private advanceAfterResolve(): void {
    const state = this.battleSystem.getState();
    if (state.isGameOver) return; // VICTORY/DEFEAT events handle transition

    this.time.delayedCall(500, () => {
      this.battleSystem.showNextQuestion();
    });
  }
}
```

**Step 2: Verify build compiles**

Run: `cd /Users/manassingh/Downloads/games-dev/arena-battle && npx tsc --noEmit`
Expected: Zero errors

**Step 3: Test in browser**

Run: `cd /Users/manassingh/Downloads/games-dev/arena-battle && npm run dev`
Expected: Characters visible, health bars at 100%, question appears after 1.5s intro, answer buttons clickable

**Step 4: Commit**

```bash
git add src/rendering/BattleScene.ts
git commit -m "feat: implement BattleScene with characters, health bars, question UI, and event wiring"
```

---

## Task 4: VictoryScene — Win Screen

**Files:**
- Modify: `src/rendering/VictoryScene.ts`

**Step 1: Implement VictoryScene**

```typescript
// src/rendering/VictoryScene.ts
import Phaser from 'phaser';
import { BattleSystem } from '../systems/BattleSystem';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  create(data: { score: number; totalQuestions: number }): void {
    const score = data?.score ?? 0;
    const total = data?.totalQuestions ?? 5;

    // Victory title
    this.add.text(400, 150, 'VICTORY!', {
      fontFamily: 'sans-serif',
      fontSize: '48px',
      color: '#E63946',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Score
    this.add.text(400, 240, `Score: ${score} / ${total} correct`, {
      fontFamily: 'sans-serif',
      fontSize: '24px',
      color: '#F1FAEE',
    }).setOrigin(0.5);

    // Encouragement
    const message = score === total ? 'Perfect score!' :
                    score >= 4 ? 'Excellent work!' :
                    'Well done!';
    this.add.text(400, 300, message, {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#A8DADC',
    }).setOrigin(0.5);

    // Play Again button
    const playAgainBtn = this.add.text(400, 420, 'Play Again', {
      fontFamily: 'sans-serif',
      fontSize: '22px',
      color: '#F1FAEE',
      backgroundColor: '#457B9D',
      padding: { x: 32, y: 16 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playAgainBtn.on('pointerover', () => playAgainBtn.setStyle({ backgroundColor: '#5a8fb0' }));
    playAgainBtn.on('pointerout', () => playAgainBtn.setStyle({ backgroundColor: '#457B9D' }));
    playAgainBtn.on('pointerdown', () => {
      this.scene.start('BattleScene');
    });
  }
}
```

**Step 2: Verify build compiles**

Run: `cd /Users/manassingh/Downloads/games-dev/arena-battle && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/rendering/VictoryScene.ts
git commit -m "feat: implement VictoryScene with score display and Play Again button"
```

---

## Task 5: DefeatScene — Loss Screen with Explanations

**Files:**
- Modify: `src/rendering/DefeatScene.ts`

**Step 1: Implement DefeatScene**

```typescript
// src/rendering/DefeatScene.ts
import Phaser from 'phaser';
import type { PlayerAnswer } from '../types';

export class DefeatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DefeatScene' });
  }

  create(data: { score: number; totalQuestions: number; missed: PlayerAnswer[] }): void {
    const score = data?.score ?? 0;
    const total = data?.totalQuestions ?? 5;

    // Defeat title
    this.add.text(400, 80, 'DEFEAT', {
      fontFamily: 'sans-serif',
      fontSize: '42px',
      color: '#E63946',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Score
    this.add.text(400, 140, `Score: ${score} / ${total} correct`, {
      fontFamily: 'sans-serif',
      fontSize: '20px',
      color: '#F1FAEE',
    }).setOrigin(0.5);

    // Missed questions header
    if (data?.missed?.length > 0) {
      this.add.text(400, 190, 'Review your mistakes:', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        color: '#A8DADC',
      }).setOrigin(0.5);

      // List missed questions (up to 5, scrollable area not needed for 5 max)
      let yPos = 230;
      data.missed.forEach((answer) => {
        this.add.text(400, yPos, `Q: ${answer.questionId} — Your answer: Option ${answer.selectedIndex + 1}`, {
          fontFamily: 'sans-serif',
          fontSize: '13px',
          color: '#F1FAEE',
          wordWrap: { width: 600 },
          align: 'center',
        }).setOrigin(0.5, 0);
        yPos += 40;
      });
    }

    // Encouragement
    this.add.text(400, 460, 'Study the explanations and try again!', {
      fontFamily: 'sans-serif',
      fontSize: '16px',
      color: '#A8DADC',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Try Again button
    const tryAgainBtn = this.add.text(400, 520, 'Try Again', {
      fontFamily: 'sans-serif',
      fontSize: '22px',
      color: '#F1FAEE',
      backgroundColor: '#E63946',
      padding: { x: 32, y: 16 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    tryAgainBtn.on('pointerover', () => tryAgainBtn.setStyle({ backgroundColor: '#ff5a68' }));
    tryAgainBtn.on('pointerout', () => tryAgainBtn.setStyle({ backgroundColor: '#E63946' }));
    tryAgainBtn.on('pointerdown', () => {
      this.scene.start('BattleScene');
    });
  }
}
```

**Step 2: Verify build compiles**

Run: `cd /Users/manassingh/Downloads/games-dev/arena-battle && npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/rendering/DefeatScene.ts
git commit -m "feat: implement DefeatScene with missed questions review and Try Again button"
```

---

## Task 6: Full Integration Test

**Step 1: Run the full build**

Run: `cd /Users/manassingh/Downloads/games-dev/arena-battle && npm run build`
Expected: `tsc -b && vite build` completes with zero errors

**Step 2: Run dev server and play through**

Run: `cd /Users/manassingh/Downloads/games-dev/arena-battle && npm run dev`

Manual test checklist:
- [ ] Game launches with no console errors (F1)
- [ ] Two characters visible, health bars at 100% (F2)
- [ ] Question + 4 buttons appear after 1.5s (F3)
- [ ] Correct answer: button flashes green, player attacks, opponent HP drops (F4)
- [ ] Wrong answer: button flashes red, correct highlighted, explanation shows (F5)
- [ ] Victory screen appears when you win (F6)
- [ ] Defeat screen appears when you lose (F7)
- [ ] Play Again/Try Again fully resets (F8)
- [ ] Exactly 5 questions per battle (F9)
- [ ] Sounds play at correct moments (F10)

**Step 3: Architecture verification**

Run: `grep -r "Phaser" src/state/ src/systems/ src/events/`
Expected: Zero matches (A1 — state isolation holds)

**Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete Arena Battle proof-of-pipeline sliver — fully playable"
```

---

## Task 7: Pipeline Proof Tests

These tests validate the core thesis — that the game is data-driven.

**P1 — Change palette:** Open any SVG in `public/assets/characters/`, change a hex color, reload browser. Character should appear in new color. Zero `.ts` files changed.

**P2 — Change timing:** Open `public/assets/animations/animation-spec.json`, change `playerAttack` first step `duration` from `200` to `500`. Reload. Attack should be visibly slower. Zero `.ts` files changed.

**P3 — Change sound:** Open `public/assets/sounds/sound-params.json`, change `correct` first value from `2` to `0`. Reload. Sound should be different. Zero `.ts` files changed.

**P4 — Change questions:** Open `src/state/QuestionBank.ts`, swap any question text. Reload. New question appears. Zero rendering code changed.

If all 4 pass: **The data-first pipeline works.**

---

## Summary

| Task | Component | Effort |
|------|-----------|--------|
| 1 | SoundManager | ~10 min |
| 2 | AnimationRunner | ~15 min |
| 3 | BattleScene (biggest) | ~30 min |
| 4 | VictoryScene | ~10 min |
| 5 | DefeatScene | ~10 min |
| 6 | Integration test | ~15 min |
| 7 | Pipeline proof | ~10 min |

Total: 5 files to modify, 0 files to create. All work is in `src/rendering/`.
