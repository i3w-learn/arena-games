import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

const GAMING_WORDS = [
  'INITIALIZING HYPERDRIVE',
  'LOADING PHYSICS ENGINE',
  'GENERATING QUESTIONS',
  'CALIBRATING DIFFICULTY',
  'BUILDING ARENA',
  'SCANNING STAR SYSTEMS',
  'CONFIGURING WARP FIELD',
  'CHARGING SHIELDS',
  'ESTABLISHING PROTOCOLS',
  'LAUNCHING SEQUENCE',
  'ALL SYSTEMS ONLINE',
];

/* ── Story slides shown during loading ── */
const STORIES = [
  {
    scene: 'galaxy',
    title: 'THE THERMODYNAMICS ARENA',
    text: 'In a galaxy governed by the laws of physics, warriors battle using the power of heat, energy, and entropy...',
  },
  {
    scene: 'warrior',
    title: 'THE CHALLENGER APPEARS',
    text: 'You are P1 — a physics prodigy armed with knowledge of thermodynamic laws. Your opponent awaits in the arena.',
  },
  {
    scene: 'arena',
    title: 'THE BATTLE BEGINS',
    text: 'Answer questions correctly to unleash devastating attacks. Each wrong answer empowers your enemy!',
  },
  {
    scene: 'energy',
    title: 'HARNESS THE ENERGY',
    text: 'From Carnot engines to entropy changes — master every concept. The laws of thermodynamics are your weapons.',
  },
  {
    scene: 'victory',
    title: 'CLAIM YOUR VICTORY',
    text: 'Defeat the CPU opponent and prove yourself as the ultimate physics champion. Only the wisest will survive!',
  },
];

const DURATION_MS = 5_000;

interface Props {
  onComplete: () => void;
}

