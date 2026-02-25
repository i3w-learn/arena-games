import Phaser from 'phaser';

/* ──────────────────────────────────────────────────────────
 *  Character generator — 256×256 smooth shapes via Phaser
 *  Graphics, converted to textures for BattleScene.
 * ────────────────────────────────────────────────────────── */

const SZ = 256; // texture size

// ── helpers ──
function fill(g: Phaser.GameObjects.Graphics, c: number, a = 1) { g.fillStyle(c, a); }
function line(g: Phaser.GameObjects.Graphics, c: number, w: number, a = 1) { g.lineStyle(w, c, a); }

function circle(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, c: number, a = 1) {
  fill(g, c, a); g.fillCircle(x, y, r);
}
function ellipse(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, c: number, a = 1) {
  fill(g, c, a); g.fillEllipse(x, y, w, h);
}
function rect(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, c: number, a = 1) {
  fill(g, c, a); g.fillRect(x, y, w, h);
}
function rrect(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, r: number, c: number, a = 1) {
  fill(g, c, a); g.fillRoundedRect(x, y, w, h, r);
}
function tri(g: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, c: number, a = 1) {
  fill(g, c, a); g.fillTriangle(x1, y1, x2, y2, x3, y3);
}
function strokeCirc(g: Phaser.GameObjects.Graphics, x: number, y: number, r: number, c: number, w: number, a = 1) {
  line(g, c, w, a); g.strokeCircle(x, y, r);
}

/* ═══════════════════════════════════════════════════════════
 *  PLAYER  — Blue martial-arts fighter, faces RIGHT
 * ═══════════════════════════════════════════════════════════ */

function drawPlayerIdle(g: Phaser.GameObjects.Graphics) {
  // Shadow
  ellipse(g, 128, 244, 90, 16, 0x000000, 0.3);

  // ── BACK LEG (left leg, further away) ──
  rrect(g, 88, 172, 22, 56, 6, 0x9090a0);     // pant
  rrect(g, 86, 222, 26, 16, 4, 0x333333);      // shoe

  // ── FRONT LEG (right leg, forward) ──
  rrect(g, 120, 168, 24, 58, 6, 0xe0e0e8);
  rrect(g, 118, 220, 28, 16, 4, 0x333333);

  // ── BELT ──
  rrect(g, 82, 164, 68, 10, 3, 0x222222);

  // ── BACK ARM (guard up near face) ──
  rrect(g, 68, 92, 18, 50, 8, 0x1a4a8a);       // sleeve
  circle(g, 68, 84, 12, 0xc8956a);              // fist
  rrect(g, 58, 80, 20, 8, 3, 0xcccccc, 0.6);   // wrap

  // ── TORSO ──
  rrect(g, 80, 84, 60, 82, 8, 0x4a9eff);        // gi body
  rrect(g, 84, 88, 20, 50, 4, 0x7ec8ff, 0.25);  // left highlight
  rrect(g, 128, 84, 12, 70, 4, 0x1a4a8a, 0.4);  // right shadow
  // Gi lapel V
  tri(g, 108, 86, 114, 86, 111, 130, 0x7ec8ff, 0.3);

  // ── FRONT ARM (fist forward, guard) ──
  rrect(g, 140, 94, 46, 18, 8, 0x4a9eff);       // sleeve
  circle(g, 192, 100, 14, 0xf0c090);             // fist
  rrect(g, 182, 92, 20, 8, 3, 0xcccccc, 0.6);   // wrap

  // ── SHOULDERS ──
  ellipse(g, 84, 88, 24, 18, 0x1a4a8a, 0.6);
  ellipse(g, 140, 86, 28, 20, 0x4a9eff);

  // ── NECK ──
  rrect(g, 102, 62, 24, 24, 6, 0xf0c090);

  // ── HEAD ──
  ellipse(g, 118, 44, 50, 52, 0xf0c090);        // head shape
  ellipse(g, 134, 46, 14, 40, 0xb87a50, 0.25);  // face shadow right

  // ── HAIR (spiky) ──
  ellipse(g, 112, 22, 44, 20, 0x222222);
  tri(g, 130, 20, 136, 6, 142, 22, 0x222222);   // spike right
  tri(g, 120, 18, 124, 4, 130, 20, 0x222222);   // spike mid
  tri(g, 140, 24, 148, 14, 146, 28, 0x222222);  // spike far

  // ── HEADBAND ──
  rrect(g, 90, 30, 56, 10, 4, 0x4a9eff);
  // Tail flowing back
  tri(g, 92, 32, 72, 40, 78, 32, 0x4a9eff, 0.8);
  tri(g, 78, 34, 58, 48, 66, 36, 0x4a9eff, 0.5);

  // ── FACE ──
  // Eye
  ellipse(g, 134, 44, 14, 10, 0xffffff);
  circle(g, 137, 44, 4, 0x222222);
  circle(g, 138, 43, 1.5, 0xffffff);
  // Eyebrow
  rect(g, 128, 36, 16, 4, 0x222222, 0.8);
  // Mouth
  rrect(g, 130, 56, 12, 4, 2, 0xb87a50, 0.5);

  // Ear
  ellipse(g, 94, 46, 8, 12, 0xc8956a, 0.6);
}

