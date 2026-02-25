import Phaser from 'phaser';
import { soundManager } from './SoundManager';
import type { PlayerAnswer } from '../types';

const FONT = "'Space Grotesk', system-ui, sans-serif";
const FONT_TITLE = "'Orbitron', 'Space Grotesk', system-ui, sans-serif";

const W = 1600;
const H = 1200;
const cx = W / 2;

export class DefeatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DefeatScene' });
  }

  create(data: { score: number; totalQuestions: number; missed: PlayerAnswer[] }): void {
    const score = data?.score ?? 0;
    const total = data?.totalQuestions ?? 5;

    // Smooth fade in
    this.cameras.main.fadeIn(600, 5, 5, 8);

    // ════════════════════════════════════════════════
    //  MATTER.JS DEFEAT EFFECTS
    // ════════════════════════════════════════════════

    // Heavy screen shake on entry
    this.time.delayedCall(300, () => {
      this.cameras.main.shake(500, 0.02);
    });

    // ── 1. Shattered player debris (character explodes) ──
    this.spawnShatterDebris(360, 400);

    // ── 2. Falling meteors from above ──
    this.spawnMeteors();

    // ── 3. Red ember particles rising ──
    this.spawnEmbers();

    // ── 4. Broken sword fragments tumbling ──
    this.spawnBrokenSwords();

    // ── 5. Expanding shockwave ring ──
    this.spawnShockwave(360, 400);

    // ── 6. Fallen player silhouette ──
    const playerImg = this.add.image(360, 520, 'player-hit')
      .setDisplaySize(200, 200).setAlpha(0).setDepth(2).setTint(0x660020);
    this.tweens.add({
      targets: playerImg, alpha: 0.6,
      duration: 1200, delay: 800, ease: 'power2.out',
    });
    // Slow float down
    this.tweens.add({
      targets: playerImg, y: 540,
      duration: 3000, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 800,
    });

    // Opponent looms victorious
    const oppImg = this.add.image(W - 360, 400, 'opponent-idle')
      .setDisplaySize(280, 280).setAlpha(0).setDepth(2);
    this.tweens.add({
      targets: oppImg, alpha: 0.7,
      duration: 1000, delay: 1200, ease: 'power2.out',
    });
    // Red glow under opponent
    const oppGlow = this.add.ellipse(W - 360, 560, 280, 50, 0xe04060, 0.25)
      .setAlpha(0).setDepth(1);
    this.tweens.add({
      targets: oppGlow, alpha: 1,
      duration: 800, delay: 1400, ease: 'power2.out',
    });
    // Opponent breathing
    this.tweens.add({
      targets: oppImg, y: 394,
      duration: 2200, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1200,
    });

    // ════════════════════════════════════════════════
    //  UI TEXT + BUTTON (on top of effects)
    // ════════════════════════════════════════════════

    // Defeat title — slams in
    const defeatText = this.add.text(cx, 140, 'DEFEAT', {
      fontFamily: FONT_TITLE,
      fontSize: '96px',
      color: '#e04060',
      fontStyle: 'bold',
      letterSpacing: 16,
    }).setOrigin(0.5).setDepth(10).setAlpha(0).setScale(2.5);

    this.tweens.add({
      targets: defeatText, alpha: 1, scale: 1,
      duration: 500, delay: 400, ease: 'back.out(2)',
      onComplete: () => {
        this.cameras.main.shake(200, 0.015);
        // Defeat text pulse
        this.tweens.add({
          targets: defeatText, alpha: 0.6,
          duration: 1200, yoyo: true, repeat: -1, ease: 'sine.inOut',
        });
      },
    });

    // Score
    const scoreText = this.add.text(cx, 260, `${score} / ${total} correct`, {
      fontFamily: FONT,
      fontSize: '40px',
      color: '#e8e6e3',
    }).setOrigin(0.5).setDepth(10).setAlpha(0);
    this.tweens.add({ targets: scoreText, alpha: 1, duration: 600, delay: 900 });

    // Missed questions
    if (data?.missed?.length > 0) {
      const reviewTitle = this.add.text(cx, 360, 'REVIEW YOUR MISTAKES', {
        fontFamily: FONT,
        fontSize: '22px',
        color: '#666680',
        letterSpacing: 8,
      }).setOrigin(0.5).setDepth(10).setAlpha(0);
      this.tweens.add({ targets: reviewTitle, alpha: 1, duration: 500, delay: 1100 });

      let yPos = 440;
      data.missed.forEach((answer, i) => {
        const qText = this.add.text(cx, yPos, `Q: ${answer.questionId} — Your answer: Option ${answer.selectedIndex + 1}`, {
          fontFamily: FONT,
          fontSize: '24px',
          color: '#c0506a',
          wordWrap: { width: 1200 },
          align: 'center',
        }).setOrigin(0.5, 0).setDepth(10).setAlpha(0);
        this.tweens.add({ targets: qText, alpha: 1, duration: 400, delay: 1200 + i * 150 });
        yPos += 72;
      });
    }

    // Encouragement
    const encourageText = this.add.text(cx, 880, 'Study the concepts and try again!', {
      fontFamily: FONT,
      fontSize: '28px',
      color: '#8b7ec8',
      fontStyle: 'italic',
    }).setOrigin(0.5).setDepth(10).setAlpha(0);
    this.tweens.add({ targets: encourageText, alpha: 1, duration: 600, delay: 1500 });

    // Try Again button
    const btnBg = this.add.rectangle(cx, 1020, 480, 104, 0x0a0a0f)
      .setStrokeStyle(2, 0xe04060, 0.4)
      .setInteractive({ useHandCursor: true })
      .setDepth(10).setAlpha(0);
    const btnText = this.add.text(cx, 1020, 'TRY AGAIN', {
      fontFamily: FONT_TITLE,
      fontSize: '28px',
      color: '#e04060',
      letterSpacing: 8,
    }).setOrigin(0.5).setDepth(10).setAlpha(0);

    this.tweens.add({ targets: [btnBg, btnText], alpha: 1, duration: 600, delay: 1800 });

    btnBg.on('pointerover', () => btnBg.setFillStyle(0xe04060, 0.1));
    btnBg.on('pointerout', () => btnBg.setFillStyle(0x0a0a0f));
    btnBg.on('pointerdown', () => {
      soundManager.play('buttonTap');
      this.cameras.main.fadeOut(400, 5, 5, 8);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('BattleScene');
      });
    });
  }

  // ════════════════════════════════════════════════
  //  MATTER.JS PHYSICS EFFECTS
  // ════════════════════════════════════════════════

  /** Shattered character debris — chunks fly out from where the player was */
  private spawnShatterDebris(x: number, y: number): void {
    const colors = [0xe04060, 0xcc2222, 0x882244, 0xff6666, 0x4a9eff, 0x333344];

    for (let i = 0; i < 30; i++) {
      const size = Phaser.Math.Between(8, 22);
      const shape = Phaser.Math.Between(0, 2);
      let piece: Phaser.GameObjects.Shape;

      if (shape === 0) {
        // Square shard
        piece = this.add.rectangle(
          x + Phaser.Math.Between(-50, 50),
          y + Phaser.Math.Between(-60, 30),
          size, size * Phaser.Math.FloatBetween(0.5, 1.5),
          Phaser.Math.RND.pick(colors)
        );
      } else if (shape === 1) {
        // Triangle shard
        piece = this.add.triangle(
          x + Phaser.Math.Between(-50, 50),
          y + Phaser.Math.Between(-60, 30),
          0, -size, -size * 0.6, size * 0.4, size * 0.6, size * 0.4,
          Phaser.Math.RND.pick(colors)
        );
      } else {
        // Circle chunk
        piece = this.add.circle(
          x + Phaser.Math.Between(-50, 50),
          y + Phaser.Math.Between(-60, 30),
          size * 0.5,
          Phaser.Math.RND.pick(colors)
        );
      }

      piece.setAlpha(Phaser.Math.FloatBetween(0.7, 1.0)).setDepth(3);

      const body = this.matter.add.gameObject(piece, {
        restitution: 0.5, friction: 0.2, frictionAir: 0.008,
        angle: Phaser.Math.FloatBetween(0, Math.PI * 2),
      });

      const mb = (body as unknown as { body: MatterJS.BodyType }).body;
      this.matter.body.setVelocity(mb, {
        x: Phaser.Math.FloatBetween(-18, 18),
        y: Phaser.Math.FloatBetween(-25, -8),
      });
      this.matter.body.setAngularVelocity(mb, Phaser.Math.FloatBetween(-0.3, 0.3));

      // Fade out after bouncing
      this.tweens.add({
        targets: piece, alpha: 0,
        duration: 2000, delay: 1500 + Math.random() * 1500,
        onComplete: () => { this.matter.world.remove(mb); piece.destroy(); },
      });
    }
  }

  /** Meteors crashing down from the sky */
  private spawnMeteors(): void {
    for (let i = 0; i < 8; i++) {
      const delay = 200 + i * 400;
      this.time.delayedCall(delay, () => {
        const x = Phaser.Math.Between(100, W - 100);
        const size = Phaser.Math.Between(10, 24);
        const color = Phaser.Math.RND.pick([0xe04060, 0xcc4422, 0xff6644, 0x882244]);

        // Meteor body
        const meteor = this.add.circle(x, -50, size, color, 0.9).setDepth(4);

        // Trailing particles
        const trail = this.add.graphics().setDepth(3);

        const body = this.matter.add.gameObject(meteor, {
          restitution: 0.3, friction: 0.1, frictionAir: 0.002,
        });
        const mb = (body as unknown as { body: MatterJS.BodyType }).body;
        this.matter.body.setVelocity(mb, {
          x: Phaser.Math.FloatBetween(-3, 3),
          y: Phaser.Math.FloatBetween(8, 16),
        });

        // Trail effect — draw every frame
        const trailUpdate = this.time.addEvent({
          delay: 30, repeat: 40,
          callback: () => {
            trail.fillStyle(color, 0.3);
            trail.fillCircle(meteor.x, meteor.y, size * 0.6);
          },
        });

        // Fade trail
        this.tweens.add({
          targets: trail, alpha: 0,
          duration: 2000, delay: 800,
          onComplete: () => { trail.destroy(); trailUpdate.destroy(); },
        });

        // Impact: spawn ground sparks when meteor is low
        this.time.delayedCall(1200, () => {
          this.spawnImpactSparks(meteor.x, H - 100);
        });

        // Fade and clean up
        this.tweens.add({
          targets: meteor, alpha: 0,
          duration: 1500, delay: 2000,
          onComplete: () => { this.matter.world.remove(mb); meteor.destroy(); },
        });
      });
    }
  }

  /** Small spark burst at a point (for meteor impacts) */
  private spawnImpactSparks(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const spark = this.add.circle(
        x + Phaser.Math.Between(-10, 10), y,
        Phaser.Math.Between(2, 5),
        Phaser.Math.RND.pick([0xe04060, 0xff8844, 0xffcc44, 0xffffff]),
        0.9
      ).setDepth(5);

      this.tweens.add({
        targets: spark,
        x: spark.x + Phaser.Math.Between(-80, 80),
        y: spark.y + Phaser.Math.Between(-120, -30),
        alpha: 0, scale: 0,
        duration: 400 + Math.random() * 400,
        ease: 'power2.out',
        onComplete: () => spark.destroy(),
      });
    }
  }

  /** Red/orange embers floating up from the bottom */
  private spawnEmbers(): void {
    const spawnEmber = () => {
      const x = Phaser.Math.Between(50, W - 50);
      const size = Phaser.Math.FloatBetween(1.5, 4);
      const color = Phaser.Math.RND.pick([0xe04060, 0xff6644, 0xffaa22, 0xcc2222]);

      const ember = this.add.circle(x, H + 10, size, color, 0.85).setDepth(1);

      this.tweens.add({
        targets: ember,
        y: Phaser.Math.Between(-50, H * 0.4),
        x: x + Phaser.Math.Between(-80, 80),
        alpha: 0,
        scale: Phaser.Math.FloatBetween(0.2, 0.8),
        duration: 3000 + Math.random() * 3000,
        ease: 'power1.out',
        onComplete: () => ember.destroy(),
      });
    };

    // Initial burst
    for (let i = 0; i < 15; i++) {
      this.time.delayedCall(i * 60, spawnEmber);
    }

    // Continuous embers
    this.time.addEvent({ delay: 200, repeat: 30, callback: spawnEmber });
  }

  /** Broken red lightsaber/sword fragments tumbling with physics */
  private spawnBrokenSwords(): void {
    const bladeColors = [0xe04060, 0xcc2222, 0xff4466];

    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(500 + i * 300, () => {
        const x = Phaser.Math.Between(200, W - 200);
        const len = Phaser.Math.Between(20, 40);
        const color = Phaser.Math.RND.pick(bladeColors);

        const gfx = this.add.graphics().setDepth(3);
        gfx.setPosition(x, -30);
        gfx.setAlpha(0.8);

        // Broken blade fragment
        gfx.fillStyle(color, 1);
        gfx.fillRect(-1.5, -len / 2, 3, len);
        // Glow
        gfx.fillStyle(color, 0.3);
        gfx.fillRect(-3, -len / 2, 6, len);
        // Broken jagged end
        gfx.fillStyle(0xffffff, 0.5);
        gfx.fillTriangle(-2, -len / 2 - 3, 2, -len / 2 - 3, 0, -len / 2 - 8);

        const body = this.matter.add.gameObject(
          gfx as unknown as Phaser.GameObjects.GameObject,
          {
            restitution: 0.4, friction: 0.15, frictionAir: 0.01,
            angle: Phaser.Math.FloatBetween(0, Math.PI * 2),
          }
        );

        const mb = (body as unknown as { body: MatterJS.BodyType }).body;
        this.matter.body.setVelocity(mb, {
          x: Phaser.Math.FloatBetween(-8, 8),
          y: Phaser.Math.FloatBetween(4, 12),
        });
        this.matter.body.setAngularVelocity(mb, Phaser.Math.FloatBetween(-0.15, 0.15));

        this.tweens.add({
          targets: gfx, alpha: 0,
          duration: 2000, delay: 2500,
          onComplete: () => { this.matter.world.remove(mb); gfx.destroy(); },
        });
      });
    }
  }

  /** Expanding shockwave ring from the shatter point */
  private spawnShockwave(x: number, y: number): void {
    this.time.delayedCall(200, () => {
      // Inner ring
      const ring1 = this.add.circle(x, y, 10, 0xe04060, 0).setDepth(4);
      ring1.setStrokeStyle(3, 0xe04060, 0.8);

      this.tweens.add({
        targets: ring1,
        scaleX: 12, scaleY: 12,
        alpha: 0,
        duration: 1200,
        ease: 'power2.out',
        onStart: () => { ring1.setAlpha(1); },
        onComplete: () => ring1.destroy(),
      });

      // Outer ring (delayed)
      this.time.delayedCall(150, () => {
        const ring2 = this.add.circle(x, y, 10, 0xff6644, 0).setDepth(4);
        ring2.setStrokeStyle(2, 0xff6644, 0.5);

        this.tweens.add({
          targets: ring2,
          scaleX: 16, scaleY: 16,
          alpha: 0,
          duration: 1500,
          ease: 'power2.out',
          onStart: () => { ring2.setAlpha(1); },
          onComplete: () => ring2.destroy(),
        });
      });
    });
  }
}