export function Preloader({ onComplete }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barFillRef = useRef<HTMLDivElement>(null);
  const barGlowRef = useRef<HTMLDivElement>(null);
  const barParticlesRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const shipRef = useRef<HTMLDivElement>(null);
  const shipTrailRef = useRef<HTMLDivElement>(null);
  const barShipRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const storyCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [wordIdx, setWordIdx] = useState(0);
  const [storyIdx, setStoryIdx] = useState(0);

  const stableOnComplete = useCallback(onComplete, [onComplete]);

  // ── Story slide cycling ──
  useEffect(() => {
    const interval = DURATION_MS / STORIES.length;
    const timer = setInterval(() => {
      setStoryIdx(prev => {
        const next = prev + 1;
        return next < STORIES.length ? next : prev;
      });
    }, interval);
    return () => clearInterval(timer);
  }, []);

  // ── Story slide transition animation ──
  useEffect(() => {
    const cards = storyCardsRef.current;
    cards.forEach((card, i) => {
      if (!card) return;
      if (i === storyIdx) {
        gsap.fromTo(card,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power2.out', overwrite: 'auto' }
        );
        // Animate the scene illustration
        const scene = card.querySelector('.story-scene-svg');
        if (scene) {
          gsap.fromTo(scene,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.4)', delay: 0.15, overwrite: 'auto' }
          );
        }
        // Animate title + text as one timeline (fewer individual tweens)
        const tl = gsap.timeline();
        const title = card.querySelector('.story-card-title');
        const text = card.querySelector('.story-card-text');
        if (title) tl.fromTo(title, { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.3);
        if (text) tl.fromTo(text, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.5);
      } else if (parseFloat(card.style.opacity || '0') > 0) {
        gsap.to(card, { opacity: 0, duration: 0.4, overwrite: 'auto' });
      }
    });
  }, [storyIdx]);

  useEffect(() => {
    const start = Date.now();

    // ── Cycle words ──
    const wordTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      const idx = Math.min(
        Math.floor((elapsed / DURATION_MS) * GAMING_WORDS.length),
        GAMING_WORDS.length - 1
      );
      setWordIdx(idx);
    }, 200);

    // ── Flying spaceship animation (background) ──
    if (shipRef.current) {
      const ship = shipRef.current;
      const trail = shipTrailRef.current;

      gsap.set(ship, { x: -100, y: '30vh', rotation: 15, scale: 0.8 });

      const shipTl = gsap.timeline({ repeat: -1 });

      shipTl.to(ship, {
        x: '105vw', y: '15vh', rotation: -5, scale: 1,
        duration: 4, ease: 'power1.inOut',
      });
      shipTl.set(ship, { x: -120, y: '75vh', rotation: 20, scale: 0.6 });
      shipTl.to(ship, {
        x: '110vw', y: '40vh', rotation: -10, scale: 0.9,
        duration: 5, ease: 'power1.inOut',
      });
      shipTl.set(ship, { x: -100, y: '10vh', rotation: 10, scale: 0.7 });
      shipTl.to(ship, {
        x: '108vw', y: '60vh', rotation: -8, scale: 1,
        duration: 4.5, ease: 'power1.inOut',
      });

      gsap.to(trail, {
        opacity: 0.4,
        scaleX: 1.3,
        duration: 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    // ── Story container entrance ──
    if (storyRef.current) {
      gsap.fromTo(storyRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.8 }
      );
    }

    // ── Animate progress bar with GSAP ──
    const obj = { progress: 0 };
    const barTween = gsap.to(obj, {
      progress: 1,
      duration: DURATION_MS / 1000,
      ease: 'power1.inOut',
      onUpdate: () => {
        const p = obj.progress;
        if (barFillRef.current) barFillRef.current.style.width = `${p * 100}%`;
        if (barGlowRef.current) barGlowRef.current.style.width = `${p * 100}%`;
        if (pctRef.current) pctRef.current.textContent = `${Math.floor(p * 100)}%`;
        if (barShipRef.current) {
          barShipRef.current.style.left = `${p * 100}%`;
        }
      },
      onComplete: () => {
        clearInterval(wordTimer);
        const tl = gsap.timeline({ onComplete: stableOnComplete });

        tl.to('.preloader-flash', {
          opacity: 0.2,
          duration: 0.12,
          ease: 'power4.in',
        });
        tl.to('.preloader-flash', {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
        });

        tl.to(
          rootRef.current,
          {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
          },
          '-=0.2'
        );
      },
    });

    // ── Title entry — Star Wars style ──
    gsap.fromTo(
      '.preloader-crawl-wrapper',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1.8, ease: 'power2.out', delay: 0.1 }
    );
    gsap.fromTo(
      '.preloader-tagline',
      { opacity: 0, letterSpacing: '1.5em' },
      { opacity: 0.5, letterSpacing: '0.5em', duration: 1.6, ease: 'power2.out', delay: 0.6 }
    );
    gsap.fromTo(
      '.preloader-bar-track',
      { scaleX: 0 },
      { scaleX: 1, duration: 0.6, ease: 'power2.out', delay: 0.8 }
    );

    // ── Spawn bar particles ──
    if (barParticlesRef.current) {
      const container = barParticlesRef.current;
      const spawnParticle = () => {
        const p = obj.progress;
        if (p < 0.02 || p > 0.98) return;
        const dot = document.createElement('div');
        dot.className = 'bar-particle';
        dot.style.left = `${p * 100}%`;
        container.appendChild(dot);
        gsap.fromTo(dot,
          { y: 0, opacity: 0.8, scale: 1 },
          {
            y: -(10 + Math.random() * 25),
            x: (Math.random() - 0.5) * 20,
            opacity: 0,
            scale: 0,
            duration: 0.6 + Math.random() * 0.4,
            ease: 'power2.out',
            onComplete: () => dot.remove(),
          }
        );
      };
      const particleTimer = setInterval(spawnParticle, 150);
      return () => {
        clearInterval(wordTimer);
        clearInterval(particleTimer);
        barTween.kill();
      };
    }

    return () => {
      clearInterval(wordTimer);
      barTween.kill();
    };
  }, [stableOnComplete]);

  // ── Word change animation ──
  useEffect(() => {
    if (!wordRef.current) return;
    gsap.fromTo(
      wordRef.current,
      { opacity: 0, x: -8 },
      { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' }
    );
  }, [wordIdx]);

  return (
    <div ref={rootRef} className="preloader">
      {/* Flash overlay */}
      <div className="preloader-flash" />

      {/* Scan lines */}
      <div className="preloader-scanlines" />

      {/* Stars */}
      <PreloaderStars />

      {/* Flying spaceship (background) */}
      <div ref={shipRef} className="preloader-ship">
        <div ref={shipTrailRef} className="preloader-ship-trail" />
        <svg viewBox="0 0 64 32" className="preloader-ship-svg">
          <path d="M58 16 L42 6 L8 10 L2 16 L8 22 L42 26 Z"
            fill="url(#shipGrad)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <ellipse cx="50" cy="16" rx="6" ry="4"
            fill="url(#cockpitGrad)" stroke="rgba(74,158,255,0.5)" strokeWidth="0.5" />
          <path d="M30 10 L22 2 L18 2 L24 10 Z" fill="#2a3a5a" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
          <path d="M30 22 L22 30 L18 30 L24 22 Z" fill="#2a3a5a" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" />
          <ellipse cx="4" cy="16" rx="3" ry="2.5" fill="url(#engineGrad)" opacity="0.9" />
          <defs>
            <linearGradient id="shipGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1a2a40" />
              <stop offset="50%" stopColor="#2a3a55" />
              <stop offset="100%" stopColor="#3a4a6a" />
            </linearGradient>
            <radialGradient id="cockpitGrad">
              <stop offset="0%" stopColor="#6ab4ff" />
              <stop offset="100%" stopColor="#2a5a8a" />
            </radialGradient>
            <radialGradient id="engineGrad">
              <stop offset="0%" stopColor="#4a9eff" />
              <stop offset="50%" stopColor="#4a9eff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4a9eff" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Content */}
      <div className="preloader-content">

        {/* Star Wars style crawl title */}
        <div className="preloader-crawl-wrapper">
          <div className="preloader-crawl-glow" />
          <h1 className="preloader-title preloader-starwars">
            <span className="preloader-title-accent">ARENA</span>
            <br />
            BATTLE
          </h1>
          <p className="preloader-tagline">A LONG TIME AGO IN A GALAXY OF PHYSICS...</p>
          <div className="preloader-divider">
            <div className="preloader-divider-glow" />
          </div>
        </div>

        {/* ═══ STORY SLIDESHOW ═══ */}
        <div ref={storyRef} className="story-slideshow" style={{ opacity: 0 }}>
          {/* Story indicator dots */}
          <div className="story-dots">
            {STORIES.map((_, i) => (
              <div key={i} className={`story-dot ${i === storyIdx ? 'story-dot-active' : ''}`} />
            ))}
          </div>

          {/* Story cards */}
          <div className="story-cards-container">
            {STORIES.map((story, i) => (
              <div
                key={i}
                ref={el => { storyCardsRef.current[i] = el; }}
                className="story-card"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                <div className="story-scene-svg">
                  <StoryScene scene={story.scene} />
                </div>
                <div className="story-card-content">
                  <h3 className="story-card-title">{story.title}</h3>
                  <p className="story-card-text">{story.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Word ticker */}
        <div className="preloader-word-area">
          <span className="preloader-chevron-icon">&gt;</span>
          <div ref={wordRef} className="preloader-word">
            {GAMING_WORDS[wordIdx]}
            <span className="preloader-cursor">_</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="preloader-bar-wrapper">
          <div className="preloader-bar-track">
            <div ref={barGlowRef} className="preloader-bar-glow" />
            <div ref={barFillRef} className="preloader-bar-fill" />
            <div ref={barParticlesRef} className="preloader-bar-particles" />
            <div ref={barShipRef} className="preloader-bar-ship">
              <svg viewBox="0 0 24 12" width="24" height="12">
                <path d="M22 6 L16 2 L4 3.5 L1 6 L4 8.5 L16 10 Z"
                  fill="url(#miniShipGrad)" stroke="rgba(74,158,255,0.4)" strokeWidth="0.4" />
                <ellipse cx="1" cy="6" rx="2" ry="1.5" fill="#4a9eff" opacity="0.7" />
                <defs>
                  <linearGradient id="miniShipGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1a2a40" />
                    <stop offset="100%" stopColor="#3a5a8a" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <div className="preloader-bar-edges">
            <span className="preloader-bar-edge-l" />
            <span className="preloader-bar-edge-r" />
          </div>
        </div>

        <span ref={pctRef} className="preloader-pct">0%</span>
      </div>
    </div>
  );
}

/* ── Pixel-art story scenes (SVG) ── */
function StoryScene({ scene }: { scene: string }) {
  switch (scene) {
    case 'galaxy':
      return (
        <svg viewBox="0 0 200 120" className="story-svg">
          {/* Stars */}
          {Array.from({ length: 20 }, (_, i) => (
            <rect key={i}
              x={Math.random() * 196 + 2} y={Math.random() * 116 + 2}
              width="2" height="2" fill="#fff"
              opacity={0.3 + Math.random() * 0.6}
            />
          ))}
          {/* Big planet */}
          <circle cx="140" cy="50" r="30" fill="#3a506b" opacity="0.8" />
          <circle cx="132" cy="42" r="8" fill="#4a6a8a" opacity="0.5" />
          {/* Planet ring */}
          <ellipse cx="140" cy="50" rx="50" ry="10" fill="none"
            stroke="#8b7ec8" strokeWidth="2" opacity="0.4" />
          {/* Small planet */}
          <circle cx="50" cy="30" r="12" fill="#8b5e3c" opacity="0.7" />
          <circle cx="47" cy="27" r="3" fill="#aa7a5a" opacity="0.5" />
          {/* Nebula glow */}
          <ellipse cx="100" cy="90" rx="60" ry="20" fill="#4a9eff" opacity="0.08" />
          <ellipse cx="100" cy="90" rx="30" ry="10" fill="#4a9eff" opacity="0.12" />
          {/* Energy waves */}
          <path d="M20 100 Q60 80 100 100 Q140 120 180 100" fill="none"
            stroke="#ffd700" strokeWidth="1" opacity="0.2" />
        </svg>
      );

    case 'warrior':
      return (
        <svg viewBox="0 0 200 120" className="story-svg">
          {/* Platform */}
          <rect x="60" y="100" width="80" height="6" fill="#1a1a3a" rx="1" />
          <rect x="65" y="98" width="70" height="2" fill="#4a9eff" opacity="0.3" />
          {/* P1 character — pixel warrior */}
          <rect x="90" y="40" width="20" height="20" fill="#4a9eff" opacity="0.9" />
          {/* Visor */}
          <rect x="92" y="48" width="16" height="5" fill="#6ac4ff" opacity="0.8" />
          {/* Body */}
          <rect x="86" y="62" width="28" height="36" fill="#4a9eff" opacity="0.7" />
          {/* Arms */}
          <rect x="76" y="66" width="10" height="6" fill="#4a9eff" opacity="0.5" />
          <rect x="114" y="62" width="10" height="30" fill="#4a9eff" opacity="0.5" />
          {/* Sword */}
          <rect x="120" y="28" width="5" height="60" fill="#4a9eff" opacity="0.8" />
          <rect x="118" y="26" width="9" height="4" fill="#fff" opacity="0.6" />
          <rect x="116" y="86" width="13" height="5" fill="#4a9eff" opacity="0.5" />
          {/* Energy aura */}
          <circle cx="100" cy="70" r="40" fill="none" stroke="#4a9eff" strokeWidth="1" opacity="0.15" />
          <circle cx="100" cy="70" r="50" fill="none" stroke="#4a9eff" strokeWidth="0.5" opacity="0.08" />
          {/* Floating energy particles */}
          <rect x="70" y="50" width="3" height="3" fill="#ffd700" opacity="0.6" />
          <rect x="130" y="45" width="2" height="2" fill="#4eca78" opacity="0.5" />
          <rect x="65" y="80" width="2" height="2" fill="#8b7ec8" opacity="0.5" />
          <rect x="140" y="75" width="3" height="3" fill="#e04060" opacity="0.4" />
        </svg>
      );

    case 'arena':
      return (
        <svg viewBox="0 0 200 120" className="story-svg">
          {/* Arena floor */}
          <rect x="10" y="95" width="180" height="20" fill="#0a0a20" />
          <rect x="10" y="93" width="180" height="2" fill="#ffd700" opacity="0.3" />
          {/* Arena pillars */}
          <rect x="15" y="30" width="10" height="65" fill="#1a1a3a" />
          <rect x="15" y="28" width="10" height="4" fill="#ffd700" opacity="0.4" />
          <rect x="175" y="30" width="10" height="65" fill="#1a1a3a" />
          <rect x="175" y="28" width="10" height="4" fill="#ffd700" opacity="0.4" />
          {/* VS text center */}
          <text x="100" y="60" textAnchor="middle" fill="#ffd700" fontSize="24"
            fontFamily="'Press Start 2P', monospace" opacity="0.8">VS</text>
          {/* P1 small */}
          <rect x="42" y="56" width="14" height="14" fill="#4a9eff" opacity="0.7" />
          <rect x="40" y="72" width="18" height="22" fill="#4a9eff" opacity="0.5" />
          <text x="49" y="52" textAnchor="middle" fill="#4a9eff" fontSize="6"
            fontFamily="'Press Start 2P', monospace" opacity="0.8">P1</text>
          {/* CPU small */}
          <rect x="144" y="56" width="14" height="14" fill="#e04060" opacity="0.7" />
          <rect x="142" y="72" width="18" height="22" fill="#e04060" opacity="0.5" />
          {/* Horns */}
          <rect x="140" y="48" width="5" height="10" fill="#e04060" opacity="0.5" />
          <rect x="155" y="48" width="5" height="10" fill="#e04060" opacity="0.5" />
          <text x="151" y="52" textAnchor="middle" fill="#e04060" fontSize="5"
            fontFamily="'Press Start 2P', monospace" opacity="0.8">CPU</text>
          {/* Energy clash in center */}
          <line x1="65" y1="70" x2="95" y2="55" stroke="#4a9eff" strokeWidth="2" opacity="0.4" />
          <line x1="135" y1="70" x2="105" y2="55" stroke="#e04060" strokeWidth="2" opacity="0.4" />
          {/* Sparkle */}
          <rect x="98" y="52" width="4" height="4" fill="#ffd700" opacity="0.7" />
        </svg>
      );

    case 'energy':
      return (
        <svg viewBox="0 0 200 120" className="story-svg">
          {/* Thermodynamic diagram background */}
          <rect x="20" y="20" width="160" height="80" fill="none"
            stroke="#333366" strokeWidth="1" opacity="0.4" />
          {/* Grid lines */}
          {[40, 60, 80].map(y => (
            <line key={`h${y}`} x1="20" y1={y} x2="180" y2={y}
              stroke="#333366" strokeWidth="0.5" opacity="0.2" />
          ))}
          {[60, 100, 140].map(x => (
            <line key={`v${x}`} x1={x} y1="20" x2={x} y2="100"
              stroke="#333366" strokeWidth="0.5" opacity="0.2" />
          ))}
          {/* PV curve (Carnot-like cycle) */}
          <path d="M40 80 Q60 40 80 45 Q100 50 120 35 Q140 20 160 50"
            fill="none" stroke="#4a9eff" strokeWidth="2" opacity="0.7" />
          <path d="M160 50 Q150 70 130 75 Q100 82 80 78 Q60 74 40 80"
            fill="none" stroke="#e04060" strokeWidth="2" opacity="0.6" />
          {/* Area fill */}
          <path d="M40 80 Q60 40 80 45 Q100 50 120 35 Q140 20 160 50 Q150 70 130 75 Q100 82 80 78 Q60 74 40 80"
            fill="#4a9eff" opacity="0.06" />
          {/* Labels */}
          <text x="25" y="16" fill="#ffd700" fontSize="6"
            fontFamily="'Press Start 2P', monospace" opacity="0.5">P</text>
          <text x="182" y="104" fill="#ffd700" fontSize="6"
            fontFamily="'Press Start 2P', monospace" opacity="0.5">V</text>
          {/* Axis arrows */}
          <path d="M20 100 L20 15 L16 20" fill="none" stroke="#ffd700" strokeWidth="1" opacity="0.3" />
          <path d="M20 100 L185 100 L180 96" fill="none" stroke="#ffd700" strokeWidth="1" opacity="0.3" />
          {/* Energy symbols */}
          <text x="90" y="65" textAnchor="middle" fill="#4eca78" fontSize="8"
            fontFamily="'Press Start 2P', monospace" opacity="0.6">Q=W</text>
          {/* Floating formula particles */}
          <text x="35" y="35" fill="#8b7ec8" fontSize="5"
            fontFamily="'Press Start 2P', monospace" opacity="0.4">dU</text>
          <text x="145" y="42" fill="#ffd700" fontSize="5"
            fontFamily="'Press Start 2P', monospace" opacity="0.4">dS</text>
          <text x="60" y="92" fill="#e04060" fontSize="4"
            fontFamily="'Press Start 2P', monospace" opacity="0.3">ENTROPY</text>
        </svg>
      );

    case 'victory':
      return (
        <svg viewBox="0 0 200 120" className="story-svg">
          {/* Trophy */}
          <rect x="80" y="25" width="40" height="35" fill="#ffd700" opacity="0.7" rx="2" />
          <rect x="85" y="30" width="30" height="6" fill="#ffec80" opacity="0.5" />
          {/* Trophy handles */}
          <rect x="72" y="30" width="8" height="20" fill="#ffd700" opacity="0.5" rx="1" />
          <rect x="120" y="30" width="8" height="20" fill="#ffd700" opacity="0.5" rx="1" />
          {/* Trophy base */}
          <rect x="86" y="62" width="28" height="6" fill="#daa520" opacity="0.6" />
          <rect x="82" y="68" width="36" height="8" fill="#b8860b" opacity="0.5" />
          {/* Star on trophy */}
          <polygon points="100,32 103,40 112,40 105,46 108,54 100,49 92,54 95,46 88,40 97,40"
            fill="#fff" opacity="0.6" />
          {/* Confetti / sparkles */}
          <rect x="40" y="20" width="4" height="4" fill="#4a9eff" opacity="0.6" transform="rotate(15 42 22)" />
          <rect x="155" y="25" width="3" height="3" fill="#e04060" opacity="0.5" transform="rotate(-20 156 26)" />
          <rect x="50" y="70" width="3" height="3" fill="#4eca78" opacity="0.5" transform="rotate(30 51 71)" />
          <rect x="150" y="65" width="4" height="4" fill="#8b7ec8" opacity="0.5" transform="rotate(-10 152 67)" />
          <rect x="30" y="45" width="2" height="2" fill="#ffd700" opacity="0.7" />
          <rect x="170" y="40" width="2" height="2" fill="#ffd700" opacity="0.7" />
          <rect x="60" y="90" width="3" height="3" fill="#4a9eff" opacity="0.4" transform="rotate(45 61 91)" />
          <rect x="140" y="85" width="3" height="3" fill="#e04060" opacity="0.4" transform="rotate(-45 141 86)" />
          {/* CHAMPION text */}
          <text x="100" y="100" textAnchor="middle" fill="#ffd700" fontSize="8"
            fontFamily="'Press Start 2P', monospace" opacity="0.6">CHAMPION</text>
          {/* Glow rays */}
          <line x1="100" y1="18" x2="100" y2="8" stroke="#ffd700" strokeWidth="1" opacity="0.3" />
          <line x1="80" y1="22" x2="72" y2="14" stroke="#ffd700" strokeWidth="1" opacity="0.2" />
          <line x1="120" y1="22" x2="128" y2="14" stroke="#ffd700" strokeWidth="1" opacity="0.2" />
        </svg>
      );

    default:
      return null;
  }
}

/* ── Tiny star background for preloader ── */
function PreloaderStars() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    for (let i = 0; i < 60; i++) {
      const s = document.createElement('div');
      s.className = 'star star-twinkle';
      const sz = 0.3 + Math.random() * 1.2;
      s.style.width = `${sz}px`;
      s.style.height = `${sz}px`;
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.opacity = `${0.05 + Math.random() * 0.3}`;
      // CSS-driven twinkle
      s.style.animationDuration = `${2 + Math.random() * 4}s`;
      s.style.animationDelay = `${Math.random() * 2}s`;
      ref.current.appendChild(s);
    }

    const container = ref.current;
    const shootingStar = () => {
      const ss = document.createElement('div');
      ss.className = 'preloader-shooting-star';
      ss.style.top = `${Math.random() * 60}%`;
      ss.style.left = `${Math.random() * 40}%`;
      container.appendChild(ss);
      gsap.fromTo(ss,
        { x: 0, y: 0, opacity: 0.8 },
        {
          x: 200 + Math.random() * 300,
          y: 100 + Math.random() * 150,
          opacity: 0,
          duration: 0.8 + Math.random() * 0.6,
          ease: 'power1.in',
          onComplete: () => ss.remove(),
        }
      );
    };
    const ssTimer = setInterval(shootingStar, 2000 + Math.random() * 3000);
    return () => clearInterval(ssTimer);
  }, []);

  return <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} />;
}
