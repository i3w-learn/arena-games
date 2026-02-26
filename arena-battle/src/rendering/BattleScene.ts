import Phaser from 'phaser';
import { BattleSystem } from '../systems/BattleSystem';
import { eventBus } from '../events/EventBus';
import { GameEventType } from '../events/GameEvents';
import { AnimationRunner } from './AnimationRunner';
import { soundManager } from './SoundManager';
import type { MCQ, SoundParams } from '../types';

/* ── Retro arcade palette ────────────────────────────── */
const C = {
  BG:          0x0a0a18,
  BLUE:        0x4a9eff,
  PURPLE:      0x8b7ec8,
  RED:         0xe04060,
  GREEN:       0x4eca78,
  WHITE:       0xe8e6e3,
  DIM:         0x12121e,
  DAMAGE:      0xcc2222,
  GOLD:        0xffd700,
  GLASS:       '#0c0c1a',
  GLASS_HOVER: '#1a1a3a',
  CORRECT_BG:  '#1a5a2a',
  WRONG_BG:    '#6a1a2a',
  BTN_BG:      '#0c0c1a',
  TEXT:        '#e8e6e3',
  TEXT_DIM:    '#555580',
  FONT:       "'Press Start 2P', 'Space Grotesk', monospace",
  FONT_TITLE: "'Press Start 2P', 'Orbitron', monospace",
};

/* ── HUD layout (scaled for 1600×1200) ────────────── */
const HUD = {
  Y:        60,
  PT_SIZE:  96,
  PT_PAD:   16,
};

export class BattleScene extends Phaser.Scene {
  private battleSystem!: BattleSystem;
  private animRunner!: AnimationRunner;

  private playerSprite!: Phaser.GameObjects.Image;
  private opponentSprite!: Phaser.GameObjects.Image;

  private playerHearts: Phaser.GameObjects.Image[] = [];
  private opponentHearts: Phaser.GameObjects.Image[] = [];
  private playerDamageStage = 0;
  private opponentDamageStage = 0;

  private questionText!: Phaser.GameObjects.Text;
  private answerButtons: Phaser.GameObjects.Text[] = [];
  private explanationText!: Phaser.GameObjects.Text;
  private explanationBg!: Phaser.GameObjects.Graphics;
  private currentQuestion: MCQ | null = null;
  private roundText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private timerEvent?: Phaser.Time.TimerEvent;
  private timeRemaining = 60;

  private readonly PLAYER_X = 680;
  private readonly OPPONENT_X = 920;
  private readonly CHARACTER_Y = 480;

  private isAnimating = false;

  constructor() {
    super({ key: 'BattleScene' });
  }

  create(): void {
    // Reset instance state for scene restarts (constructor only runs once)
    this.playerHearts = [];
    this.opponentHearts = [];
    this.answerButtons = [];
    this.playerDamageStage = 0;
    this.opponentDamageStage = 0;
    this.isAnimating = false;
    this.timeRemaining = 60;
    this.timerEvent = undefined;
    this.currentQuestion = null;

    // Clear stale listeners from any previous run (scene restart)
    eventBus.clear();

    this.battleSystem = new BattleSystem();
    this.animRunner = new AnimationRunner();

    const animSpec = this.cache.json.get('animation-spec') as Record<string, unknown>;
    this.animRunner.loadSpec(animSpec);

    // Load sound params and subscribe SoundManager to events
    const sndParams = this.cache.json.get('sound-params') as SoundParams;
    if (sndParams) soundManager.loadParams(sndParams);
    soundManager.subscribe();

    // Smooth fade-in
    this.cameras.main.fadeIn(800, 5, 5, 8);

    this.createStarBackground();
    this.createFloatingAsteroids();
    this.createHUD();
    this.createCharacters();
    this.createQuestionUI();
    this.subscribeToEvents();

    this.battleSystem.startBattle();
  }

  /* ── Background (retro pixel grid) ── */
  private createStarBackground(): void {
    const gfx = this.add.graphics();

    // Retro dotted grid (pixel points)
    gfx.fillStyle(C.BLUE, 0.04);
    for (let x = 0; x <= 1600; x += 40) {
      for (let y = 0; y <= 1200; y += 40) {
        gfx.fillRect(x, y, 2, 2);
      }
    }

  }

