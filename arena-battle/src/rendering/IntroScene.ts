import Phaser from 'phaser';

const FONT_TITLE = "'Orbitron', 'Space Grotesk', system-ui, sans-serif";
const FONT = "'Space Grotesk', system-ui, sans-serif";

/**
 * Dramatic VS intro screen — fighting-game style character reveal
 * before the battle begins. Transparent canvas lets React starfield through.
 */
export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
  }

  create(): void {
    const W = 1600;
    const H = 1200;
    const cx = W / 2;
    const cy = H / 2 - 40;

    // ── Dramatic diagonal slash background ──
    const slash = this.add.graphics().setDepth(0);
    slash.fillStyle(0x4a9eff, 0.04);
    slash.fillTriangle(0, 0, W, 0, 0, H);
    slash.fillStyle(0xe04060, 0.04);
    slash.fillTriangle(W, 0, W, H, 0, H);

    // ── Center divider line (vertical slash) ──
    const divider = this.add.graphics().setDepth(3).setAlpha(0);
    divider.lineStyle(3, 0xffffff, 0.15);
    divider.lineBetween(cx, 0, cx, H);

    // ── Player character (starts off-screen left) ──
    const player = this.add.image(-300, cy, 'player-idle')
      .setDisplaySize(360, 360).setDepth(2);

    // ── Opponent character (starts off-screen right) ──
    const opponent = this.add.image(W + 300, cy, 'opponent-idle')
      .setDisplaySize(360, 360).setDepth(2);

    // ── Glowing platforms under characters ──
    const playerPlatform = this.add.ellipse(440, cy + 200, 300, 50, 0x4a9eff, 0.12)
      .setDepth(1).setAlpha(0);
    const opponentPlatform = this.add.ellipse(W - 440, cy + 200, 300, 50, 0xe04060, 0.12)
      .setDepth(1).setAlpha(0);

    // ── VS text (huge, slams in) ──
    const vsText = this.add.text(cx, cy - 20, 'VS', {
      fontFamily: FONT_TITLE,
      fontSize: '200px',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 20,
    }).setOrigin(0.5).setDepth(4).setAlpha(0).setScale(3);

    // ── Character names ──
    const playerName = this.add.text(440, cy + 270, 'PLAYER', {
      fontFamily: FONT_TITLE,
      fontSize: '28px',
      color: '#4a9eff',
      letterSpacing: 10,
    }).setOrigin(0.5).setDepth(3).setAlpha(0);

    const opponentName = this.add.text(W - 440, cy + 270, 'OPPONENT', {
      fontFamily: FONT_TITLE,
      fontSize: '28px',
      color: '#e04060',
      letterSpacing: 10,
    }).setOrigin(0.5).setDepth(3).setAlpha(0);

    // ── "GET READY" text ──
    const readyText = this.add.text(cx, H - 200, 'GET READY FOR BATTLE', {
      fontFamily: FONT,
      fontSize: '22px',
      color: '#ffffff',
      letterSpacing: 8,
    }).setOrigin(0.5).setDepth(3).setAlpha(0);

    // ── Lightsaber slash graphics (decorative) ──
    const saberGfx = this.add.graphics().setDepth(3).setAlpha(0);
    saberGfx.lineStyle(4, 0x4a9eff, 0.6);
    saberGfx.lineBetween(200, cy - 200, 600, cy + 100);
    saberGfx.lineStyle(4, 0xe04060, 0.6);
    saberGfx.lineBetween(W - 200, cy - 200, W - 600, cy + 100);

    // ════════════════════════════════════════════════
    //  ANIMATION SEQUENCE (delayed tweens)
    // ════════════════════════════════════════════════

    // 0.2s — Characters slide in
    this.tweens.add({
      targets: player, x: 440,
      duration: 800, ease: 'back.out(1.2)', delay: 200,
    });
    this.tweens.add({
      targets: opponent, x: W - 440,
      duration: 800, ease: 'back.out(1.2)', delay: 200,
    });

    // 0.6s — Platforms fade in
    this.tweens.add({
      targets: [playerPlatform, opponentPlatform],
      alpha: 1, duration: 400, ease: 'power2.out', delay: 600,
    });

    // 0.8s — Divider appears
    this.tweens.add({
      targets: divider, alpha: 1,
      duration: 300, ease: 'power2.out', delay: 800,
    });

    // 1.0s — VS SLAMS in
    this.tweens.add({
      targets: vsText, alpha: 1, scale: 1,
      duration: 400, ease: 'back.out(2)', delay: 1000,
      onComplete: () => {
        this.cameras.main.shake(250, 0.012);
        // Spark explosion
        for (let i = 0; i < 24; i++) {
          const spark = this.add.circle(
            cx + Phaser.Math.Between(-60, 60),
            cy + Phaser.Math.Between(-80, 40),
            Phaser.Math.Between(2, 6),
            Phaser.Math.RND.pick([0x4a9eff, 0xe04060, 0xffffff]),
            0.9
          ).setDepth(5);
          this.tweens.add({
            targets: spark,
            x: spark.x + Phaser.Math.Between(-150, 150),
            y: spark.y + Phaser.Math.Between(-100, 150),
            alpha: 0, scale: 0,
            duration: 500 + Math.random() * 500,
            ease: 'power2.out',
          });
        }
      },
    });

    // 1.2s — Saber slashes flash
    this.tweens.add({
      targets: saberGfx, alpha: 1,
      duration: 150, ease: 'power2.out', delay: 1200,
    });
    this.tweens.add({
      targets: saberGfx, alpha: 0,
      duration: 500, ease: 'power2.in', delay: 1500,
    });

    // 1.3s — Names appear
    this.tweens.add({
      targets: playerName, alpha: 1, y: cy + 260,
      duration: 400, ease: 'power2.out', delay: 1300,
    });
    this.tweens.add({
      targets: opponentName, alpha: 1, y: cy + 260,
      duration: 400, ease: 'power2.out', delay: 1300,
    });

    // 1.8s — GET READY
    this.tweens.add({
      targets: readyText, alpha: 0.6,
      duration: 500, ease: 'power2.out', delay: 1800,
    });

    // 2.5s — VS pulse
    this.tweens.add({
      targets: vsText, scale: 1.1,
      duration: 300, yoyo: true, ease: 'sine.inOut', delay: 2500,
    });

    // 4.0s — Second VS pulse for emphasis
    this.tweens.add({
      targets: vsText, scale: 1.15,
      duration: 250, yoyo: true, ease: 'back.out(2)', delay: 4000,
      onComplete: () => {
        this.cameras.main.shake(150, 0.008);
      },
    });

    // ── Looping animations ──
    // Breathing
    this.tweens.add({
      targets: player, y: cy - 6,
      duration: 2000, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1000,
    });
    this.tweens.add({
      targets: opponent, y: cy - 6,
      duration: 2200, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1200,
    });

    // VS glow pulse
    this.tweens.add({
      targets: vsText, alpha: 0.6,
      duration: 800, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1500,
    });

    // Ready blink
    this.tweens.add({
      targets: readyText, alpha: 0.2,
      duration: 600, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2300,
    });

    // ── Transition to BattleScene after 6s ──
    this.time.delayedCall(6000, () => {
      // Flash
      const flash = this.add.rectangle(cx, H / 2, W, H, 0xffffff, 0).setDepth(10);
      this.tweens.add({
        targets: flash, alpha: 0.25,
        duration: 120, ease: 'power4.in',
        onComplete: () => {
          this.tweens.add({
            targets: flash, alpha: 0,
            duration: 300, ease: 'power2.out',
          });
        },
      });

      // Fade out
      this.cameras.main.fadeOut(600, 5, 5, 8);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('BattleScene');
      });
    });
  }
}