function drawPlayerIdleBlink(g: Phaser.GameObjects.Graphics) {
  drawPlayerIdle(g);
  // Cover open eye with skin tone, draw closed eye
  ellipse(g, 134, 44, 16, 12, 0xf0c090);
  rect(g, 128, 44, 14, 2, 0x222222, 0.6);
  rect(g, 128, 36, 16, 4, 0x222222, 0.8); // eyebrow
}

function drawPlayerAttack(g: Phaser.GameObjects.Graphics) {
  ellipse(g, 140, 244, 100, 16, 0x000000, 0.3);

  // Back leg (pushing off)
  rrect(g, 70, 178, 20, 50, 6, 0x9090a0);
  rrect(g, 66, 222, 26, 16, 4, 0x333333);

  // Front leg (lunging)
  rrect(g, 130, 168, 26, 58, 6, 0xe0e0e8);
  rrect(g, 130, 220, 30, 16, 4, 0x333333);

  rrect(g, 72, 166, 80, 10, 3, 0x222222);

  // Back arm (pulled back)
  rrect(g, 52, 100, 16, 30, 8, 0x1a4a8a);
  circle(g, 52, 92, 11, 0xc8956a);

  // Torso (leaning forward)
  rrect(g, 76, 82, 64, 84, 8, 0x4a9eff);
  rrect(g, 80, 86, 18, 50, 4, 0x7ec8ff, 0.25);
  tri(g, 106, 84, 112, 84, 109, 128, 0x7ec8ff, 0.3);

  // FRONT ARM — PUNCHING RIGHT
  rrect(g, 140, 88, 70, 18, 8, 0x4a9eff);
  circle(g, 218, 96, 16, 0xf0c090);             // fist
  rrect(g, 208, 88, 22, 8, 3, 0xcccccc, 0.6);

  // Punch energy
  strokeCirc(g, 228, 96, 20, 0x4a9eff, 3, 0.5);
  strokeCirc(g, 228, 96, 28, 0x4a9eff, 2, 0.3);
  // Speed lines
  rect(g, 150, 86, 40, 2, 0x4a9eff, 0.3);
  rect(g, 155, 98, 40, 2, 0x4a9eff, 0.25);
  rect(g, 152, 106, 35, 2, 0x4a9eff, 0.2);

  ellipse(g, 82, 86, 22, 18, 0x1a4a8a, 0.6);
  ellipse(g, 140, 84, 28, 20, 0x4a9eff);

  rrect(g, 98, 60, 24, 24, 6, 0xf0c090);

  // Head
  ellipse(g, 114, 42, 48, 50, 0xf0c090);
  ellipse(g, 130, 44, 14, 38, 0xb87a50, 0.25);

  ellipse(g, 108, 20, 42, 20, 0x222222);
  tri(g, 126, 18, 132, 4, 138, 20, 0x222222);
  tri(g, 136, 22, 144, 12, 142, 26, 0x222222);

  rrect(g, 86, 28, 54, 10, 4, 0x4a9eff);
  tri(g, 88, 30, 68, 38, 74, 30, 0x4a9eff, 0.7);

  // Eye (intense)
  ellipse(g, 130, 42, 14, 10, 0xffffff);
  circle(g, 133, 42, 4, 0x222222);
  rect(g, 124, 34, 16, 4, 0x222222, 0.9); // furrowed brow

  // Mouth (yelling)
  ellipse(g, 130, 56, 14, 8, 0x8a5a38, 0.6);
  rrect(g, 124, 54, 12, 3, 1, 0x400000, 0.4);
}