  private createFloatingAsteroids(): void {
    this.matter.world.setGravity(0, 0);

    // Helper: add a physics-enabled floating object
    const addFloater = (
      obj: Phaser.GameObjects.GameObject & { x: number; y: number; alpha: number },
      radius: number,
      vx?: number,
      vy?: number,
    ) => {
      (obj as unknown as Phaser.GameObjects.Components.Depth).setDepth(-1);
      const body = this.matter.add.gameObject(obj as Phaser.GameObjects.GameObject, {
        shape: { type: 'circle', radius },
        frictionAir: 0, friction: 0, restitution: 1, mass: 0.001, isSensor: true,
      });
      const mb = (body as unknown as { body: MatterJS.BodyType }).body;
      this.matter.body.setVelocity(mb, {
        x: vx ?? Phaser.Math.FloatBetween(-0.5, 0.5),
        y: vy ?? Phaser.Math.FloatBetween(-0.3, 0.3),
      });
      this.tweens.add({
        targets: obj, alpha: obj.alpha * 0.5,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true, repeat: -1, ease: 'sine.inOut',
        delay: Phaser.Math.Between(0, 2000),
      });
    };

    // ── Asteroids (rock chunks) ──
    for (let i = 0; i < 5; i++) {
      const size = Phaser.Math.Between(4, 10);
      const a = this.add.circle(
        Phaser.Math.Between(40, 1560),
        Phaser.Math.Between(140, 700),
        size,
        Phaser.Math.Between(0x181828, 0x2a2a40),
        Phaser.Math.FloatBetween(0.2, 0.4)
      );
      addFloater(a, size);
    }

    // ── Mini planets (with inner glow) ──
    const planetColors = [0x3a506b, 0x8b5e3c, 0x4a3060, 0x5c7a4a];
    for (let i = 0; i < 3; i++) {
      const r = Phaser.Math.Between(10, 20);
      const x = Phaser.Math.Between(60, 1540);
      const y = Phaser.Math.Between(140, 680);
      const color = Phaser.Math.RND.pick(planetColors);

      // Planet body
      const planet = this.add.circle(x, y, r, color, 0.25);
      // Inner highlight
      this.add.circle(x - r * 0.25, y - r * 0.25, r * 0.35, 0xffffff, 0.12).setDepth(-1);
      addFloater(planet, r, Phaser.Math.FloatBetween(-0.25, 0.25), Phaser.Math.FloatBetween(-0.15, 0.15));
    }

    // ── Tiny alien shapes (triangle head + dot eyes) ──
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(80, 1520);
      const y = Phaser.Math.Between(160, 680);
      const sz = Phaser.Math.Between(8, 14);
      const alienColor = Phaser.Math.RND.pick([0x4eca78, 0x8b7ec8, 0x4a9eff]);

      const gfx = this.add.graphics();
      gfx.setPosition(x, y);
      gfx.setAlpha(Phaser.Math.FloatBetween(0.2, 0.35));

      // Head (triangle)
      gfx.fillStyle(alienColor, 1);
      gfx.fillTriangle(0, -sz, -sz * 0.6, sz * 0.4, sz * 0.6, sz * 0.4);
      // Eyes (two dots)
      gfx.fillStyle(0xffffff, 1);
      gfx.fillCircle(-sz * 0.2, -sz * 0.1, 1.5);
      gfx.fillCircle(sz * 0.2, -sz * 0.1, 1.5);
      // Antennae
      gfx.lineStyle(1, alienColor, 0.8);
      gfx.lineBetween(-sz * 0.3, -sz, -sz * 0.5, -sz * 1.4);
      gfx.lineBetween(sz * 0.3, -sz, sz * 0.5, -sz * 1.4);
      // Antenna tips
      gfx.fillStyle(alienColor, 1);
      gfx.fillCircle(-sz * 0.5, -sz * 1.4, 2);
      gfx.fillCircle(sz * 0.5, -sz * 1.4, 2);

      addFloater(gfx as unknown as Phaser.GameObjects.GameObject & { x: number; y: number; alpha: number }, sz);
    }

    // ── Spaceships (arrow/chevron shapes) ──
    for (let i = 0; i < 2; i++) {
      const x = Phaser.Math.Between(100, 1500);
      const y = Phaser.Math.Between(150, 680);
      const sz = Phaser.Math.Between(10, 16);
      const shipColor = Phaser.Math.RND.pick([0x3a5a8a, 0x5a3a6a, 0x4a6a5a]);

      const gfx = this.add.graphics();
      gfx.setPosition(x, y);
      gfx.setAlpha(Phaser.Math.FloatBetween(0.25, 0.4));

      // Fuselage (diamond/arrow)
      gfx.fillStyle(shipColor, 1);
      gfx.fillTriangle(sz, 0, -sz * 0.6, -sz * 0.5, -sz * 0.6, sz * 0.5);
      // Wings
      gfx.fillStyle(shipColor, 0.7);
      gfx.fillTriangle(-sz * 0.3, -sz * 0.4, -sz * 0.8, -sz * 0.9, -sz * 0.6, -sz * 0.2);
      gfx.fillTriangle(-sz * 0.3, sz * 0.4, -sz * 0.8, sz * 0.9, -sz * 0.6, sz * 0.2);
      // Engine glow
      gfx.fillStyle(0x4a9eff, 0.6);
      gfx.fillCircle(-sz * 0.7, 0, 2.5);

      addFloater(gfx as unknown as Phaser.GameObjects.GameObject & { x: number; y: number; alpha: number }, sz,
        Phaser.Math.FloatBetween(0.3, 0.7), Phaser.Math.FloatBetween(-0.2, 0.2));
    }

    // ── Lightsabers / swords (Star Wars style) ──
    const saberColors = [0x4a9eff, 0xe04060, 0x4eca78, 0x8b7ec8];
    for (let i = 0; i < 4; i++) {
      const x = Phaser.Math.Between(60, 1540);
      const y = Phaser.Math.Between(140, 700);
      const len = Phaser.Math.Between(24, 40);
      const color = saberColors[i];

      const gfx = this.add.graphics();
      gfx.setPosition(x, y);
      gfx.setAlpha(Phaser.Math.FloatBetween(0.25, 0.45));

      // Handle (dark)
      gfx.fillStyle(0x333344, 1);
      gfx.fillRect(-2, 0, 4, 10);
      gfx.fillStyle(0x555566, 1);
      gfx.fillRect(-3, 0, 6, 3);

      // Blade (glowing)
      gfx.fillStyle(color, 1);
      gfx.fillRect(-1.5, -len, 3, len);
      // Blade glow (wider, faint)
      gfx.fillStyle(color, 0.3);
      gfx.fillRect(-3, -len, 6, len);
      // Blade tip
      gfx.fillStyle(0xffffff, 0.8);
      gfx.fillRect(-1, -len - 2, 2, 4);

      // Slow rotation for the saber
      this.tweens.add({
        targets: gfx,
        angle: Phaser.Math.Between(0, 360),
        duration: Phaser.Math.Between(8000, 15000),
        repeat: -1,
        ease: 'none',
      });

      addFloater(gfx as unknown as Phaser.GameObjects.GameObject & { x: number; y: number; alpha: number }, len / 2,
        Phaser.Math.FloatBetween(-0.3, 0.3), Phaser.Math.FloatBetween(-0.2, 0.2));
    }

