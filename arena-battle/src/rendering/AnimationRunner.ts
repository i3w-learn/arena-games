import Phaser from 'phaser';

// ─── Types for animation-spec.json ──────────────────────────────

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

/**
 * Special-case definition for health bar animations.
 * healthBarDecrease has no steps array — just property/duration/ease.
 */
interface HealthBarDef {
  property: string;
  duration: number;
  ease: string;
}

/**
 * Translates animation-spec.json definitions into Phaser tweens.
 * All timing/easing values come from the JSON — no hardcoded values.
 */
export class AnimationRunner {
  private spec: Record<string, unknown> | null = null;

  /**
   * Load the parsed animation-spec.json object.
   * Typically called once after BootScene finishes loading assets.
   */
  loadSpec(spec: Record<string, unknown>): void {
    this.spec = spec;
  }

  /**
   * Run a named animation sequence from the spec on a target game object.
   *
   * Plays every step in `steps[]` sequentially, then repeats the full
   * sequence `repeat` times (defaults to 1 if omitted).
   *
   * Resolves when all repetitions are complete.
   */
  async runAnimation(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    animationKey: string
  ): Promise<void> {
    if (!this.spec) return;

    const def = this.spec[animationKey] as AnimationDef | undefined;
    if (!def || !def.steps) return;

    const repeatCount = def.repeat ?? 1;

    for (let r = 0; r < repeatCount; r++) {
      for (const step of def.steps) {
        await this.runStep(scene, target, step);
      }
    }
  }

  /**
   * Execute a single tween step and resolve when the tween completes.
   *
   * Supports three modes determined by which fields are present on the step:
   *   1. `delta` — animate relative to the target's current value
   *   2. `from` + `to` — snap to `from`, then animate to `to`
   *   3. `to` only — animate from the current value to the absolute `to`
   */
  private runStep(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    step: AnimationStep
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      const tweenConfig: Phaser.Types.Tweens.TweenBuilderConfig = {
        targets: target,
        duration: step.duration,
        ease: step.ease,
        onComplete: () => resolve(),
      };

      // Read the target's current value for the animated property.
      // Cast through `unknown` to satisfy strict TypeScript — GameObject
      // doesn't carry an index signature but Phaser sprites do have x, y,
      // alpha, scaleX, etc. at runtime.
      const targetAny = target as unknown as Record<string, number>;
      const currentValue = targetAny[step.property];

      if (step.delta !== undefined) {
        // Relative: move by delta from wherever the target currently is.
        tweenConfig[step.property] = currentValue + step.delta;
      } else if (step.from !== undefined && step.to !== undefined) {
        // From/to: snap to `from` immediately, then tween to `to`.
        targetAny[step.property] = step.from;
        tweenConfig[step.property] = step.to;
      } else if (step.to !== undefined) {
        // Absolute: tween from current value to the specified `to`.
        tweenConfig[step.property] = step.to;
      }

      scene.tweens.add(tweenConfig);
    });
  }

  /**
   * Animate a health bar rectangle to a new fill ratio.
   *
   * Uses the `healthBarDecrease` entry from the spec which is a special
   * case — it has no `steps[]` array, just `property`, `duration`, `ease`.
   *
   * @param healthBar  The Phaser Rectangle representing the health fill.
   * @param newRatio   Target ratio in [0, 1] (e.g. 0.6 = 60% health).
   */
  async runHealthBarTween(
    scene: Phaser.Scene,
    healthBar: Phaser.GameObjects.Rectangle,
    newRatio: number
  ): Promise<void> {
    if (!this.spec) return;

    const hbSpec = this.spec['healthBarDecrease'] as HealthBarDef | undefined;
    if (!hbSpec) return;

    return new Promise<void>((resolve) => {
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
