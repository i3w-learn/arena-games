import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { GameCanvas } from './components/GameCanvas';
import { Preloader } from './components/Preloader';
import { StartScreen } from './components/StartScreen';
import { ThreeBackground } from './components/ThreeBackground';
import { GameCursor } from './components/GameCursor';

type Phase = 'start' | 'loading' | 'game';

/* ── Star layer config ──────────────────────────────── */
const LAYERS = [
  { count: 80, minSize: 0.5, maxSize: 1, speed: 0.015, opacity: 0.25, className: 'layer-far' },
  { count: 50, minSize: 0.8, maxSize: 1.3, speed: 0.04, opacity: 0.35, className: 'layer-mid' },
  { count: 25, minSize: 1, maxSize: 1.8, speed: 0.08, opacity: 0.5, className: 'layer-near' },
];

/* ── Planet config ───────────────────────────────────── */
interface PlanetConfig {
  size: number;
  x: number;           // % from left
  y: number;           // % from top
  gradient: string;    // CSS radial-gradient
  opacity: number;
  blur: number;
  driftX: number;      // px drift range
  driftY: number;
  driftDuration: number; // seconds
  hasRing: boolean;
  ringSize: number;    // multiplier of planet size
}

const PLANETS: PlanetConfig[] = [
  {
    size: 120, x: 8, y: 15,
    gradient: 'radial-gradient(circle at 35% 35%, #3a506b 0%, #1c2541 50%, #0b132b 100%)',
    opacity: 0.15, blur: 1, driftX: 30, driftY: 20, driftDuration: 25,
    hasRing: true, ringSize: 1.8,
  },
  {
    size: 60, x: 85, y: 70,
    gradient: 'radial-gradient(circle at 40% 30%, #8b5e3c 0%, #5a3825 50%, #2d1a0e 100%)',
    opacity: 0.12, blur: 0, driftX: 20, driftY: 15, driftDuration: 18,
    hasRing: false, ringSize: 0,
  },
  {
    size: 200, x: 90, y: 10,
    gradient: 'radial-gradient(circle at 30% 30%, #4a3060 0%, #2a1840 50%, #10081f 100%)',
    opacity: 0.08, blur: 2, driftX: 15, driftY: 10, driftDuration: 35,
    hasRing: true, ringSize: 1.6,
  },
  {
    size: 40, x: 25, y: 80,
    gradient: 'radial-gradient(circle at 40% 35%, #5c7a4a 0%, #3a5230 50%, #1a2a10 100%)',
    opacity: 0.1, blur: 0, driftX: 25, driftY: 18, driftDuration: 14,
    hasRing: false, ringSize: 0,
  },
  {
    size: 80, x: 60, y: 5,
    gradient: 'radial-gradient(circle at 35% 30%, #7a5a3a 0%, #4a3520 50%, #201508 100%)',
    opacity: 0.06, blur: 1, driftX: 12, driftY: 8, driftDuration: 30,
    hasRing: true, ringSize: 1.5,
  },
];