function drawPlayerHit(g: Phaser.GameObjects.Graphics) {
  ellipse(g, 110, 244, 90, 16, 0x000000, 0.3);

  rrect(g, 86, 174, 22, 54, 6, 0x9090a0);
  rrect(g, 82, 222, 26, 16, 4, 0x333333);
  rrect(g, 116, 170, 24, 56, 6, 0xe0e0e8);
  rrect(g, 114, 220, 28, 16, 4, 0x333333);

  rrect(g, 80, 166, 64, 10, 3, 0x222222);

  // Back arm flung back
  rrect(g, 42, 88, 16, 26, 8, 0x1a4a8a);
  circle(g, 42, 80, 10, 0xc8956a);

  // Torso (recoiling)
  rrect(g, 78, 86, 58, 80, 8, 0x4a9eff);

  // Front arm (dropped)
  rrect(g, 134, 106, 16, 42, 8, 0x4a9eff);
  circle(g, 140, 150, 11, 0xf0c090);

  ellipse(g, 80, 88, 22, 18, 0x1a4a8a, 0.6);
  ellipse(g, 134, 88, 26, 18, 0x4a9eff);

  rrect(g, 98, 64, 22, 22, 6, 0xf0c090);

  // Head (thrown back)
  ellipse(g, 112, 46, 48, 50, 0xf0c090);
  ellipse(g, 128, 48, 14, 38, 0xb87a50, 0.25);

  ellipse(g, 106, 24, 40, 20, 0x222222);
  tri(g, 124, 20, 130, 8, 134, 22, 0x222222);

  rrect(g, 88, 32, 50, 10, 4, 0x4a9eff);

  // Wincing eye
  rect(g, 126, 44, 14, 3, 0x222222, 0.6);
  // Pain mouth
  ellipse(g, 128, 58, 10, 6, 0xb87a50, 0.5);

  // Impact flash
  circle(g, 148, 98, 16, 0xff4444, 0.4);
  circle(g, 152, 94, 10, 0xff8888, 0.35);
  strokeCirc(g, 148, 98, 22, 0xff6666, 2, 0.3);
}

function drawPlayerVictory(g: Phaser.GameObjects.Graphics) {
  ellipse(g, 128, 244, 90, 16, 0x000000, 0.3);

  rrect(g, 88, 172, 22, 56, 6, 0x9090a0);
  rrect(g, 86, 222, 26, 16, 4, 0x333333);
  rrect(g, 120, 170, 24, 56, 6, 0xe0e0e8);
  rrect(g, 118, 220, 28, 16, 4, 0x333333);

  rrect(g, 84, 166, 64, 10, 3, 0x222222);

  // Back arm at hip
  rrect(g, 68, 112, 16, 40, 8, 0x1a4a8a);
  circle(g, 70, 152, 11, 0xc8956a);

  // Torso (tall, proud)
  rrect(g, 80, 84, 60, 82, 8, 0x4a9eff);
  rrect(g, 84, 88, 20, 50, 4, 0x7ec8ff, 0.25);

  // Front arm RAISED (fist pump!)
  rrect(g, 140, 44, 16, 42, 8, 0x4a9eff);
  circle(g, 148, 36, 14, 0xf0c090);
  rrect(g, 138, 28, 20, 8, 3, 0xcccccc, 0.6);

  // Victory sparkles
  circle(g, 162, 24, 4, 0xffd700, 0.8);
  circle(g, 152, 16, 3, 0xffd700, 0.6);
  circle(g, 170, 36, 3, 0x4a9eff, 0.6);
  circle(g, 142, 12, 2.5, 0xffffff, 0.5);

  ellipse(g, 84, 88, 24, 18, 0x1a4a8a, 0.6);
  ellipse(g, 140, 86, 28, 20, 0x4a9eff);

  rrect(g, 102, 62, 24, 24, 6, 0xf0c090);

  // Head
  ellipse(g, 118, 44, 50, 52, 0xf0c090);
  ellipse(g, 134, 46, 14, 40, 0xb87a50, 0.2);

  ellipse(g, 112, 22, 44, 20, 0x222222);
  tri(g, 130, 20, 136, 6, 142, 22, 0x222222);
  tri(g, 140, 24, 148, 14, 146, 28, 0x222222);

  rrect(g, 90, 30, 56, 10, 4, 0x4a9eff);
  tri(g, 92, 32, 72, 40, 78, 32, 0x4a9eff, 0.7);

  // Eye (confident)
  ellipse(g, 134, 44, 14, 10, 0xffffff);
  circle(g, 137, 44, 4, 0x222222);
  circle(g, 138, 43, 1.5, 0xffffff);
  rect(g, 128, 36, 16, 4, 0x222222, 0.8);

  // Grin
  rrect(g, 126, 54, 16, 6, 3, 0xffffff, 0.7);
  rrect(g, 128, 56, 12, 2, 1, 0xb87a50, 0.4);

  ellipse(g, 94, 46, 8, 12, 0xc8956a, 0.6);
}

/* ═══════════════════════════════════════════════════════════
 *  OPPONENT  — Red brawler, faces LEFT
 * ═══════════════════════════════════════════════════════════ */