    this.matter.world.setGravity(0, 6);
  }

  /* ── Retro Arcade HUD ────────────────────────────── */
  private createHUD(): void {
    const { Y, PT_SIZE, PT_PAD } = HUD;

    const hudGfx = this.add.graphics().setDepth(5);

    // ── Dark HUD strip with pixel border ──
    hudGfx.fillStyle(0x08081a, 0.85);
    hudGfx.fillRect(0, 0, 1600, 130);
    // Double pixel border at bottom
    hudGfx.fillStyle(C.PURPLE, 0.3);
    hudGfx.fillRect(0, 128, 1600, 2);
    hudGfx.fillStyle(C.BLUE, 0.15);
    hudGfx.fillRect(0, 132, 1600, 2);

    // ── Decorative corner pixels ──
    const drawCornerPixels = (x: number, y: number, color: number) => {
      hudGfx.fillStyle(color, 0.4);
      for (let i = 0; i < 4; i++) {
        hudGfx.fillRect(x + i * 6, y, 4, 4);
        hudGfx.fillRect(x, y + i * 6, 4, 4);
      }
    };
    drawCornerPixels(4, 4, C.BLUE);
    drawCornerPixels(1572, 4, C.RED);

    // ──────── PLAYER SIDE (LEFT) ────────
    const pPtX = PT_PAD + PT_SIZE / 2;

    // Portrait frame — double pixel border
    hudGfx.fillStyle(0x0a0a16, 1);
    hudGfx.fillRect(pPtX - PT_SIZE / 2, Y - PT_SIZE / 2, PT_SIZE, PT_SIZE);
    hudGfx.lineStyle(3, C.BLUE, 0.7);
    hudGfx.strokeRect(pPtX - PT_SIZE / 2, Y - PT_SIZE / 2, PT_SIZE, PT_SIZE);
    hudGfx.lineStyle(1, C.BLUE, 0.3);
    hudGfx.strokeRect(pPtX - PT_SIZE / 2 - 3, Y - PT_SIZE / 2 - 3, PT_SIZE + 6, PT_SIZE + 6);

    // Portrait image
    const playerPortrait = this.add.image(pPtX, Y + 8, 'player-idle')
      .setDisplaySize(84, 84).setDepth(6);
    const pPortMask = this.make.graphics({});
    pPortMask.fillStyle(0xffffff);
    pPortMask.fillRect(pPtX - PT_SIZE / 2 + 4, Y - PT_SIZE / 2 + 4, PT_SIZE - 8, PT_SIZE - 8);
    playerPortrait.setMask(pPortMask.createGeometryMask());

    // Player name — retro pixel font
    this.add.text(pPtX, Y + PT_SIZE / 2 + 18, 'P1', {
      fontFamily: C.FONT_TITLE, fontSize: '11px', color: '#4a9eff',
    }).setOrigin(0.5).setDepth(6);

    // ── Player hearts (retro Zelda-style, 5 hearts = 5 questions) ──
    const pHeartsX = PT_PAD + PT_SIZE + 30;
    const heartGap = 60;
    this.playerHearts = [];
    for (let i = 0; i < 5; i++) {
      const hx = pHeartsX + i * heartGap;
      const heart = this.add.image(hx, Y, 'heart-full')
        .setDisplaySize(48, 48).setDepth(7);
      this.playerHearts.push(heart);
    }

    // ──────── TIMER (CENTER) — retro square box ────────
    const cx = 800, cy = Y;
    const timerSize = 80;
    hudGfx.fillStyle(0x08081a, 1);
    hudGfx.fillRect(cx - timerSize / 2, cy - timerSize / 2, timerSize, timerSize);
    hudGfx.lineStyle(2, C.GOLD, 0.5);
    hudGfx.strokeRect(cx - timerSize / 2, cy - timerSize / 2, timerSize, timerSize);
    // Inner border
    hudGfx.lineStyle(1, C.GOLD, 0.2);
    hudGfx.strokeRect(cx - timerSize / 2 + 4, cy - timerSize / 2 + 4, timerSize - 8, timerSize - 8);

    this.timerText = this.add.text(cx, cy + 4, '60', {
      fontFamily: C.FONT_TITLE, fontSize: '24px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(8);

    this.add.text(cx, cy - 52, 'TIME', {
      fontFamily: C.FONT_TITLE, fontSize: '9px', color: '#ffd700',
    }).setOrigin(0.5).setDepth(6).setAlpha(0.5);

    // ──────── OPPONENT SIDE (RIGHT) ────────
    const oPtX = 1600 - PT_PAD - PT_SIZE / 2;

    // Portrait frame — double pixel border
    hudGfx.fillStyle(0x0a0a16, 1);
    hudGfx.fillRect(oPtX - PT_SIZE / 2, Y - PT_SIZE / 2, PT_SIZE, PT_SIZE);
    hudGfx.lineStyle(3, C.RED, 0.7);
    hudGfx.strokeRect(oPtX - PT_SIZE / 2, Y - PT_SIZE / 2, PT_SIZE, PT_SIZE);
    hudGfx.lineStyle(1, C.RED, 0.3);
    hudGfx.strokeRect(oPtX - PT_SIZE / 2 - 3, Y - PT_SIZE / 2 - 3, PT_SIZE + 6, PT_SIZE + 6);

    // Portrait image
    const oppPortrait = this.add.image(oPtX, Y + 8, 'opponent-idle')
      .setDisplaySize(84, 84).setDepth(6);
    const oPortMask = this.make.graphics({});
    oPortMask.fillStyle(0xffffff);
    oPortMask.fillRect(oPtX - PT_SIZE / 2 + 4, Y - PT_SIZE / 2 + 4, PT_SIZE - 8, PT_SIZE - 8);
    oppPortrait.setMask(oPortMask.createGeometryMask());

    // Opponent name — retro pixel font
    this.add.text(oPtX, Y + PT_SIZE / 2 + 18, 'CPU', {
      fontFamily: C.FONT_TITLE, fontSize: '11px', color: '#e04060',
    }).setOrigin(0.5).setDepth(6);

    // ── Opponent hearts (right-aligned, 5 hearts = 5 questions) ──
    const oHeartsRight = 1600 - PT_PAD - PT_SIZE - 30;
    const oHeartGap = 60;
    this.opponentHearts = [];
    for (let i = 0; i < 5; i++) {
      const hx = oHeartsRight - i * oHeartGap;
      const heart = this.add.image(hx, Y, 'heart-full')
        .setDisplaySize(48, 48).setDepth(7);
      this.opponentHearts.push(heart);
    }
  }

  /* ── Characters ─────────────────── */
  private createCharacters(): void {
    this.playerSprite = this.add.image(this.PLAYER_X, this.CHARACTER_Y, 'player-idle');
    this.playerSprite.setDisplaySize(256, 256);

    this.opponentSprite = this.add.image(this.OPPONENT_X, this.CHARACTER_Y, 'opponent-idle');
    this.opponentSprite.setDisplaySize(256, 256);

    // Idle bounce (step-based for retro feel)
    this.tweens.add({
      targets: this.playerSprite,
      y: this.CHARACTER_Y - 6,
      duration: 600, yoyo: true, repeat: -1, ease: 'stepped(3)',
    });
    this.tweens.add({
      targets: this.opponentSprite,
      y: this.CHARACTER_Y - 6,
      duration: 700, yoyo: true, repeat: -1, ease: 'stepped(3)', delay: 200,
    });

    // Breathing (subtle scale pulse)
    this.tweens.add({
      targets: this.playerSprite,
      scaleY: 1.018, scaleX: 0.994,
      duration: 1200, yoyo: true, repeat: -1, ease: 'sine.inOut',
    });
    this.tweens.add({
      targets: this.opponentSprite,
      scaleY: 1.018, scaleX: 0.994,
      duration: 1400, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 300,
    });

    // Guard shift (tiny weight-sway rotation)
    this.tweens.add({
      targets: this.playerSprite,
      angle: 1.2,
      duration: 900, yoyo: true, repeat: -1, ease: 'sine.inOut',
    });
    this.tweens.add({
      targets: this.opponentSprite,
      angle: -1.2,
      duration: 1100, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 400,
    });

    // Blinking — swap to blink texture briefly every few seconds
    // Only blink when in an idle state (any damage stage); blink uses base idle-blink
    this.time.addEvent({
      delay: 2500,
      callback: () => {
        const key = this.playerSprite.texture.key;
        if (key.startsWith('player-idle') && !key.endsWith('-blink')) {
          this.playerSprite.setTexture('player-idle-blink');
          this.time.delayedCall(120, () => {
            if (this.playerSprite.texture.key === 'player-idle-blink') {
              this.playerSprite.setTexture(this.getIdleTexture('player', this.playerDamageStage));
            }
          });
        }
      },
      loop: true,
    });
    this.time.addEvent({
      delay: 3200,
      callback: () => {
        const key = this.opponentSprite.texture.key;
        if (key.startsWith('opponent-idle') && !key.endsWith('-blink')) {
          this.opponentSprite.setTexture('opponent-idle-blink');
          this.time.delayedCall(120, () => {
            if (this.opponentSprite.texture.key === 'opponent-idle-blink') {
              this.opponentSprite.setTexture(this.getIdleTexture('opponent', this.opponentDamageStage));
            }
          });
        }
      },
      loop: true,
    });

  }

  /* ── Question UI ────────────────────────────────── */
  private createQuestionUI(): void {
    // Readable font for questions/answers (pixel font is for HUD only)
    const READABLE = "'Space Grotesk', system-ui, sans-serif";

    this.roundText = this.add.text(800, 730, '', {
      fontFamily: C.FONT_TITLE, fontSize: '14px', color: '#ffd700',
    }).setOrigin(0.5);

    this.questionText = this.add.text(800, 780, '', {
      fontFamily: READABLE, fontSize: '30px', color: '#ffffff', fontStyle: 'bold',
      wordWrap: { width: 1340 }, align: 'center', lineSpacing: 6,
    }).setOrigin(0.5, 0);

    const buttonPositions = [
      { x: 420, y: 910 }, { x: 1180, y: 910 },
      { x: 420, y: 1040 }, { x: 1180, y: 1040 },
    ];

    const labels = ['A', 'B', 'C', 'D'];
    const labelColors = [0x4a9eff, 0xe04060, 0x4eca78, 0x8b7ec8];

    for (let i = 0; i < 4; i++) {
      const btn = this.add.text(buttonPositions[i].x, buttonPositions[i].y, '', {
        fontFamily: READABLE, fontSize: '24px', color: '#d0d0e0',
        backgroundColor: '#10102a',
        padding: { x: 32, y: 20 }, fixedWidth: 680,
        wordWrap: { width: 600 }, align: 'center',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerdown', () => { this.onAnswerSelected(i); });
      btn.on('pointerover', () => btn.setStyle({ backgroundColor: '#1a1a40', color: '#ffd700' }));
      btn.on('pointerout', () => btn.setStyle({ backgroundColor: '#10102a', color: '#d0d0e0' }));

      this.answerButtons.push(btn);

      // Colored label badge to the left of button
      const badgeX = buttonPositions[i].x - 316;
      const badge = this.add.graphics().setDepth(5);
      badge.fillStyle(labelColors[i], 0.25);
      badge.fillRect(badgeX - 18, buttonPositions[i].y - 18, 36, 36);
      badge.lineStyle(1, labelColors[i], 0.5);
      badge.strokeRect(badgeX - 18, buttonPositions[i].y - 18, 36, 36);
      this.add.text(badgeX, buttonPositions[i].y, labels[i], {
        fontFamily: C.FONT_TITLE, fontSize: '12px',
        color: '#' + labelColors[i].toString(16).padStart(6, '0'),
      }).setOrigin(0.5).setDepth(6);
    }

    // Decorative border around question area
    const qGfx = this.add.graphics().setDepth(3);
    qGfx.lineStyle(2, C.PURPLE, 0.12);
    qGfx.strokeRect(30, 720, 1540, 440);
    const cornerPx = (cx: number, cy: number) => {
      qGfx.fillStyle(C.GOLD, 0.25);
      qGfx.fillRect(cx, cy, 8, 8);
      qGfx.fillRect(cx + 10, cy, 4, 4);
      qGfx.fillRect(cx, cy + 10, 4, 4);
    };
    cornerPx(30, 720);
    cornerPx(1558, 720);
    cornerPx(30, 1148);
    cornerPx(1558, 1148);

    // ── Explanation panel — sits just below the HUD strip (y=134) ──
    this.explanationBg = this.add.graphics().setDepth(10).setAlpha(0);
    this.explanationBg.fillStyle(0x04040f, 0.97);
    this.explanationBg.fillRect(0, 134, 1600, 166);
    this.explanationBg.lineStyle(2, C.PURPLE, 0.7);
    this.explanationBg.lineBetween(0, 134, 1600, 134);
    this.explanationBg.lineStyle(1, C.BLUE, 0.4);
    this.explanationBg.lineBetween(0, 300, 1600, 300);

    this.explanationText = this.add.text(800, 152, '', {
      fontFamily: READABLE, fontSize: '20px', color: '#e8e6e3',
      wordWrap: { width: 1520 }, align: 'center', lineSpacing: 8,
    }).setOrigin(0.5, 0).setDepth(11).setAlpha(0);

    this.setQuestionUIVisible(false);
  }

  private setQuestionUIVisible(visible: boolean): void {
    this.questionText.setVisible(visible);
    this.roundText.setVisible(visible);
    this.answerButtons.forEach((btn) => btn.setVisible(visible));
  }

  /* ── Timer ───────────────────────────────────────── */
  private startTimer(): void {
    this.timeRemaining = 60;
    this.timerText.setText('60');
    this.timerText.setColor('#e8e6e3');

    if (this.timerEvent) this.timerEvent.destroy();

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeRemaining--;
        this.timerText.setText(String(this.timeRemaining));

        if (this.timeRemaining <= 10) {
          this.timerText.setColor('#e04060');
          // Pulse when critical
          this.tweens.add({
            targets: this.timerText, scaleX: 1.2, scaleY: 1.2,
            duration: 150, yoyo: true, ease: 'power2.out',
          });
        } else if (this.timeRemaining <= 20) {
          this.timerText.setColor('#c9a55c');
        }

        if (this.timeRemaining <= 0) {
          this.onTimerExpired();
        }
      },
      repeat: 59,
    });
  }

  private stopTimer(): void {
    if (this.timerEvent) {
      this.timerEvent.destroy();
      this.timerEvent = undefined;
    }
  }

  private onTimerExpired(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.stopTimer();
    this.answerButtons.forEach((btn) => btn.disableInteractive());
    // Submit -1 → guaranteed wrong answer
    this.battleSystem.submitAnswer(-1);
  }

  private onAnswerSelected(index: number): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.stopTimer();
    this.answerButtons.forEach((btn) => btn.disableInteractive());
    this.battleSystem.submitAnswer(index);
  }

  /* ── Random attack effect picker ─────────────────── */
  private spawnAttackEffect(targetX: number, targetY: number, attackerX: number, color: number): void {
    const effects = [this.effectBoom, this.effectSwordSlash, this.effectLaserShot];
    const pick = Phaser.Math.RND.pick(effects);
    pick.call(this, targetX, targetY, attackerX, color);
  }

  /* ── EFFECT 1: BOOM EXPLOSION ──────────────────── */
  private effectBoom(targetX: number, targetY: number, _attackerX: number, color: number): void {
    // Expanding shockwave rings
    for (let r = 0; r < 3; r++) {
      const ring = this.add.circle(targetX, targetY, 8, color, 0).setDepth(8);
      ring.setStrokeStyle(3 - r, color, 0.8 - r * 0.2);
      this.tweens.add({
        targets: ring,
        scaleX: 8 + r * 4, scaleY: 8 + r * 4,
        alpha: 0,
        duration: 500 + r * 200,
        delay: r * 80,
        ease: 'power2.out',
        onStart: () => ring.setAlpha(1),
        onComplete: () => ring.destroy(),
      });
    }

    // Fire/explosion particles with Matter.js
    const fireColors = [color, 0xff6644, 0xffaa22, 0xffffff, 0xff4422];
    for (let i = 0; i < 20; i++) {
      const size = Phaser.Math.Between(4, 14);
      const pColor = Phaser.Math.RND.pick(fireColors);
      const particle = this.add.circle(
        targetX + Phaser.Math.Between(-20, 20),
        targetY + Phaser.Math.Between(-20, 20),
        size, pColor, 0.9
      ).setDepth(7);

      const body = this.matter.add.gameObject(particle, {
        restitution: 0.3, friction: 0.05, frictionAir: 0.02,
        angle: Phaser.Math.FloatBetween(0, Math.PI * 2),
      });
      const mb = (body as unknown as { body: MatterJS.BodyType }).body;
      this.matter.body.setVelocity(mb, {
        x: Phaser.Math.FloatBetween(-16, 16),
        y: Phaser.Math.FloatBetween(-22, -4),
      });
      this.matter.body.setAngularVelocity(mb, Phaser.Math.FloatBetween(-0.3, 0.3));

      this.tweens.add({
        targets: particle, alpha: 0, scale: 0,
        duration: 800, delay: 300 + Math.random() * 400,
        onComplete: () => { this.matter.world.remove(mb); particle.destroy(); },
      });
    }

    // Central flash
    const flash = this.add.circle(targetX, targetY, 40, 0xffffff, 0).setDepth(9);
    this.tweens.add({
      targets: flash, alpha: 0.7, scale: 2.5,
      duration: 80, ease: 'power4.in',
      onComplete: () => {
        this.tweens.add({
          targets: flash, alpha: 0, scale: 4,
          duration: 300, ease: 'power2.out',
          onComplete: () => flash.destroy(),
        });
      },
    });

    this.cameras.main.shake(300, 0.015);
  }

  /* ── EFFECT 2: SWORD / LIGHTSABER SLASH ────────── */
  private effectSwordSlash(targetX: number, targetY: number, attackerX: number, color: number): void {
    const fromLeft = attackerX < targetX;
    const slashStartX = targetX + (fromLeft ? -120 : 120);
    const slashStartY = targetY - 100;
    const slashEndX = targetX + (fromLeft ? 80 : -80);
    const slashEndY = targetY + 80;

    // Slash line (glowing)
    const slashGfx = this.add.graphics().setDepth(9).setAlpha(0);

    // Main blade line
    slashGfx.lineStyle(6, color, 1);
    slashGfx.lineBetween(slashStartX, slashStartY, slashEndX, slashEndY);
    // Glow line (wider, fainter)
    slashGfx.lineStyle(16, color, 0.3);
    slashGfx.lineBetween(slashStartX, slashStartY, slashEndX, slashEndY);
    // Core (bright white)
    slashGfx.lineStyle(2, 0xffffff, 0.9);
    slashGfx.lineBetween(slashStartX, slashStartY, slashEndX, slashEndY);

    // Flash in
    this.tweens.add({
      targets: slashGfx, alpha: 1,
      duration: 60, ease: 'power4.in',
      onComplete: () => {
        // Fade out
        this.tweens.add({
          targets: slashGfx, alpha: 0,
          duration: 300, ease: 'power2.out',
          onComplete: () => slashGfx.destroy(),
        });
      },
    });

    // Sparks along the slash path
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const sx = slashStartX + (slashEndX - slashStartX) * t;
      const sy = slashStartY + (slashEndY - slashStartY) * t;
      const spark = this.add.circle(
        sx + Phaser.Math.Between(-8, 8),
        sy + Phaser.Math.Between(-8, 8),
        Phaser.Math.Between(2, 5),
        Phaser.Math.RND.pick([color, 0xffffff, 0xffcc44]),
        0.9
      ).setDepth(8);

      this.tweens.add({
        targets: spark,
        x: spark.x + Phaser.Math.Between(-60, 60),
        y: spark.y + Phaser.Math.Between(-80, 40),
        alpha: 0, scale: 0,
        duration: 300 + Math.random() * 400,
        delay: 40 + i * 15,
        ease: 'power2.out',
        onComplete: () => spark.destroy(),
      });
    }

    // Impact debris (smaller set)
    for (let i = 0; i < 8; i++) {
      const size = Phaser.Math.Between(4, 10);
      const shard = this.add.triangle(
        targetX + Phaser.Math.Between(-20, 20),
        targetY + Phaser.Math.Between(-20, 20),
        0, -size, -size * 0.5, size * 0.4, size * 0.5, size * 0.4,
        color, 0.8
      ).setDepth(7);

      const body = this.matter.add.gameObject(shard, {
        restitution: 0.5, friction: 0.1, frictionAir: 0.012,
      });
      const mb = (body as unknown as { body: MatterJS.BodyType }).body;
      this.matter.body.setVelocity(mb, {
        x: Phaser.Math.FloatBetween(fromLeft ? 2 : -14, fromLeft ? 14 : -2),
        y: Phaser.Math.FloatBetween(-18, -5),
      });
      this.matter.body.setAngularVelocity(mb, Phaser.Math.FloatBetween(-0.25, 0.25));

      this.tweens.add({
        targets: shard, alpha: 0,
        duration: 1000, delay: 500,
        onComplete: () => { this.matter.world.remove(mb); shard.destroy(); },
      });
    }

    this.cameras.main.shake(250, 0.012);
  }

  /* ── EFFECT 3: LASER / ENERGY SHOT ─────────────── */
  private effectLaserShot(targetX: number, targetY: number, attackerX: number, color: number): void {
    const fromLeft = attackerX < targetX;
    const startX = attackerX + (fromLeft ? 60 : -60);
    const startY = targetY - 10;

    // Energy projectile
    const projectile = this.add.ellipse(startX, startY, 30, 10, color, 0.9).setDepth(9);
    const projectileGlow = this.add.ellipse(startX, startY, 50, 20, color, 0.3).setDepth(8);

    // Trail behind projectile
    const trail = this.add.graphics().setDepth(7).setAlpha(0.5);

    // Animate projectile flying to target
    const duration = 250;
    this.tweens.add({
      targets: [projectile, projectileGlow],
      x: targetX,
      duration,
      ease: 'power2.in',
      onUpdate: () => {
        trail.fillStyle(color, 0.15);
        trail.fillEllipse(projectile.x, projectile.y, 20, 8);
      },
      onComplete: () => {
        projectile.destroy();
        projectileGlow.destroy();

        // Fade trail
        this.tweens.add({
          targets: trail, alpha: 0,
          duration: 400, onComplete: () => trail.destroy(),
        });

        // Impact burst at target
        for (let i = 0; i < 14; i++) {
          const spark = this.add.circle(
            targetX + Phaser.Math.Between(-15, 15),
            targetY + Phaser.Math.Between(-20, 20),
            Phaser.Math.Between(2, 6),
            Phaser.Math.RND.pick([color, 0xffffff, 0xffcc44]),
            0.9
          ).setDepth(8);

          this.tweens.add({
            targets: spark,
            x: spark.x + Phaser.Math.Between(-100, 100),
            y: spark.y + Phaser.Math.Between(-80, 60),
            alpha: 0, scale: 0,
            duration: 400 + Math.random() * 300,
            ease: 'power2.out',
            onComplete: () => spark.destroy(),
          });
        }

        // Impact flash ring
        const impactRing = this.add.circle(targetX, targetY, 10, color, 0).setDepth(9);
        impactRing.setStrokeStyle(2, 0xffffff, 0.8);
        this.tweens.add({
          targets: impactRing,
          scaleX: 6, scaleY: 6, alpha: 0,
          duration: 400, ease: 'power2.out',
          onStart: () => impactRing.setAlpha(1),
          onComplete: () => impactRing.destroy(),
        });

        // Small matter debris on impact
        for (let i = 0; i < 6; i++) {
          const size = Phaser.Math.Between(4, 10);
          const rect = this.add.rectangle(
            targetX + Phaser.Math.Between(-15, 15),
            targetY + Phaser.Math.Between(-20, 10),
            size, size, color
          ).setAlpha(0.8).setDepth(7);

          const body = this.matter.add.gameObject(rect, {
            restitution: 0.4, friction: 0.1, frictionAir: 0.02,
          });
          const mb = (body as unknown as { body: MatterJS.BodyType }).body;
          this.matter.body.setVelocity(mb, {
            x: Phaser.Math.FloatBetween(-10, 10),
            y: Phaser.Math.FloatBetween(-16, -4),
          });

          this.tweens.add({
            targets: rect, alpha: 0,
            duration: 1000, delay: 500,
            onComplete: () => { this.matter.world.remove(mb); rect.destroy(); },
          });
        }

        this.cameras.main.shake(200, 0.01);
      },
    });
  }

  private screenShake(): void {
    this.cameras.main.shake(200, 0.008);
  }

  /* ── Event subscriptions ─────────────────────────── */
  private subscribeToEvents(): void {
    eventBus.on(GameEventType.BATTLE_START, () => {
      this.playerDamageStage = 0;
      this.opponentDamageStage = 0;
      this.playerSprite.setTexture('player-idle');
      this.opponentSprite.setTexture('opponent-idle');
      this.setQuestionUIVisible(false);
      this.time.delayedCall(1500, () => {
        this.battleSystem.showNextQuestion();
      });
    });

    eventBus.on(GameEventType.QUESTION_SHOW, (...args: unknown[]) => {
      const payload = args[0] as { question: MCQ; questionIndex: number };
      this.showQuestion(payload.question, payload.questionIndex);
    });

    eventBus.on(GameEventType.ANSWER_CORRECT, (...args: unknown[]) => {
      const payload = args[0] as { questionId: string; selectedIndex: number };
      soundManager.play('correct');
      if (payload.selectedIndex >= 0 && payload.selectedIndex < 4) {
        this.answerButtons[payload.selectedIndex].setStyle({ backgroundColor: '#1a5a2a', color: '#4eca78' });
      }

      // Show explanation panel below HUD immediately
      if (this.currentQuestion) {
        const LABELS = ['A', 'B', 'C', 'D'];
        const label = payload.selectedIndex >= 0 ? LABELS[payload.selectedIndex] : '';
        const optText = payload.selectedIndex >= 0 ? `"${this.currentQuestion.options[payload.selectedIndex]}"` : '';
        const firstLine = label
          ? `✓  Option ${label} is Correct!   ${optText}`
          : '✓  Correct!';
        this.explanationText.setColor('#4eca78');
        this.explanationText.setText(`${firstLine}\n${this.currentQuestion.explanation}`);
        this.tweens.killTweensOf([this.explanationBg, this.explanationText]);
        this.tweens.add({ targets: [this.explanationBg, this.explanationText], alpha: 1, duration: 400, ease: 'power2.out' });
      }
    });

    eventBus.on(GameEventType.ANSWER_WRONG, (...args: unknown[]) => {
      const payload = args[0] as { questionId: string; selectedIndex: number; correctIndex: number };
      soundManager.play('wrong');
      // Guard for timer-expired (-1 index)
      if (payload.selectedIndex >= 0 && payload.selectedIndex < 4) {
        this.answerButtons[payload.selectedIndex].setStyle({ backgroundColor: '#5a1a2a', color: '#ff6080' });
      }
      this.answerButtons[payload.correctIndex].setStyle({ backgroundColor: '#1a5a2a', color: '#4eca78' });
    });

    eventBus.on(GameEventType.ATTACK_PLAYER, async (...args: unknown[]) => {
      const hpData = args[0] as { character: 'player' | 'opponent'; newHp: number; maxHp: number };

      // 1. Play attack animation
      this.playerSprite.setTexture('player-attack');
      await this.animRunner.runAnimation(this, this.playerSprite, 'playerAttack');

      // 2. Hit lands — NOW update HP bar
      this.opponentSprite.setTexture('opponent-hit');
      soundManager.play('attackHit');
      this.spawnAttackEffect(this.OPPONENT_X, this.CHARACTER_Y, this.PLAYER_X, C.BLUE);
      this.screenShake();
      this.updateHealthBar(hpData);

      // 3. Hit reaction
      await this.animRunner.runAnimation(this, this.opponentSprite, 'takeHit');
      this.playerSprite.setTexture(this.getIdleTexture('player', this.playerDamageStage));
      this.opponentSprite.setTexture(this.getIdleTexture('opponent', this.opponentDamageStage));
      this.advanceAfterResolve();
    });

    eventBus.on(GameEventType.ATTACK_OPPONENT, async (...args: unknown[]) => {
      const hpData = args[0] as { character: 'player' | 'opponent'; newHp: number; maxHp: number };

      // 1. Play attack animation
      this.opponentSprite.setTexture('opponent-attack');
      await this.animRunner.runAnimation(this, this.opponentSprite, 'opponentAttack');

      // 2. Hit lands — NOW update HP bar
      this.playerSprite.setTexture('player-hit');
      soundManager.play('attackHit');
      this.spawnAttackEffect(this.PLAYER_X, this.CHARACTER_Y, this.OPPONENT_X, C.RED);
      this.screenShake();
      this.updateHealthBar(hpData);

      // 3. Hit reaction
      await this.animRunner.runAnimation(this, this.playerSprite, 'takeHit');
      this.opponentSprite.setTexture(this.getIdleTexture('opponent', this.opponentDamageStage));
      this.playerSprite.setTexture(this.getIdleTexture('player', this.playerDamageStage));
    });

    eventBus.on(GameEventType.SHOW_EXPLANATION, (...args: unknown[]) => {
      const payload = args[0] as { explanation: string; correctIndex: number; selectedIndex: number };
      const LABELS = ['A', 'B', 'C', 'D'];
      const q = this.currentQuestion;

      let firstLine: string;
      if (q) {
        const correctLabel = LABELS[payload.correctIndex];
        const correctOptText = q.options[payload.correctIndex];
        if (payload.selectedIndex >= 0) {
          const wrongLabel = LABELS[payload.selectedIndex];
          firstLine = `✗  Option ${wrongLabel} is wrong   ·   ✓  Correct: Option ${correctLabel} — "${correctOptText}"`;
        } else {
          // Timer expired
          firstLine = `✗  Time's up!   ·   ✓  Correct: Option ${correctLabel} — "${correctOptText}"`;
        }
      } else {
        firstLine = `✓  Correct: Option ${LABELS[payload.correctIndex]}`;
      }

      this.explanationText.setColor('#ff8888');
      this.explanationText.setText(`${firstLine}\n${payload.explanation}`);
      this.tweens.killTweensOf([this.explanationBg, this.explanationText]);
      this.tweens.add({ targets: [this.explanationBg, this.explanationText], alpha: 1, duration: 300, ease: 'power2.out' });

      this.time.delayedCall(1500, () => {
        this.tweens.add({
          targets: [this.explanationBg, this.explanationText], alpha: 0, duration: 300, ease: 'power2.in',
          onComplete: () => this.advanceAfterResolve(),
        });
      });
    });

    eventBus.on(GameEventType.VICTORY, (...args: unknown[]) => {
      const payload = args[0] as { score: number; totalQuestions: number };
      this.playerSprite.setTexture('player-victory');
      this.stopTimer();
      // Drain opponent HP bar to 0 for visual finality
      this.updateHealthBar({ character: 'opponent', newHp: 0, maxHp: 100 });
      this.time.delayedCall(1400, () => {
        this.cameras.main.fadeOut(500, 5, 5, 8);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('VictoryScene', payload);
        });
      });
    });

    eventBus.on(GameEventType.DEFEAT, (...args: unknown[]) => {
      const payload = args[0] as { score: number; totalQuestions: number; missed: unknown[] };
      this.stopTimer();
      // Drain player HP bar to 0 for visual finality
      this.updateHealthBar({ character: 'player', newHp: 0, maxHp: 100 });
      this.time.delayedCall(1400, () => {
        this.cameras.main.fadeOut(500, 5, 5, 8);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start('DefeatScene', payload);
        });
      });
    });
  }

  /* ── Show a question with stagger animations ─────── */
  private showQuestion(question: MCQ, questionIndex: number): void {
    this.currentQuestion = question;

    // Hide explanation panel before showing next question
    this.tweens.killTweensOf([this.explanationBg, this.explanationText]);
    this.explanationBg.setAlpha(0);
    this.explanationText.setAlpha(0);
    this.explanationText.setText('');

    this.setQuestionUIVisible(true);
    this.startTimer();

    this.roundText.setText(`ROUND ${questionIndex + 1}`);
    this.roundText.setAlpha(0);
    this.tweens.add({ targets: this.roundText, alpha: 1, duration: 400, ease: 'power2.out' });

    this.questionText.setText(question.question);
    this.questionText.setAlpha(0);
    this.tweens.add({ targets: this.questionText, alpha: 1, duration: 400, ease: 'power2.out', delay: 100 });

    question.options.forEach((option, i) => {
      this.answerButtons[i].setText(option);
      this.answerButtons[i].setStyle({ backgroundColor: '#10102a', color: '#d0d0e0' });
      this.answerButtons[i].setInteractive({ useHandCursor: true });
      this.answerButtons[i].setAlpha(0);
      this.tweens.add({
        targets: this.answerButtons[i], alpha: 1,
        duration: 300, ease: 'power2.out', delay: 200 + i * 80,
      });
    });
    this.isAnimating = false;
  }

  /** Returns the correct idle texture key for the given character and damage stage. */
  private getIdleTexture(character: 'player' | 'opponent', stage: number): string {
    const prefix = character === 'player' ? 'player' : 'opponent';
    if (stage >= 2) return `${prefix}-idle-headonly`;
    if (stage >= 1) return `${prefix}-idle-noarms`;
    return `${prefix}-idle`;
  }

  private updateHealthBar(payload: { character: 'player' | 'opponent'; newHp: number; maxHp: number }): void {
    const hearts = payload.character === 'player' ? this.playerHearts : this.opponentHearts;
    const fullCount = Math.ceil(payload.newHp / 20); // 5 hearts, each = 20 HP

    // Swap heart textures with a pop animation for newly emptied hearts
    for (let i = 0; i < hearts.length; i++) {
      const shouldBeFull = i < fullCount;
      const key = shouldBeFull ? 'heart-full' : 'heart-empty';
      if (hearts[i].texture.key !== key) {
        hearts[i].setTexture(key);
        // Pop + shake on the heart that just broke
        if (!shouldBeFull) {
          this.tweens.add({
            targets: hearts[i],
            scaleX: 1.6, scaleY: 1.6,
            duration: 100, yoyo: true, ease: 'back.out(2)',
            onComplete: () => {
              this.tweens.add({
                targets: hearts[i],
                scaleX: 1, scaleY: 1,
                duration: 200, ease: 'power2.out',
              });
            },
          });
        }
      }
    }

    // ── Body-part-loss: determine damage stage from HP ──
    // Stage 0: 60-100 HP (normal)   Stage 1: 20-40 HP (no arms)   Stage 2: 0 HP (head only)
    let newStage = 0;
    if (payload.newHp <= 0) newStage = 2;
    else if (payload.newHp <= 40) newStage = 1;

    const stageField = payload.character === 'player' ? 'playerDamageStage' : 'opponentDamageStage';
    const sprite = payload.character === 'player' ? this.playerSprite : this.opponentSprite;

    if (newStage !== this[stageField]) {
      this[stageField] = newStage;
      const idleKey = this.getIdleTexture(payload.character, newStage);

      // Flash white then swap to damaged texture
      this.tweens.add({
        targets: sprite,
        alpha: 0.3,
        duration: 80,
        yoyo: true,
        repeat: 2,
        ease: 'stepped(1)',
        onComplete: () => {
          sprite.setTexture(idleKey);
          sprite.setAlpha(1);
        },
      });
    }
  }

  private advanceAfterResolve(): void {
    // Check game-over AFTER animations have finished
    if (this.battleSystem.checkGameOver()) return;
    this.time.delayedCall(500, () => {
      this.battleSystem.showNextQuestion();
    });
  }
}
