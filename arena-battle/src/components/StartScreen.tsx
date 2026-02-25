import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { soundManager } from '../rendering/SoundManager';

interface Props {
  onStart: () => void;
}

export function StartScreen({ onStart }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const leftCharRef = useRef<HTMLDivElement>(null);
  const rightCharRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const orbLeftRef = useRef<HTMLDivElement>(null);
  const orbRightRef = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLParagraphElement>(null);
  const highscoreRef = useRef<HTMLParagraphElement>(null);
  const stickersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    // Staggered retro entrance — step-based for pixel feel
    tl.fromTo(titleRef.current, { opacity: 0, y: -40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'steps(8)' });
    tl.fromTo(subtitleRef.current, { opacity: 0 }, { opacity: 0.8, duration: 0.5, ease: 'steps(5)' }, '-=0.3');
    tl.fromTo(dividerRef.current, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.4, ease: 'steps(6)' }, '-=0.2');
    tl.fromTo(taglineRef.current, { opacity: 0, y: 10 }, { opacity: 0.5, y: 0, duration: 0.5, ease: 'steps(5)' }, '-=0.2');

    // Characters slide in (pixel steps)
    tl.fromTo(leftCharRef.current, { x: -200, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'steps(10)' }, '-=0.3');
    tl.fromTo(rightCharRef.current, { x: 200, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'steps(10)' }, '-=0.5');

    // Button + coin text appear
    tl.fromTo(btnRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'steps(4)' }, '-=0.2');
    tl.fromTo(coinRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 }, '-=0.1');
    tl.fromTo(highscoreRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 }, '-=0.2');

    // Space stickers pop in
    if (stickersRef.current) {
      const items = stickersRef.current.querySelectorAll('.space-sticker');
      items.forEach((item, i) => {
        tl.fromTo(item,
          { opacity: 0, scale: 0, rotation: -30 + Math.random() * 60 },
          { opacity: 1, scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(2)' },
          `-=${0.35 - i * 0.02}`
        );
      });
    }

    // Looping animations
    // Title color cycling glow
    gsap.to(titleRef.current, {
      textShadow: '0 0 20px rgba(255, 96, 64, 0.8), 0 0 50px rgba(255, 96, 64, 0.4), 4px 4px 0 #8b2a14',
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'steps(3)',
    });

    // Button pulse glow
    gsap.to(btnRef.current, {
      boxShadow: '0 4px 0 #885500, 0 8px 0 #553300, 0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(255, 215, 0, 0.2), inset 0 2px 0 rgba(255, 255, 255, 0.3)',
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: 'steps(2)',
    });

    // Character idle bounce (pixel-step)
    gsap.to(leftCharRef.current, { y: -6, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(3)' });
    gsap.to(rightCharRef.current, { y: -6, duration: 0.6, repeat: -1, yoyo: true, ease: 'steps(3)', delay: 0.2 });

    // Energy orbs rotating
    gsap.to(orbLeftRef.current, { rotation: 360, duration: 8, repeat: -1, ease: 'none' });
    gsap.to(orbRightRef.current, { rotation: -360, duration: 10, repeat: -1, ease: 'none' });

    // Space stickers idle float
    if (stickersRef.current) {
      const items = stickersRef.current.querySelectorAll('.space-sticker');
      items.forEach((item, i) => {
        gsap.to(item, {
          y: -4 - Math.random() * 6,
          rotation: -3 + Math.random() * 6,
          duration: 2 + Math.random() * 2,
          repeat: -1, yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3,
        });
      });
    }

    // Floating pixel particles
    if (particlesRef.current) {
      const container = particlesRef.current;
      const spawnParticle = () => {
        const p = document.createElement('div');
        p.className = 'start-particle';
        const colors = ['#4a9eff', '#e04060', '#ffd700', '#4eca78', '#8b7ec8'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        p.style.background = color;
        p.style.boxShadow = `0 0 4px ${color}`;
        p.style.left = `${5 + Math.random() * 90}%`;
        p.style.bottom = '0';
        const size = 2 + Math.floor(Math.random() * 4);
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        container.appendChild(p);
        gsap.to(p, {
          y: -(100 + Math.random() * 400),
          x: (Math.random() - 0.5) * 60,
          opacity: 0,
          duration: 2 + Math.random() * 3,
          ease: 'steps(12)',
          onComplete: () => p.remove(),
        });
      };
      const timer = setInterval(spawnParticle, 400);
      return () => clearInterval(timer);
    }
  }, []);

  const handleClick = () => {
    // Unlock Web Audio context from user gesture
    soundManager.unlock();
    soundManager.play('buttonTap');

    // Retro exit animation
    const tl = gsap.timeline({ onComplete: onStart });

    // Button press flash
    tl.to(btnRef.current, {
      scale: 0.95,
      boxShadow: '0 0 0 #885500, 0 2px 0 #553300, 0 0 60px rgba(255, 215, 0, 0.8)',
      duration: 0.1,
    });

    // Screen flash
    tl.to('.start-flash', { opacity: 0.6, duration: 0.08 });
    tl.to('.start-flash', { opacity: 0, duration: 0.2 });

    // Fade out with pixel dissolve feel
    tl.to(rootRef.current, { opacity: 0, duration: 0.4, ease: 'steps(6)' }, '-=0.1');
  };

  return (
    <div ref={rootRef} className="start-screen">
      {/* Flash overlay */}
      <div className="start-flash" />

      {/* CRT Scanlines */}
      <div className="start-scanlines" />

      {/* Retro grid floor */}
      <div className="start-retro-grid" />

      {/* Energy orbs (retro square rings) */}
      <div ref={orbLeftRef} className="start-orb start-orb-left">
        <div className="start-orb-ring" />
        <div className="start-orb-ring start-orb-ring-2" />
      </div>
      <div ref={orbRightRef} className="start-orb start-orb-right">
        <div className="start-orb-ring" />
        <div className="start-orb-ring start-orb-ring-2" />
      </div>

      {/* Floating pixel particles */}
      <div ref={particlesRef} className="start-particles" />

      {/* Character silhouettes */}
      <div ref={leftCharRef} className="start-character start-char-left">
        <svg viewBox="0 0 120 200" className="start-char-svg">
          <defs>
            <linearGradient id="playerSilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a9eff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#4a9eff" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Fighter facing RIGHT — fighting stance */}
          {/* Head */}
          <polygon points="44,18 46,6 66,4 72,12 74,20 74,34 68,38 46,38 44,32" fill="url(#playerSilGrad)" />
          {/* Spiky hair */}
          <polygon points="46,6 50,0 56,4 60,0 66,4 72,8 64,2 54,2 46,8" fill="url(#playerSilGrad)" opacity="0.8" />
          {/* Headband */}
          <rect x="44" y="14" width="30" height="5" rx="1" fill="#4a9eff" opacity="0.9" />
          <polygon points="44,14 36,18 32,22" fill="none" stroke="#4a9eff" strokeWidth="2" opacity="0.6" />
          {/* Eye */}
          <circle cx="68" cy="24" r="2.5" fill="#4a9eff" opacity="0.9" />
          <rect x="52" y="38" width="16" height="8" fill="url(#playerSilGrad)" opacity="0.7" />
          {/* Torso with gi */}
          <polygon points="40,48 36,58 38,98 70,98 76,58 72,48" fill="url(#playerSilGrad)" />
          {/* Back arm (guard up) */}
          <polygon points="38,52 28,46 24,34 28,32 34,42 40,50" fill="url(#playerSilGrad)" opacity="0.5" />
          <circle cx="26" cy="33" r="4" fill="url(#playerSilGrad)" opacity="0.5" />
          {/* Front arm (fist forward) */}
          <polygon points="72,50 84,46 92,40 96,38 96,44 90,48 80,54 74,54" fill="url(#playerSilGrad)" opacity="0.8" />
          <circle cx="96" cy="41" r="5" fill="#4a9eff" opacity="0.7" />
          {/* Legs */}
          <polygon points="42,98 38,130 34,150 44,150 46,130 46,98" fill="url(#playerSilGrad)" opacity="0.5" />
          <polygon points="60,98 68,126 74,150 84,146 76,124 66,98" fill="url(#playerSilGrad)" opacity="0.7" />
          {/* Shoulder -->  */}
          <ellipse cx="72" cy="50" rx="7" ry="5" fill="url(#playerSilGrad)" opacity="0.8" />
        </svg>
        <div className="start-char-glow start-char-glow-blue" />
        <p className="start-char-label start-char-label-blue">P1</p>
      </div>

      <div ref={rightCharRef} className="start-character start-char-right">
        <svg viewBox="0 0 120 200" className="start-char-svg">
          <defs>
            <linearGradient id="oppSilGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e04060" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#e04060" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Brawler facing LEFT — fighting stance */}
          {/* Head (angular, tough) */}
          <polygon points="76,18 74,6 54,4 48,12 46,20 46,34 52,38 74,38 76,32" fill="url(#oppSilGrad)" />
          {/* Mohawk hair */}
          <polygon points="74,6 70,0 64,-4 60,0 56,4 52,8 58,2 64,0 70,2 74,8" fill="#e04060" opacity="0.8" />
          {/* Scar */}
          <line x1="58" y1="18" x2="52" y2="28" stroke="#ff8888" strokeWidth="1.5" opacity="0.5" />
          {/* Eye */}
          <circle cx="52" cy="24" r="2.5" fill="#ff4444" opacity="0.9" />
          <rect x="52" y="38" width="16" height="8" fill="url(#oppSilGrad)" opacity="0.7" />
          {/* Torso with vest (broader) */}
          <polygon points="80,48 84,58 82,98 50,98 44,58 48,48" fill="url(#oppSilGrad)" />
          {/* Back arm */}
          <polygon points="82,52 92,46 96,34 92,32 86,42 80,50" fill="url(#oppSilGrad)" opacity="0.5" />
          <circle cx="94" cy="33" r="4" fill="url(#oppSilGrad)" opacity="0.5" />
          {/* Front arm (fist forward) */}
          <polygon points="48,50 36,46 28,40 24,38 24,44 30,48 40,54 48,54" fill="url(#oppSilGrad)" opacity="0.8" />
          <circle cx="24" cy="41" r="5.5" fill="#e04060" opacity="0.7" />
          {/* Legs */}
          <polygon points="78,98 82,130 86,150 76,150 74,130 74,98" fill="url(#oppSilGrad)" opacity="0.5" />
          <polygon points="60,98 52,126 46,150 36,146 44,124 54,98" fill="url(#oppSilGrad)" opacity="0.7" />
          {/* Shoulder */}
          <ellipse cx="48" cy="50" rx="7" ry="5" fill="url(#oppSilGrad)" opacity="0.8" />
        </svg>
        <div className="start-char-glow start-char-glow-red" />
        <p className="start-char-label start-char-label-red">CPU</p>
      </div>

      {/* Center content */}
      <div className="start-content">
        <h1 ref={titleRef} className="start-title" style={{ opacity: 0 }}>
          <span className="start-title-accent">ARENA</span>
          <br />
          <span>BATTLE</span>
        </h1>

        <p ref={subtitleRef} className="start-subtitle" style={{ opacity: 0 }}>
          JEE PHYSICS THERMODYNAMICS
        </p>

        <div ref={dividerRef} className="start-divider" style={{ opacity: 0 }}>
          <div className="start-divider-glow" />
        </div>

        <p ref={taglineRef} className="start-tagline" style={{ opacity: 0 }}>
          ANSWER QUESTIONS. DEFEAT YOUR OPPONENT. BECOME THE CHAMPION.
        </p>

        <p ref={highscoreRef} className="start-highscore" style={{ opacity: 0 }}>
          HI-SCORE: 000000
        </p>

        <button
          ref={btnRef}
          className="start-btn"
          onClick={handleClick}
          style={{ opacity: 0 }}
        >
          <span className="start-btn-icon">&#9654;</span>
          START BATTLE
          <span className="start-btn-icon">&#9654;</span>
        </button>

        <p ref={coinRef} className="start-insert-coin" style={{ opacity: 0 }}>
          INSERT COIN TO PLAY
        </p>

        <p className="start-hint">PRESS START</p>
      </div>

      {/* ═══ Space stickers — positioned on full screen ═══ */}
      <div ref={stickersRef} className="start-stickers-zone">

        {/* Ringed gas giant — left side */}
        <div className="space-sticker sticker-planet-left" style={{ opacity: 0 }}>
          <svg viewBox="0 0 120 120" width="160" height="160">
            <defs>
              <linearGradient id="stkP1" x1="0.2" y1="0" x2="0.8" y2="1">
                <stop offset="0%" stopColor="#9a7aff" />
                <stop offset="40%" stopColor="#6a4acd" />
                <stop offset="100%" stopColor="#1a0a3a" />
              </linearGradient>
              <radialGradient id="stkP1g" cx="0.35" cy="0.35">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="60" cy="62" rx="52" ry="12" fill="none" stroke="#8b7ec8" strokeWidth="3" opacity="0.25" />
            <circle cx="60" cy="60" r="30" fill="url(#stkP1)" />
            <path d="M32 52 Q60 48 88 52" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
            <path d="M34 62 Q60 58 86 62" fill="none" stroke="rgba(200,180,255,0.06)" strokeWidth="5" />
            <path d="M36 72 Q60 68 84 72" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
            <circle cx="60" cy="60" r="30" fill="url(#stkP1g)" />
            <ellipse cx="60" cy="62" rx="52" ry="12" fill="none" stroke="#b8a0ff" strokeWidth="2.5" opacity="0.5"
              strokeDasharray="8 4" />
            <ellipse cx="60" cy="62" rx="46" ry="10" fill="none" stroke="#6a5acd" strokeWidth="1.5" opacity="0.2" />
            <circle cx="100" cy="30" r="6" fill="#4a3a6a" />
            <circle cx="98" cy="28" r="2" fill="rgba(255,255,255,0.12)" />
          </svg>
        </div>

        {/* Spaceship — right side */}
        <div className="space-sticker sticker-ship-right" style={{ opacity: 0 }}>
          <svg viewBox="0 0 140 80" width="180" height="100">
            <defs>
              <linearGradient id="stkShip" x1="0" y1="0" x2="1" y2="0.5">
                <stop offset="0%" stopColor="#1a2a40" />
                <stop offset="50%" stopColor="#2a4a6a" />
                <stop offset="100%" stopColor="#3a5a8a" />
              </linearGradient>
            </defs>
            <ellipse cx="8" cy="40" rx="12" ry="8" fill="#4a9eff" opacity="0.12" />
            <ellipse cx="6" cy="40" rx="8" ry="5" fill="#4a9eff" opacity="0.25" />
            <path d="M120 40 L100 18 L30 22 L8 40 L30 58 L100 62 Z"
              fill="url(#stkShip)" stroke="rgba(74,158,255,0.4)" strokeWidth="1.2" />
            <path d="M50 26 L50 54" stroke="rgba(74,158,255,0.1)" strokeWidth="0.8" />
            <path d="M75 22 L75 58" stroke="rgba(74,158,255,0.1)" strokeWidth="0.8" />
            <ellipse cx="106" cy="40" rx="10" ry="8"
              fill="#0a1a2a" stroke="rgba(74,158,255,0.6)" strokeWidth="1.2" />
            <ellipse cx="106" cy="40" rx="6" ry="5" fill="#4a9eff" opacity="0.3" />
            <ellipse cx="104" cy="38" rx="3" ry="2" fill="#8ac8ff" opacity="0.4" />
            <path d="M65 22 L50 4 L42 4 L55 22 Z" fill="#2a4060" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
            <path d="M65 58 L50 76 L42 76 L55 58 Z" fill="#2a4060" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
            <ellipse cx="12" cy="34" rx="5" ry="4" fill="#4a9eff" opacity="0.6" />
            <ellipse cx="12" cy="46" rx="5" ry="4" fill="#4a9eff" opacity="0.6" />
            <ellipse cx="12" cy="34" rx="3" ry="2.5" fill="#8ac8ff" opacity="0.5" />
            <ellipse cx="12" cy="46" rx="3" ry="2.5" fill="#8ac8ff" opacity="0.5" />
            <path d="M40 28 L95 24" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          </svg>
        </div>

        {/* Fiery meteoroid — upper-left */}
        <div className="space-sticker sticker-meteor-tl" style={{ opacity: 0 }}>
          <svg viewBox="0 0 100 80" width="130" height="104">
            <defs>
              <radialGradient id="stkMet" cx="0.6" cy="0.45">
                <stop offset="0%" stopColor="#8a6a4a" />
                <stop offset="60%" stopColor="#5a4030" />
                <stop offset="100%" stopColor="#3a2a1a" />
              </radialGradient>
            </defs>
            <path d="M50 36 Q30 32 14 28 Q4 26 -2 30" stroke="#ff8844" strokeWidth="3" opacity="0.25" fill="none" strokeLinecap="round" />
            <path d="M48 40 Q28 40 10 38 Q0 38 -4 42" stroke="#ff6622" strokeWidth="2" opacity="0.15" fill="none" strokeLinecap="round" />
            <path d="M46 44 Q30 46 16 44" stroke="#ff4400" strokeWidth="1.5" opacity="0.1" fill="none" strokeLinecap="round" />
            <circle cx="18" cy="30" r="2" fill="#ffaa44" opacity="0.3" />
            <circle cx="8" cy="34" r="1.5" fill="#ff8833" opacity="0.2" />
            <circle cx="24" cy="44" r="1.5" fill="#ff6622" opacity="0.2" />
            <path d="M58 18 L78 28 L84 44 L76 58 L58 62 L44 56 L38 40 L42 24 Z"
              fill="url(#stkMet)" stroke="rgba(255,170,80,0.25)" strokeWidth="1.2" />
            <circle cx="62" cy="36" r="6" fill="rgba(0,0,0,0.18)" />
            <circle cx="62" cy="36" r="5" fill="rgba(60,40,25,0.3)" />
            <circle cx="54" cy="50" r="4" fill="rgba(0,0,0,0.12)" />
            <circle cx="72" cy="46" r="3" fill="rgba(0,0,0,0.1)" />
            <path d="M48 26 L60 22 L70 28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
            <path d="M78 28 L84 44 L76 58" fill="none" stroke="#ff8844" strokeWidth="2" opacity="0.15" />
          </svg>
        </div>

        {/* Red Mars planet — upper-right */}
        <div className="space-sticker sticker-planet-tr" style={{ opacity: 0 }}>
          <svg viewBox="0 0 80 80" width="110" height="110">
            <defs>
              <radialGradient id="stkP2" cx="0.4" cy="0.35">
                <stop offset="0%" stopColor="#e06050" />
                <stop offset="50%" stopColor="#c44040" />
                <stop offset="100%" stopColor="#3a1515" />
              </radialGradient>
              <radialGradient id="stkP2g" cx="0.3" cy="0.3">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="40" cy="40" r="28" fill="url(#stkP2)" />
            <ellipse cx="34" cy="32" rx="8" ry="5" fill="rgba(180,60,40,0.4)" />
            <ellipse cx="50" cy="48" rx="10" ry="6" fill="rgba(150,50,30,0.3)" />
            <circle cx="28" cy="50" r="4" fill="rgba(120,40,25,0.3)" />
            <path d="M28 18 Q40 14 52 18" fill="rgba(255,255,255,0.1)" />
            <circle cx="40" cy="40" r="28" fill="url(#stkP2g)" />
            <circle cx="40" cy="40" r="28" fill="none" stroke="rgba(255,100,80,0.15)" strokeWidth="2" />
          </svg>
        </div>

        {/* Trailing meteoroid — lower-left */}
        <div className="space-sticker sticker-meteor-bl" style={{ opacity: 0 }}>
          <svg viewBox="0 0 120 60" width="150" height="75">
            <path d="M82 24 L50 20 L16 22" stroke="#ffaa44" strokeWidth="3" opacity="0.2" strokeLinecap="round" />
            <path d="M80 30 L44 28 L10 32" stroke="#ff8833" strokeWidth="2.5" opacity="0.14" strokeLinecap="round" />
            <path d="M78 36 L48 36 L20 40" stroke="#ff6622" strokeWidth="2" opacity="0.1" strokeLinecap="round" />
            <circle cx="30" cy="22" r="2" fill="#ffcc66" opacity="0.2" />
            <circle cx="18" cy="28" r="1.5" fill="#ffaa44" opacity="0.15" />
            <circle cx="40" cy="34" r="1.5" fill="#ff8844" opacity="0.12" />
            <path d="M88 16 L104 24 L108 36 L100 48 L86 50 L76 42 L74 28 Z"
              fill="#6a5a42" stroke="rgba(255,180,80,0.2)" strokeWidth="1" />
            <circle cx="92" cy="32" r="4" fill="rgba(0,0,0,0.15)" />
            <circle cx="86" cy="42" r="3" fill="rgba(0,0,0,0.1)" />
            <path d="M82 22 L94 20" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
          </svg>
        </div>

        {/* Green ocean planet — lower-right */}
        <div className="space-sticker sticker-planet-br" style={{ opacity: 0 }}>
          <svg viewBox="0 0 70 70" width="100" height="100">
            <defs>
              <radialGradient id="stkP3" cx="0.4" cy="0.35">
                <stop offset="0%" stopColor="#6aeaa0" />
                <stop offset="50%" stopColor="#4eca78" />
                <stop offset="100%" stopColor="#1a4a2a" />
              </radialGradient>
            </defs>
            <circle cx="35" cy="35" r="24" fill="url(#stkP3)" />
            <path d="M24 28 Q30 24 36 28 Q34 34 26 32 Z" fill="rgba(80,200,120,0.4)" />
            <path d="M38 36 Q46 34 48 40 Q44 46 38 42 Z" fill="rgba(80,200,120,0.35)" />
            <ellipse cx="30" cy="24" rx="8" ry="2.5" fill="rgba(255,255,255,0.12)" />
            <ellipse cx="42" cy="44" rx="6" ry="2" fill="rgba(255,255,255,0.1)" />
            <ellipse cx="28" cy="26" rx="6" ry="4" fill="rgba(255,255,255,0.1)" />
            <circle cx="35" cy="35" r="24" fill="none" stroke="rgba(78,202,120,0.12)" strokeWidth="2" />
          </svg>
        </div>

      </div>

      {/* Credits at bottom */}
      <div className="start-credits">
        &copy; 2026 ARENA BATTLE CO. &nbsp; ALL RIGHTS RESERVED
      </div>
    </div>
  );
}