function drawOpponentIdle(g: Phaser.GameObjects.Graphics) {
  ellipse(g, 128, 244, 100, 18, 0x000000, 0.35);

  // Back leg (right)
  rrect(g, 142, 172, 24, 56, 6, 0x111115);
  rrect(g, 142, 222, 28, 16, 4, 0x1a1a1a);

  // Front leg (left, forward)
  rrect(g, 94, 168, 26, 58, 6, 0x222228);
  rrect(g, 90, 220, 30, 16, 4, 0x1a1a1a);

  // Belt
  rrect(g, 86, 164, 76, 10, 3, 0x333333);
  rrect(g, 116, 162, 16, 14, 3, 0x888888, 0.4); // buckle

  // Back arm (right, behind)
  rrect(g, 168, 92, 18, 50, 8, 0x6a1828);
  circle(g, 180, 84, 12, 0xa07850);
  rrect(g, 172, 80, 20, 8, 3, 0xe04060, 0.5);

  // Torso (vest, broader build)
  rrect(g, 82, 80, 70, 86, 8, 0xe04060);
  rrect(g, 82, 84, 14, 70, 4, 0x6a1828, 0.4);   // shadow left
  rrect(g, 136, 84, 14, 60, 4, 0xff6080, 0.15);  // highlight right
  // Chest scar
  rect(g, 118, 100, 2, 22, 0xffbbbb, 0.25);

  // Front arm (left, fist forward guard)
  rrect(g, 38, 94, 50, 20, 8, 0xe04060);
  circle(g, 34, 100, 16, 0xd4a878);              // fist
  rrect(g, 24, 92, 22, 8, 3, 0xe04060, 0.6);     // wrap

  // Shoulders
  ellipse(g, 168, 86, 24, 18, 0x6a1828, 0.6);
  ellipse(g, 88, 84, 30, 22, 0xe04060);
  // Spike on front shoulder
  tri(g, 78, 82, 66, 70, 72, 84, 0xe04060, 0.8);

  // Neck (thick)
  rrect(g, 106, 58, 30, 24, 6, 0xd4a878);

  // Head (angular, facing left)
  ellipse(g, 118, 40, 54, 50, 0xd4a878);
  ellipse(g, 100, 42, 14, 38, 0x8a6040, 0.25);

  // Mohawk
  ellipse(g, 126, 18, 30, 16, 0xcc2020);
  tri(g, 118, 14, 122, -2, 128, 16, 0xcc2020);
  tri(g, 128, 12, 132, -4, 136, 16, 0xcc2020);
  tri(g, 112, 16, 114, 4, 120, 18, 0xcc2020);

  // Scar
  rect(g, 102, 28, 2, 24, 0xffbbbb, 0.35);

  // Eye (menacing)
  ellipse(g, 100, 42, 16, 10, 0xffffff);
  circle(g, 97, 42, 5, 0x881111);
  circle(g, 96, 41, 1.5, 0xff4444);
  // Angry brow
  rect(g, 94, 34, 18, 5, 0x333333, 0.8);

  // Mouth (sneer)
  rrect(g, 94, 54, 14, 4, 2, 0x8a6040, 0.5);
  // Fang
  tri(g, 94, 55, 96, 55, 95, 60, 0xffffff, 0.4);

  // Ear
  ellipse(g, 146, 44, 8, 12, 0xa07850, 0.6);
}

function drawOpponentIdleBlink(g: Phaser.GameObjects.Graphics) {
  drawOpponentIdle(g);
  // Cover open eye with skin tone, draw closed eye
  ellipse(g, 100, 42, 18, 12, 0xd4a878);
  rect(g, 94, 42, 16, 2, 0x333333, 0.6);
  rect(g, 94, 34, 18, 5, 0x333333, 0.8); // angry brow
}

