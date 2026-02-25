import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * Retro gaming cursor for desktop users.
 * Hides native cursor, shows an animated crosshair that follows the mouse.
 * Automatically disabled on touch/mobile devices.
 */
export function GameCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Skip on touch devices
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const hasTouchEvents = 'ontouchstart' in window;
    if (hasCoarsePointer || hasTouchEvents) {
      setIsTouch(true);
      return;
    }

    const cursor = cursorRef.current;
    const trail = trailRef.current;
    const ring = ringRef.current;
    if (!cursor || !trail || !ring) return;

    // Hide native cursor globally via CSS class
    document.documentElement.classList.add('game-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      if (!visible) setVisible(true);

      // Main cursor follows instantly
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.08,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      // Trail follows with lag
      gsap.to(trail, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      // Ring follows with more lag
      gsap.to(ring, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = (e: MouseEvent) => {
      setVisible(true);
      // Snap to position immediately on enter
      gsap.set([cursor, trail, ring], { x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Slow rotation on ring
    gsap.to(ring, {
      rotation: 360,
      duration: 6,
      repeat: -1,
      ease: 'none',
    });

    return () => {
      document.documentElement.classList.remove('game-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [visible]);

  if (isTouch) return null;

  return (
    <>
      {/* Outer rotating ring */}
      <div
        ref={ringRef}
        className="game-cursor-ring"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <svg viewBox="0 0 48 48" width="48" height="48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#4a9eff" strokeWidth="1" opacity="0.2"
            strokeDasharray="4 6" />
          {/* Corner tick marks */}
          <line x1="24" y1="2" x2="24" y2="6" stroke="#ffd700" strokeWidth="1.5" opacity="0.5" />
          <line x1="24" y1="42" x2="24" y2="46" stroke="#ffd700" strokeWidth="1.5" opacity="0.5" />
          <line x1="2" y1="24" x2="6" y2="24" stroke="#ffd700" strokeWidth="1.5" opacity="0.5" />
          <line x1="42" y1="24" x2="46" y2="24" stroke="#ffd700" strokeWidth="1.5" opacity="0.5" />
        </svg>
      </div>

      {/* Trail glow */}
      <div
        ref={trailRef}
        className="game-cursor-trail"
        style={{ opacity: visible ? 1 : 0 }}
      />

      {/* Main crosshair cursor */}
      <div
        ref={cursorRef}
        className={`game-cursor-main ${isClicking ? 'game-cursor-click' : ''}`}
        style={{ opacity: visible ? 1 : 0 }}
      >
        <svg viewBox="0 0 32 32" width="32" height="32">
          {/* Center diamond */}
          <rect x="14" y="14" width="4" height="4" fill="#ffd700"
            transform="rotate(45 16 16)" opacity="0.9" />

          {/* Crosshair lines */}
          <line x1="16" y1="2" x2="16" y2="11" stroke="#4a9eff" strokeWidth="2" strokeLinecap="square" />
          <line x1="16" y1="21" x2="16" y2="30" stroke="#4a9eff" strokeWidth="2" strokeLinecap="square" />
          <line x1="2" y1="16" x2="11" y2="16" stroke="#4a9eff" strokeWidth="2" strokeLinecap="square" />
          <line x1="21" y1="16" x2="30" y2="16" stroke="#4a9eff" strokeWidth="2" strokeLinecap="square" />

          {/* Corner brackets */}
          <path d="M4 4 L4 8 M4 4 L8 4" stroke="#e04060" strokeWidth="1.5" fill="none" strokeLinecap="square" />
          <path d="M28 4 L28 8 M28 4 L24 4" stroke="#e04060" strokeWidth="1.5" fill="none" strokeLinecap="square" />
          <path d="M4 28 L4 24 M4 28 L8 28" stroke="#e04060" strokeWidth="1.5" fill="none" strokeLinecap="square" />
          <path d="M28 28 L28 24 M28 28 L24 28" stroke="#e04060" strokeWidth="1.5" fill="none" strokeLinecap="square" />
        </svg>
      </div>
    </>
  );
}
