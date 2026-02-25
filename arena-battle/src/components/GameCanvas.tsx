import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import confetti from 'canvas-confetti';
import { BootScene } from '../rendering/BootScene';
import { IntroScene } from '../rendering/IntroScene';
import { BattleScene } from '../rendering/BattleScene';
import { VictoryScene } from '../rendering/VictoryScene';
import { DefeatScene } from '../rendering/DefeatScene';
import { eventBus } from '../events/EventBus';
import { GameEventType } from '../events/GameEvents';

export function GameCanvas() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;

    // Detect mobile for performance tuning
    const isMobile = window.matchMedia('(pointer: coarse)').matches
      || 'ontouchstart' in window
      || window.innerWidth < 768;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1600,
      height: 1200,
      parent: containerRef.current,
      transparent: true,
      antialias: !isMobile,
      roundPixels: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'matter',
        matter: {
          gravity: { x: 0, y: 6 },
          debug: false,
        },
      },
      scene: [BootScene, IntroScene, BattleScene, VictoryScene, DefeatScene],
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // ── Confetti on victory ──
  useEffect(() => {
    const fireConfetti = () => {
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ['#4a9eff', '#8b7ec8', '#e04060', '#4eca78', '#e8e6e3'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };

      // Big initial burst
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors,
      });
      frame();
    };

    eventBus.on(GameEventType.VICTORY, fireConfetti);
    return () => { eventBus.off(GameEventType.VICTORY, fireConfetti); };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