function drawOpponentAttack(g: Phaser.GameObjects.Graphics) {
  ellipse(g, 110, 244, 110, 18, 0x000000, 0.35);

  rrect(g, 152, 176, 22, 50, 6, 0x111115);
  rrect(g, 150, 222, 28, 16, 4, 0x1a1a1a);
  rrect(g, 82, 166, 28, 60, 6, 0x222228);
  rrect(g, 78, 220, 32, 16, 4, 0x1a1a1a);

  rrect(g, 82, 164, 88, 10, 3, 0x333333);

  // Back arm (pulled back right)
  rrect(g, 176, 98, 16, 28, 8, 0x6a1828);
  circle(g, 180, 90, 10, 0xa07850);

  // Torso (leaning left into punch)
  rrect(g, 78, 80, 76, 86, 8, 0xe04060);
  rrect(g, 78, 84, 14, 70, 4, 0x6a1828, 0.4);

  // FRONT ARM — PUNCHING LEFT
  rrect(g, 12, 88, 72, 20, 8, 0xe04060);
  circle(g, 8, 96, 18, 0xd4a878);                // fist
  rrect(g, -2, 88, 24, 8, 3, 0xe04060, 0.6);     // wrap

  // Punch energy
  strokeCirc(g, -2, 96, 22, 0xe04060, 3, 0.5);
  strokeCirc(g, -2, 96, 30, 0xe04060, 2, 0.3);
  rect(g, 30, 86, 40, 2, 0xe04060, 0.3);
  rect(g, 25, 98, 40, 2, 0xe04060, 0.25);
  rect(g, 28, 108, 35, 2, 0xe04060, 0.2);

  ellipse(g, 168, 84, 24, 18, 0x6a1828, 0.6);
  ellipse(g, 84, 82, 32, 22, 0xe04060);
  tri(g, 74, 80, 62, 68, 68, 82, 0xe04060, 0.8);

  rrect(g, 104, 56, 30, 24, 6, 0xd4a878);

  ellipse(g, 116, 38, 52, 48, 0xd4a878);
  ellipse(g, 98, 40, 14, 36, 0x8a6040, 0.25);

  ellipse(g, 124, 16, 28, 14, 0xcc2020);
  tri(g, 116, 12, 120, -4, 126, 14, 0xcc2020);
  tri(g, 126, 10, 130, -6, 134, 14, 0xcc2020);

  rect(g, 100, 26, 2, 22, 0xffbbbb, 0.3);

  ellipse(g, 98, 40, 16, 10, 0xffffff);
  circle(g, 95, 40, 5, 0x881111);
  circle(g, 94, 39, 1.5, 0xff4444);
  rect(g, 92, 32, 18, 5, 0x333333, 0.9);

  // Roaring mouth
  ellipse(g, 98, 54, 16, 10, 0x400000, 0.6);
  tri(g, 92, 52, 94, 52, 93, 57, 0xffffff, 0.4);
}

function drawOpponentHit(g: Phaser.GameObjects.Graphics) {
  ellipse(g, 144, 244, 96, 16, 0x000000, 0.3);

  rrect(g, 138, 174, 24, 54, 6, 0x111115);
  rrect(g, 138, 222, 28, 16, 4, 0x1a1a1a);
  rrect(g, 98, 170, 26, 56, 6, 0x222228);
  rrect(g, 94, 220, 30, 16, 4, 0x1a1a1a);

  rrect(g, 94, 166, 72, 10, 3, 0x333333);

  // Back arm flung right
  rrect(g, 176, 88, 16, 26, 8, 0x6a1828);
  circle(g, 180, 80, 10, 0xa07850);

  // Torso (recoiling right)
  rrect(g, 88, 84, 66, 82, 8, 0xe04060);

  // Front arm dropped
  rrect(g, 72, 108, 16, 42, 8, 0xe04060);
  circle(g, 76, 152, 12, 0xd4a878);

  ellipse(g, 168, 86, 22, 16, 0x6a1828, 0.5);
  ellipse(g, 92, 86, 28, 18, 0xe04060);

  rrect(g, 108, 62, 28, 22, 6, 0xd4a878);

  ellipse(g, 122, 44, 52, 48, 0xd4a878);
  ellipse(g, 106, 46, 14, 36, 0x8a6040, 0.25);

  ellipse(g, 128, 22, 28, 14, 0xcc2020);
  tri(g, 122, 18, 126, 6, 132, 20, 0xcc2020);

  rect(g, 108, 30, 2, 22, 0xffbbbb, 0.3);

  // Wincing eye
  rect(g, 100, 44, 16, 3, 0x333333, 0.6);
  // Pain mouth
  ellipse(g, 104, 58, 12, 6, 0x8a6040, 0.5);

  // Impact flash (hit from left)
  circle(g, 78, 96, 18, 0x4a9eff, 0.4);
  circle(g, 74, 92, 12, 0x7ec8ff, 0.35);
  strokeCirc(g, 78, 96, 24, 0x4a9eff, 2, 0.3);
}

/* ═══════════════════════════════════════════════════════════
 *  PLAYER DAMAGE STAGES — progressive body part loss
 * ═══════════════════════════════════════════════════════════ */

