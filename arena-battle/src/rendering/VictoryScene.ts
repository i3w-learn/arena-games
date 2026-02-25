import Phaser from 'phaser';
import { soundManager } from './SoundManager';

const FONT = "'Space Grotesk', system-ui, sans-serif";
const FONT_TITLE = "'Orbitron', 'Space Grotesk', system-ui, sans-serif";

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  create(data: { score: number; totalQuestions: number }): void {
    const score = data?.score ?? 0;
    const total = data?.totalQuestions ?? 5;

    // Smooth fade in (transparent — React starfield shows through)
    this.cameras.main.fadeIn(600, 5, 5, 8);

    // Victory title
    const title = this.add.text(800, 260, 'VICTORY', {
      fontFamily: FONT_TITLE,
      fontSize: '112px',
      color: '#4eca78',
      fontStyle: 'bold',
      letterSpacing: 16,
    }).setOrigin(0.5);

    // Subtle pulse
    this.tweens.add({
      targets: title,
      alpha: 0.7,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    });

    // Score
    this.add.text(800, 440, `${score} / ${total}`, {
      fontFamily: FONT_TITLE,
      fontSize: '84px',
      color: '#e8e6e3',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(800, 520, 'CORRECT ANSWERS', {
      fontFamily: FONT,
      fontSize: '22px',
      color: '#666680',
      letterSpacing: 8,
    }).setOrigin(0.5);

    // Encouragement
    const message = score === total ? 'PERFECT SCORE!' :
                    score >= 4 ? 'EXCELLENT WORK!' :
                    'WELL DONE!';
    this.add.text(800, 640, message, {
      fontFamily: FONT,
      fontSize: '40px',
      color: '#8b7ec8',
      letterSpacing: 6,
    }).setOrigin(0.5);

    // Play again button
    const btnBg = this.add.rectangle(800, 860, 480, 104, 0x0a0a0f)
      .setStrokeStyle(2, 0x4eca78, 0.4)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(800, 860, 'PLAY AGAIN', {
      fontFamily: FONT_TITLE,
      fontSize: '28px',
      color: '#4eca78',
      letterSpacing: 8,
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x4eca78, 0.1);
    });
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x0a0a0f);
    });
    btnBg.on('pointerdown', () => {
      soundManager.play('buttonTap');
      this.cameras.main.fadeOut(400, 5, 5, 8);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('BattleScene');
      });
    });

    // Entrance animations
    [title, btnText, btnBg].forEach((obj, i) => {
      obj.setAlpha(0);
      this.tweens.add({
        targets: obj,
        alpha: 1,
        y: (obj as Phaser.GameObjects.Text).y,
        duration: 600,
        delay: 300 + i * 200,
        ease: 'back.out(1.4)',
      });
    });

    // Confetti celebration!
    this.spawnConfetti();
    this.time.addEvent({
      delay: 2500,
      callback: () => this.spawnConfetti(),
      repeat: 3,
    });
  }

  private spawnConfetti(): void {
    const colors = [0x4eca78, 0x4a9eff, 0xffd700, 0xe04060, 0x8b7ec8, 0xff6644, 0xffffff];

    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(50, 1550);
      const y = Phaser.Math.Between(-300, -20);
      const color = Phaser.Math.RND.pick(colors);

      // Mix of rectangles (confetti strips) and circles (dots)
      let piece: Phaser.GameObjects.Shape;
      if (Math.random() > 0.4) {
        const w = Phaser.Math.Between(4, 10);
        const h = Phaser.Math.Between(10, 22);
        piece = this.add.rectangle(x, y, w, h, color, 0.9);
      } else {
        const r = Phaser.Math.Between(3, 7);
        piece = this.add.circle(x, y, r, color, 0.9);
      }

      piece.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
      piece.setDepth(-1);

      this.tweens.add({
        targets: piece,
        y: 1300 + Phaser.Math.Between(0, 200),
        x: piece.x + Phaser.Math.Between(-180, 180),
        rotation: piece.rotation + Phaser.Math.FloatBetween(-8, 8),
        alpha: { from: 0.9, to: 0 },
        duration: Phaser.Math.Between(2500, 5000),
        delay: Phaser.Math.Between(0, 1500),
        ease: 'sine.in',
        onComplete: () => piece.destroy(),
      });
    }
  }
}