export default function App() {
  const [phase, setPhase] = useState<Phase>('start');

  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const planetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const handleStart = useCallback(() => setPhase('loading'), []);
  const handlePreloaderDone = useCallback(() => setPhase('game'), []);

  // ── Stars + parallax (always active, even behind preloader) ──
  useEffect(() => {
    layerRefs.current.forEach((layer, li) => {
      if (!layer) return;
      while (layer.firstChild) layer.removeChild(layer.firstChild);

      const cfg = LAYERS[li];
      for (let i = 0; i < cfg.count; i++) {
        const star = document.createElement('div');
        star.className = 'star star-twinkle';
        const size = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.opacity = `${cfg.opacity * (0.3 + Math.random() * 0.7)}`;
        // CSS animation with random delay/duration for twinkle — no JS tweens needed
        const dur = 2 + Math.random() * 4;
        const delay = Math.random() * 4;
        star.style.animationDuration = `${dur}s`;
        star.style.animationDelay = `${delay}s`;
        layer.appendChild(star);
      }
    });

    // ── Parallax on mouse move (throttled to rAF) ──
    let mouseX = 0, mouseY = 0;
    let rafId = 0;
    let ticking = false;

    const applyParallax = () => {
      ticking = false;
      const cx = mouseX, cy = mouseY;

      layerRefs.current.forEach((layer, li) => {
        if (!layer) return;
        const speed = LAYERS[li].speed;
        gsap.to(layer, {
          x: cx * speed * 60,
          y: cy * speed * 60,
          duration: 1.2,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });

      planetRefs.current.forEach((planet, pi) => {
        if (!planet) return;
        const depth = 0.02 + pi * 0.01;
        gsap.to(planet, {
          x: cx * depth * 40,
          y: cy * depth * 40,
          duration: 1.8,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(applyParallax);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // ── Planet drift animations ──
  useEffect(() => {
    planetRefs.current.forEach((planet, i) => {
      if (!planet) return;
      const cfg = PLANETS[i];

      // Slow continuous drift
      gsap.to(planet, {
        x: `+=${cfg.driftX}`,
        y: `+=${cfg.driftY}`,
        duration: cfg.driftDuration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Slow rotation for ringed planets
      if (cfg.hasRing) {
        gsap.to(planet, {
          rotation: 360,
          duration: cfg.driftDuration * 4,
          repeat: -1,
          ease: 'none',
        });
      }
    });
  }, []);

  // ── Game reveal animation (fires once preloader exits) ──
  useEffect(() => {
    if (phase !== 'game') return;

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    tl.fromTo(
      containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1.2, ease: 'power2.out' },
    );
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 1.5 },
      '-=1.0'
    );
    tl.fromTo(
      subtitleRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8 },
      '-=0.7'
    );

    // Title breathing glow
    gsap.to(titleRef.current, {
      textShadow: '0 0 60px rgba(74, 158, 255, 0.3)',
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }, [phase]);

  return (
    <div id="app">
      {/* Custom gaming cursor — desktop only */}
      <GameCursor />

      {/* Start screen — dramatic landing page */}
      {phase === 'start' && <StartScreen onStart={handleStart} />}

      {/* Preloader overlay — game loads behind it */}
      {phase === 'loading' && <Preloader onComplete={handlePreloaderDone} />}

      {/* Three.js 3D background (spaceships, aliens, crystals) */}
      <ThreeBackground />

      {/* Starfield background */}
      <div className="starfield">
        {LAYERS.map((cfg, i) => (
          <div
            key={cfg.className}
            className={`stars-layer ${cfg.className}`}
            ref={(el) => { layerRefs.current[i] = el; }}
          />
        ))}
      </div>

      {/* Floating planets */}
      <div className="planets-layer">
        {PLANETS.map((cfg, i) => (
          <div
            key={`planet-${i}`}
            className="planet"
            ref={(el) => { planetRefs.current[i] = el; }}
            style={{
              width: cfg.size,
              height: cfg.size,
              left: `${cfg.x}%`,
              top: `${cfg.y}%`,
              background: cfg.gradient,
              opacity: cfg.opacity,
              filter: undefined,
              boxShadow: `inset -${cfg.size * 0.15}px -${cfg.size * 0.1}px ${cfg.size * 0.3}px rgba(0,0,0,0.6)`,
            }}
          >
            {cfg.hasRing && (
              <div
                className="planet-ring"
                style={{
                  width: cfg.size * cfg.ringSize,
                  height: cfg.size * cfg.ringSize * 0.3,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Game — fullscreen behind overlays */}
      <div ref={containerRef} className="game-fullscreen" style={{ opacity: 0 }}>
        <GameCanvas />
      </div>

      {/* Title overlay */}
      <h1
        ref={titleRef}
        className="game-title"
        data-text="ARENA BATTLE"
        style={{ opacity: 0 }}
      >
        <span>ARENA</span> BATTLE
      </h1>

      <p ref={subtitleRef} className="game-subtitle" style={{ opacity: 0 }}>
        JEE Physics Thermodynamics
      </p>
    </div>
  );
}