/** Stage 1 (60-30 HP): No arms — stumps + worried face */
function drawPlayerIdleNoArms(g: Phaser.GameObjects.Graphics) {
  ellipse(g, 128, 244, 90, 16, 0x000000, 0.3);
  // Legs
  rrect(g, 88, 172, 22, 56, 6, 0x9090a0);
  rrect(g, 86, 222, 26, 16, 4, 0x333333);
  rrect(g, 120, 168, 24, 58, 6, 0xe0e0e8);
  rrect(g, 118, 220, 28, 16, 4, 0x333333);
  rrect(g, 82, 164, 68, 10, 3, 0x222222);
  // Torso
  rrect(g, 80, 84, 60, 82, 8, 0x4a9eff);
  rrect(g, 84, 88, 20, 50, 4, 0x7ec8ff, 0.25);
  rrect(g, 128, 84, 12, 70, 4, 0x1a4a8a, 0.4);
  tri(g, 108, 86, 114, 86, 111, 130, 0x7ec8ff, 0.3);
  // Torn sleeve stumps
  ellipse(g, 70, 92, 16, 14, 0x1a4a8a, 0.5);
  circle(g, 70, 92, 4, 0xffaaaa, 0.3);
  ellipse(g, 142, 92, 16, 14, 0x4a9eff, 0.5);
  circle(g, 142, 92, 4, 0xffaaaa, 0.3);
  // Damage sparks
  circle(g, 64, 86, 2, 0xffd700, 0.6);
  circle(g, 148, 88, 2, 0xffd700, 0.6);
  circle(g, 66, 98, 1.5, 0xffd700, 0.4);
  // Damaged shoulders
  ellipse(g, 84, 88, 20, 14, 0x1a4a8a, 0.4);
  ellipse(g, 140, 86, 22, 16, 0x4a9eff, 0.6);
  // Head
  rrect(g, 102, 62, 24, 24, 6, 0xf0c090);
  ellipse(g, 118, 44, 50, 52, 0xf0c090);
  ellipse(g, 134, 46, 14, 40, 0xb87a50, 0.25);
  ellipse(g, 112, 22, 44, 20, 0x222222);
  tri(g, 130, 20, 136, 6, 142, 22, 0x222222);
  tri(g, 120, 18, 124, 4, 130, 20, 0x222222);
  tri(g, 140, 24, 148, 14, 146, 28, 0x222222);
  rrect(g, 90, 30, 56, 10, 4, 0x4a9eff);
  tri(g, 92, 32, 72, 40, 78, 32, 0x4a9eff, 0.8);
  tri(g, 78, 34, 58, 48, 66, 36, 0x4a9eff, 0.5);
  // Worried face
  ellipse(g, 134, 44, 14, 10, 0xffffff);
  circle(g, 137, 45, 3, 0x222222);
  rect(g, 126, 33, 18, 4, 0x222222, 0.8);
  ellipse(g, 132, 57, 10, 6, 0xb87a50, 0.5);
  ellipse(g, 94, 46, 8, 12, 0xc8956a, 0.6);
  // Sweat drop
  ellipse(g, 96, 36, 4, 6, 0x4a9eff, 0.4);
}

/** Stage 2 (20-0 HP): Head only — floating with ghost body */
function drawPlayerIdleHeadOnly(g: Phaser.GameObjects.Graphics) {
  ellipse(g, 128, 244, 40, 10, 0x000000, 0.15);
  // Ghost body (very faint)
  rrect(g, 80, 84, 60, 82, 8, 0x4a9eff, 0.06);
  rrect(g, 88, 172, 22, 56, 6, 0x9090a0, 0.05);
  rrect(g, 120, 168, 24, 58, 6, 0xe0e0e8, 0.05);
  // Floating debris
  circle(g, 100, 130, 3, 0x4a9eff, 0.3);
  circle(g, 145, 150, 2, 0x4a9eff, 0.2);
  circle(g, 85, 170, 2.5, 0x1a4a8a, 0.25);
  rect(g, 115, 140, 4, 4, 0x4a9eff, 0.15);
  // Neck stump
  rrect(g, 104, 66, 20, 10, 4, 0xf0c090, 0.5);
  circle(g, 114, 76, 4, 0xffaaaa, 0.25);
  // Head (same position)
  ellipse(g, 118, 44, 50, 52, 0xf0c090);
  ellipse(g, 134, 46, 14, 40, 0xb87a50, 0.25);
  ellipse(g, 112, 22, 44, 20, 0x222222);
  tri(g, 130, 20, 136, 6, 142, 22, 0x222222);
  tri(g, 120, 18, 124, 4, 130, 20, 0x222222);
  tri(g, 140, 24, 148, 14, 146, 28, 0x222222);
  rrect(g, 90, 30, 56, 10, 4, 0x4a9eff);
  tri(g, 92, 32, 72, 40, 78, 32, 0x4a9eff, 0.7);
  tri(g, 78, 34, 58, 48, 66, 36, 0x4a9eff, 0.5);
  // Scared face
  ellipse(g, 134, 42, 16, 14, 0xffffff);
  circle(g, 136, 43, 5, 0x222222);
  circle(g, 137, 42, 1.5, 0xffffff);
  rect(g, 126, 32, 18, 3, 0x222222, 0.9);
  ellipse(g, 130, 57, 12, 8, 0x8a5a38, 0.7);
  rrect(g, 126, 55, 8, 3, 1, 0xffffff, 0.4);
  ellipse(g, 94, 46, 8, 12, 0xc8956a, 0.6);
  // Sweat
  ellipse(g, 92, 36, 4, 7, 0x4a9eff, 0.5);
  ellipse(g, 88, 44, 3, 5, 0x4a9eff, 0.3);
}

/* ═══════════════════════════════════════════════════════════
 *  OPPONENT DAMAGE STAGES
 * ═══════════════════════════════════════════════════════════ */

/** Stage 1 (60-30 HP): No arms */
function drawOpponentIdleNoArms(g: Phaser.GameObjects.Graphics) {
  ellipse(g, 128, 244, 100, 18, 0x000000, 0.35);
  // Legs
  rrect(g, 142, 172, 24, 56, 6, 0x111115);
  rrect(g, 142, 222, 28, 16, 4, 0x1a1a1a);
  rrect(g, 94, 168, 26, 58, 6, 0x222228);
  rrect(g, 90, 220, 30, 16, 4, 0x1a1a1a);
  rrect(g, 86, 164, 76, 10, 3, 0x333333);
  rrect(g, 116, 162, 16, 14, 3, 0x888888, 0.4);
  // Torso (damaged)
  rrect(g, 82, 80, 70, 86, 8, 0xe04060);
  rrect(g, 82, 84, 14, 70, 4, 0x6a1828, 0.4);
  rrect(g, 136, 84, 14, 60, 4, 0xff6080, 0.15);
  rect(g, 118, 100, 2, 22, 0xffbbbb, 0.25);
  // Torn sleeve stumps
  ellipse(g, 166, 90, 16, 14, 0x6a1828, 0.5);
  circle(g, 166, 90, 4, 0xffaaaa, 0.3);
  ellipse(g, 86, 92, 16, 14, 0xe04060, 0.5);
  circle(g, 86, 92, 4, 0xffaaaa, 0.3);
  // Sparks
  circle(g, 172, 84, 2, 0xffd700, 0.6);
  circle(g, 80, 86, 2, 0xffd700, 0.6);
  // Damaged shoulders
  ellipse(g, 166, 84, 20, 14, 0x6a1828, 0.4);
  ellipse(g, 88, 82, 24, 18, 0xe04060, 0.5);
  // Neck + Head
  rrect(g, 106, 58, 30, 24, 6, 0xd4a878);
  ellipse(g, 118, 40, 54, 50, 0xd4a878);
  ellipse(g, 100, 42, 14, 38, 0x8a6040, 0.25);
  ellipse(g, 126, 18, 30, 16, 0xcc2020);
  tri(g, 118, 14, 122, -2, 128, 16, 0xcc2020);
  tri(g, 128, 12, 132, -4, 136, 16, 0xcc2020);
  tri(g, 112, 16, 114, 4, 120, 18, 0xcc2020);
  rect(g, 102, 28, 2, 24, 0xffbbbb, 0.35);
  // Angry worried face
  ellipse(g, 100, 42, 16, 10, 0xffffff);
  circle(g, 97, 43, 4, 0x881111);
  rect(g, 92, 34, 18, 5, 0x333333, 0.9);
  ellipse(g, 100, 56, 12, 6, 0x8a6040, 0.6);
  tri(g, 94, 55, 96, 55, 95, 60, 0xffffff, 0.4);
  ellipse(g, 146, 44, 8, 12, 0xa07850, 0.6);
}

/** Stage 2 (20-0 HP): Head only */
function drawOpponentIdleHeadOnly(g: Phaser.GameObjects.Graphics) {
  ellipse(g, 128, 244, 40, 10, 0x000000, 0.15);
  // Ghost body
  rrect(g, 82, 80, 70, 86, 8, 0xe04060, 0.06);
  rrect(g, 142, 172, 24, 56, 6, 0x111115, 0.05);
  rrect(g, 94, 168, 26, 58, 6, 0x222228, 0.05);
  // Debris
  circle(g, 150, 130, 3, 0xe04060, 0.3);
  circle(g, 95, 150, 2, 0xe04060, 0.2);
  circle(g, 160, 170, 2.5, 0x6a1828, 0.25);
  rect(g, 130, 140, 4, 4, 0xe04060, 0.15);
  // Neck stump
  rrect(g, 108, 62, 26, 10, 4, 0xd4a878, 0.5);
  circle(g, 121, 72, 4, 0xffaaaa, 0.25);
  // Head
  ellipse(g, 118, 40, 54, 50, 0xd4a878);
  ellipse(g, 100, 42, 14, 38, 0x8a6040, 0.25);
  ellipse(g, 126, 18, 30, 16, 0xcc2020);
  tri(g, 118, 14, 122, -2, 128, 16, 0xcc2020);
  tri(g, 128, 12, 132, -4, 136, 16, 0xcc2020);
  tri(g, 112, 16, 114, 4, 120, 18, 0xcc2020);
  rect(g, 102, 28, 2, 24, 0xffbbbb, 0.35);
  // Panicked face
  ellipse(g, 100, 40, 18, 14, 0xffffff);
  circle(g, 97, 41, 5, 0x881111);
  circle(g, 96, 40, 1.5, 0xff4444);
  rect(g, 90, 32, 20, 4, 0x333333, 0.9);
  ellipse(g, 98, 56, 14, 10, 0x400000, 0.7);
  tri(g, 94, 54, 96, 54, 95, 59, 0xffffff, 0.5);
  tri(g, 100, 54, 102, 54, 101, 59, 0xffffff, 0.5);
  ellipse(g, 146, 44, 8, 12, 0xa07850, 0.6);
  // Sweat
  ellipse(g, 148, 36, 4, 7, 0xe04060, 0.5);
  ellipse(g, 152, 44, 3, 5, 0xe04060, 0.3);
}

/* ═══════════════════════════════════════════════════════════
 *  RETRO HEART TEXTURES — 40×40 pixel-art hearts
 * ═══════════════════════════════════════════════════════════ */

const HEART_SZ = 40;

function drawHeartFull(g: Phaser.GameObjects.Graphics) {
  fill(g, 0xe04060);
  g.fillCircle(12, 13, 10);
  g.fillCircle(28, 13, 10);
  g.fillTriangle(2, 17, 38, 17, 20, 38);
  // Inner highlight
  fill(g, 0xff8090, 0.45);
  g.fillCircle(9, 10, 4);
  // Bright edge
  fill(g, 0xffffff, 0.2);
  g.fillCircle(8, 9, 2);
}

function drawHeartEmpty(g: Phaser.GameObjects.Graphics) {
  fill(g, 0x0a0a16);
  g.fillCircle(12, 13, 10);
  g.fillCircle(28, 13, 10);
  g.fillTriangle(2, 17, 38, 17, 20, 38);
  // Dark outline
  line(g, 0x333355, 2);
  g.strokeCircle(12, 13, 10);
  g.strokeCircle(28, 13, 10);
}

/* ═══════════════════════════════════════════════════════════ */

type DrawFn = (g: Phaser.GameObjects.Graphics) => void;

function generateTexture(scene: Phaser.Scene, key: string, draw: DrawFn) {
  const g = scene.add.graphics();
  draw(g);
  g.generateTexture(key, SZ, SZ);
  g.destroy();
}

/* ═══════════════════════════════════════════════════════════ */

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // UI SVGs
    this.load.svg('health-bar-frame', 'assets/ui/health-bar-frame.svg', { scale: 2 });
    this.load.svg('button-normal', 'assets/ui/button-normal.svg', { scale: 2 });
    this.load.svg('button-correct', 'assets/ui/button-correct.svg', { scale: 2 });
    this.load.svg('button-wrong', 'assets/ui/button-wrong.svg', { scale: 2 });

    // JSON data
    this.load.json('sound-params', 'assets/sounds/sound-params.json');
    this.load.json('animation-spec', 'assets/animations/animation-spec.json');
  }

  create(): void {
    // Generate character textures at 256×256 with smooth shapes
    generateTexture(this, 'player-idle',          drawPlayerIdle);
    generateTexture(this, 'player-idle-blink',    drawPlayerIdleBlink);
    generateTexture(this, 'player-idle-noarms',   drawPlayerIdleNoArms);
    generateTexture(this, 'player-idle-headonly', drawPlayerIdleHeadOnly);
    generateTexture(this, 'player-attack',        drawPlayerAttack);
    generateTexture(this, 'player-hit',           drawPlayerHit);
    generateTexture(this, 'player-victory',       drawPlayerVictory);

    generateTexture(this, 'opponent-idle',          drawOpponentIdle);
    generateTexture(this, 'opponent-idle-blink',    drawOpponentIdleBlink);
    generateTexture(this, 'opponent-idle-noarms',   drawOpponentIdleNoArms);
    generateTexture(this, 'opponent-idle-headonly', drawOpponentIdleHeadOnly);
    generateTexture(this, 'opponent-attack',        drawOpponentAttack);
    generateTexture(this, 'opponent-hit',           drawOpponentHit);

    // Heart UI textures (40×40)
    const hg1 = this.add.graphics();
    drawHeartFull(hg1);
    hg1.generateTexture('heart-full', HEART_SZ, HEART_SZ);
    hg1.destroy();

    const hg2 = this.add.graphics();
    drawHeartEmpty(hg2);
    hg2.generateTexture('heart-empty', HEART_SZ, HEART_SZ);
    hg2.destroy();

    this.scene.start('IntroScene');
  }
}
