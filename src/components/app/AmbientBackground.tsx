/**
 * AmbientBackground — full Vegas-strip atmospheric backdrop for authed pages.
 *
 * Layers (back to front):
 *  1. Slow whole-viewport breathing wash.
 *  2. Ten GIANT blurred PLAYING-CARD SUIT shapes (replacing orbs) drifting,
 *     pulsing, and breathing. Each gets the TAG/Vegas color palette via
 *     text-shadow halos.
 *  3. Aurora gradient panning across the middle band.
 *  4. Two SEARCHLIGHT beams sweeping in opposite directions.
 *  5. Six COMET streaks at varied angles and timings.
 *  6. Twenty rising EMBER particles.
 *  7. Twelve TWINKLE stars popping in and out.
 *  8. Six small floating PLAYING-CARD SUITS rising upward with rotation.
 *  9. MARQUEE bulb chase along top + bottom edges.
 *
 * Fixed to viewport, behind content (z-0), pointer-events:none.
 * All motion respects prefers-reduced-motion.
 */
export function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      <style>{`
        @keyframes ambient-pulse-bg { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
        @keyframes ambient-drift-1 { 0%,100% { transform: translate(-15%, -12%) scale(1) rotate(0deg); } 50% { transform: translate(28%, 22%) scale(1.3) rotate(15deg); } }
        @keyframes ambient-drift-2 { 0%,100% { transform: translate(20%, 32%) scale(1.2) rotate(-10deg); } 50% { transform: translate(-28%, -10%) scale(0.9) rotate(8deg); } }
        @keyframes ambient-drift-3 {
          0%   { transform: translate(-50%, -50%) scale(0.85) rotate(0deg); }
          33%  { transform: translate(-78%, -22%) scale(1.15) rotate(20deg); }
          66%  { transform: translate(-22%, -78%) scale(1.25) rotate(-15deg); }
          100% { transform: translate(-50%, -50%) scale(0.85) rotate(0deg); }
        }
        @keyframes ambient-drift-4 { 0%,100% { transform: translate(60%, -30%) scale(0.85) rotate(0deg); } 50% { transform: translate(-25%, 55%) scale(1.15) rotate(25deg); } }
        @keyframes ambient-drift-5 { 0%,100% { transform: translate(-45%, 60%) scale(1) rotate(0deg); } 50% { transform: translate(45%, -25%) scale(1.25) rotate(-20deg); } }
        @keyframes ambient-drift-6 { 0%,100% { transform: translate(70%, 70%) scale(0.9) rotate(0deg); } 50% { transform: translate(-30%, -30%) scale(1.1) rotate(18deg); } }
        @keyframes ambient-drift-7 { 0%,100% { transform: translate(-60%, -10%) scale(0.95) rotate(-5deg); } 50% { transform: translate(60%, 20%) scale(1.2) rotate(12deg); } }
        @keyframes ambient-drift-pink { 0%,100% { transform: translate(40%, -40%) scale(0.95) rotate(0deg); } 50% { transform: translate(-50%, 40%) scale(1.2) rotate(30deg); } }
        @keyframes ambient-drift-purple { 0%,100% { transform: translate(-30%, 20%) scale(1) rotate(-15deg); } 50% { transform: translate(30%, -40%) scale(1.25) rotate(20deg); } }
        @keyframes ambient-drift-cyan { 0%,100% { transform: translate(20%, 60%) scale(0.85) rotate(0deg); } 50% { transform: translate(-40%, -30%) scale(1.15) rotate(-25deg); } }
        @keyframes ambient-aurora-pan {
          0%   { transform: translateX(-45%); opacity: 0.0; }
          25%  { opacity: 0.95; }
          50%  { transform: translateX(0%); opacity: 0.95; }
          75%  { opacity: 0.95; }
          100% { transform: translateX(45%); opacity: 0.0; }
        }
        @keyframes ambient-searchlight {
          0%   { transform: translateX(-30vw) rotate(8deg); opacity: 0; }
          12%  { opacity: 0.6; }
          88%  { opacity: 0.6; }
          100% { transform: translateX(130vw) rotate(8deg); opacity: 0; }
        }
        @keyframes ambient-searchlight-2 {
          0%   { transform: translateX(130vw) rotate(-12deg); opacity: 0; }
          12%  { opacity: 0.55; }
          88%  { opacity: 0.55; }
          100% { transform: translateX(-30vw) rotate(-12deg); opacity: 0; }
        }
        @keyframes ambient-comet-a {
          0%   { transform: translate(-25vw, -25vh) rotate(35deg) scaleX(0.5); opacity: 0; }
          5%   { opacity: 0.95; }
          18%  { transform: translate(125vw, 80vh) rotate(35deg) scaleX(1); opacity: 0; }
          100% { transform: translate(125vw, 80vh) rotate(35deg) scaleX(1); opacity: 0; }
        }
        @keyframes ambient-comet-b {
          0%   { transform: translate(125vw, 10vh) rotate(155deg) scaleX(0.5); opacity: 0; }
          5%   { opacity: 0.95; }
          18%  { transform: translate(-30vw, 80vh) rotate(155deg) scaleX(1); opacity: 0; }
          100% { transform: translate(-30vw, 80vh) rotate(155deg) scaleX(1); opacity: 0; }
        }
        @keyframes ambient-comet-c {
          0%   { transform: translate(-25vw, 100vh) rotate(-25deg) scaleX(0.5); opacity: 0; }
          5%   { opacity: 0.9; }
          20%  { transform: translate(125vw, -10vh) rotate(-25deg) scaleX(1); opacity: 0; }
          100% { transform: translate(125vw, -10vh) rotate(-25deg) scaleX(1); opacity: 0; }
        }
        @keyframes ambient-comet-d {
          0%   { transform: translate(50vw, -25vh) rotate(95deg) scaleX(0.5); opacity: 0; }
          5%   { opacity: 0.95; }
          20%  { transform: translate(50vw, 110vh) rotate(95deg) scaleX(1); opacity: 0; }
          100% { transform: translate(50vw, 110vh) rotate(95deg) scaleX(1); opacity: 0; }
        }
        @keyframes ambient-comet-e {
          0%   { transform: translate(-25vw, 50vh) rotate(0deg) scaleX(0.5); opacity: 0; }
          5%   { opacity: 0.95; }
          20%  { transform: translate(125vw, 50vh) rotate(0deg) scaleX(1); opacity: 0; }
          100% { transform: translate(125vw, 50vh) rotate(0deg) scaleX(1); opacity: 0; }
        }
        @keyframes ambient-comet-f {
          0%   { transform: translate(125vw, 90vh) rotate(-145deg) scaleX(0.5); opacity: 0; }
          5%   { opacity: 0.95; }
          20%  { transform: translate(-30vw, -10vh) rotate(-145deg) scaleX(1); opacity: 0; }
          100% { transform: translate(-30vw, -10vh) rotate(-145deg) scaleX(1); opacity: 0; }
        }
        @keyframes ambient-ember-rise {
          0%   { transform: translate3d(var(--ax), 105vh, 0) scale(0.5); opacity: 0; }
          8%   { opacity: 0.95; }
          85%  { opacity: 0.7; }
          100% { transform: translate3d(calc(var(--ax) + var(--adx)), -10vh, 0) scale(1.2); opacity: 0; }
        }
        @keyframes ambient-twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          15%      { opacity: 0; transform: scale(0.5); }
          25%      { opacity: 1; transform: scale(1.4); }
          50%      { opacity: 0.6; transform: scale(0.9); }
          75%      { opacity: 1; transform: scale(1.4); }
          85%      { opacity: 0; transform: scale(0.5); }
        }
        @keyframes ambient-suit-rise {
          0%   { transform: translate3d(var(--sx), 105vh, 0) rotate(0deg) scale(0.7); opacity: 0; }
          10%  { opacity: 0.85; }
          85%  { opacity: 0.55; }
          100% { transform: translate3d(calc(var(--sx) + var(--sdx)), -15vh, 0) rotate(var(--sr, 360deg)) scale(1); opacity: 0; }
        }
        @keyframes ambient-glow-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes marquee-chase { 0% { background-position: 0 0; } 100% { background-position: 28px 0; } }
        @keyframes marquee-glow { 0%,100% { opacity: 0.85; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .ambient-bg-pulse,
          .ambient-suit-orb,
          .ambient-aurora,
          .ambient-searchlight,
          .ambient-comet,
          .ambient-ember,
          .ambient-twinkle,
          .ambient-suit,
          .ambient-marquee { animation: none !important; }
        }
        .ambient-suit-orb {
          font-weight: 900;
          line-height: 1;
          will-change: transform, opacity;
        }
      `}</style>

      {/* Static color-depth wash — keeps the background from looking pale */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, rgba(20, 89, 91, 0.32) 0%, transparent 45%),' +
            'radial-gradient(circle at 85% 30%, rgba(192, 138, 48, 0.28) 0%, transparent 45%),' +
            'radial-gradient(circle at 70% 75%, rgba(236, 72, 153, 0.22) 0%, transparent 45%),' +
            'radial-gradient(circle at 25% 80%, rgba(168, 85, 247, 0.22) 0%, transparent 45%),' +
            'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.16) 0%, transparent 55%)',
        }}
      />

      {/* Whole-viewport breathing wash */}
      <div
        className="ambient-bg-pulse absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(20, 89, 91, 0.18) 0%, transparent 70%)',
          animation: 'ambient-pulse-bg 9s ease-in-out infinite',
        }}
      />

      {/* (giant drift-suits removed — only rising floating suits remain, see below) */}

      {/* Aurora */}
      <div
        className="ambient-aurora absolute left-0 right-0 top-1/3 h-[55vh] w-[200%]"
        style={{
          background:
            'linear-gradient(110deg, transparent 0%, rgba(232, 185, 91, 0.30) 20%, rgba(20, 89, 91, 0.45) 40%, rgba(236, 72, 153, 0.30) 60%, rgba(168, 85, 247, 0.25) 80%, transparent 100%)',
          filter: 'blur(35px)',
          animation: 'ambient-aurora-pan 12s ease-in-out infinite alternate',
        }}
      />

      {/* Marquee bulb chase — top */}
      <div
        className="ambient-marquee absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background:
            'repeating-linear-gradient(90deg, rgba(232, 185, 91, 1) 0 6px, rgba(232, 185, 91, 0.1) 6px 14px, rgba(255, 255, 255, 1) 14px 20px, rgba(232, 185, 91, 0.1) 20px 28px)',
          boxShadow: '0 0 8px rgba(232, 185, 91, 0.9), 0 0 18px rgba(232, 185, 91, 0.6)',
          animation: 'marquee-chase 0.9s linear infinite, marquee-glow 1.6s ease-in-out infinite',
        }}
      />
      {/* Marquee bulb chase — bottom */}
      <div
        className="ambient-marquee absolute bottom-0 left-0 right-0 h-[3px]"
        style={{
          background:
            'repeating-linear-gradient(90deg, rgba(236, 72, 153, 1) 0 6px, rgba(236, 72, 153, 0.1) 6px 14px, rgba(34, 211, 238, 1) 14px 20px, rgba(34, 211, 238, 0.1) 20px 28px)',
          boxShadow: '0 0 8px rgba(236, 72, 153, 0.9), 0 0 18px rgba(34, 211, 238, 0.6)',
          animation: 'marquee-chase 1.1s linear infinite reverse, marquee-glow 2s ease-in-out infinite',
        }}
      />

      {/* Searchlights — two beams */}
      <div
        className="ambient-searchlight absolute top-0 bottom-0 w-[7vw] -ml-[3.5vw]"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.22) 20%, rgba(255, 255, 255, 0.55) 50%, rgba(255, 255, 255, 0.22) 80%, transparent 100%)',
          filter: 'blur(8px)',
          animation: 'ambient-searchlight 18s linear infinite',
        }}
      />
      <div
        className="ambient-searchlight absolute top-0 bottom-0 w-[6vw] -ml-[3vw]"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(232, 185, 91, 0.32) 30%, rgba(232, 185, 91, 0.65) 50%, rgba(232, 185, 91, 0.32) 70%, transparent 100%)',
          filter: 'blur(10px)',
          animation: 'ambient-searchlight-2 22s linear infinite',
          animationDelay: '4s',
        }}
      />

      {/* Comets — six streaks at varied angles */}
      {COMETS.map((c, i) => (
        <div
          key={`c${i}`}
          className="ambient-comet absolute top-0 left-0 h-[3px]"
          style={{
            width: c.length,
            background: `linear-gradient(90deg, transparent 0%, ${c.color.replace('1)', '0)')} 5%, ${c.color} 80%, rgba(255, 255, 255, 1) 100%)`,
            boxShadow: `0 0 30px ${c.color}, 0 0 60px ${c.color.replace('1)', '0.5)')}`,
            transformOrigin: '100% 50%',
            animation: `${c.anim} ${c.duration}s linear infinite`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* (round embers + twinkles removed — suits-only motion) */}

      {/* Floating small suit symbols */}
      {SUITS.map((s, i) => (
        <span
          key={`s${i}`}
          className="ambient-suit absolute block select-none font-bold"
          style={{
            left: 0,
            top: 0,
            color: s.color,
            fontSize: s.size,
            textShadow: `0 0 12px ${s.color}, 0 0 24px ${s.color}`,
            ['--sx' as string]: s.startX,
            ['--sdx' as string]: s.driftX,
            ['--sr' as string]: s.rotateEnd,
            animation: `ambient-suit-rise ${s.duration}s linear ${s.delay}s infinite`,
            opacity: 0,
          }}
        >
          {s.glyph}
        </span>
      ))}
    </div>
  );
}

// (No drift-orbs — background is the rising-suit layer below.)

const COMETS: { length: string; color: string; anim: string; duration: number; delay: number }[] = [
  { length: '60vw', color: 'rgba(232, 185, 91, 1)', anim: 'ambient-comet-a', duration: 9,  delay: 0 },
  { length: '55vw', color: 'rgba(236, 72, 153, 1)', anim: 'ambient-comet-b', duration: 11, delay: 2 },
  { length: '58vw', color: 'rgba(34, 211, 238, 1)', anim: 'ambient-comet-c', duration: 10, delay: 4 },
  { length: '52vw', color: 'rgba(168, 85, 247, 1)', anim: 'ambient-comet-d', duration: 12, delay: 6 },
  { length: '70vw', color: 'rgba(255, 255, 255, 1)', anim: 'ambient-comet-e', duration: 8,  delay: 8 },
  { length: '54vw', color: 'rgba(232, 185, 91, 1)', anim: 'ambient-comet-f', duration: 11, delay: 1 },
];

const EMBERS: { size: string; color: string; glow: number; startX: string; driftX: string; duration: number; delay: number }[] = [
  { size: '6px', color: 'rgba(232, 185, 91, 1)',   glow: 14, startX: '6vw',  driftX: '10vw',  duration: 10, delay: 0 },
  { size: '5px', color: 'rgba(20, 89, 91, 1)',     glow: 12, startX: '14vw', driftX: '-6vw',  duration: 13, delay: 1.5 },
  { size: '7px', color: 'rgba(236, 72, 153, 1)',   glow: 16, startX: '22vw', driftX: '12vw',  duration: 11, delay: 3 },
  { size: '4px', color: 'rgba(168, 85, 247, 1)',   glow: 10, startX: '30vw', driftX: '-8vw',  duration: 9,  delay: 0.5 },
  { size: '6px', color: 'rgba(192, 138, 48, 1)',   glow: 14, startX: '38vw', driftX: '6vw',   duration: 12, delay: 4 },
  { size: '5px', color: 'rgba(34, 211, 238, 1)',   glow: 12, startX: '46vw', driftX: '-4vw',  duration: 10, delay: 2 },
  { size: '7px', color: 'rgba(232, 185, 91, 0.95)', glow: 16, startX: '54vw', driftX: '8vw',   duration: 14, delay: 5 },
  { size: '4px', color: 'rgba(15, 123, 74, 1)',    glow: 10, startX: '62vw', driftX: '-9vw',  duration: 8,  delay: 1 },
  { size: '6px', color: 'rgba(236, 72, 153, 0.95)', glow: 14, startX: '70vw', driftX: '5vw',   duration: 12, delay: 6 },
  { size: '5px', color: 'rgba(192, 138, 48, 1)',   glow: 12, startX: '78vw', driftX: '-7vw',  duration: 11, delay: 3.5 },
  { size: '7px', color: 'rgba(168, 85, 247, 1)',   glow: 16, startX: '86vw', driftX: '4vw',   duration: 13, delay: 7 },
  { size: '4px', color: 'rgba(20, 89, 91, 1)',     glow: 10, startX: '94vw', driftX: '-3vw',  duration: 9,  delay: 2.5 },
  { size: '6px', color: 'rgba(34, 211, 238, 0.95)', glow: 14, startX: '10vw', driftX: '-2vw',  duration: 15, delay: 8 },
  { size: '5px', color: 'rgba(192, 138, 48, 1)',   glow: 12, startX: '50vw', driftX: '14vw',  duration: 12, delay: 4.5 },
  { size: '7px', color: 'rgba(255, 255, 255, 0.85)', glow: 16, startX: '90vw', driftX: '-12vw', duration: 14, delay: 9 },
  { size: '4px', color: 'rgba(232, 185, 91, 1)',   glow: 10, startX: '34vw', driftX: '7vw',   duration: 10, delay: 5.5 },
  { size: '6px', color: 'rgba(236, 72, 153, 0.95)', glow: 14, startX: '66vw', driftX: '-5vw',  duration: 13, delay: 6.5 },
  { size: '5px', color: 'rgba(168, 85, 247, 1)',   glow: 12, startX: '18vw', driftX: '11vw',  duration: 11, delay: 7.5 },
  { size: '4px', color: 'rgba(255, 255, 255, 0.7)', glow: 8,  startX: '74vw', driftX: '-6vw',  duration: 9,  delay: 8.5 },
  { size: '7px', color: 'rgba(192, 138, 48, 1)',   glow: 16, startX: '42vw', driftX: '-8vw',  duration: 14, delay: 10 },
];

const TWINKLES: { x: string; y: string; size: string; color: string; glow: number; duration: number; delay: number }[] = [
  { x: '8vw',  y: '10vh', size: '3px', color: 'rgba(255, 255, 255, 1)', glow: 8,  duration: 4, delay: 0 },
  { x: '24vw', y: '18vh', size: '2px', color: 'rgba(232, 185, 91, 1)', glow: 6,  duration: 5, delay: 1.2 },
  { x: '42vw', y: '14vh', size: '4px', color: 'rgba(236, 72, 153, 1)', glow: 10, duration: 4.5, delay: 2.4 },
  { x: '60vw', y: '22vh', size: '3px', color: 'rgba(34, 211, 238, 1)', glow: 8,  duration: 5.5, delay: 0.6 },
  { x: '78vw', y: '8vh',  size: '2px', color: 'rgba(255, 255, 255, 1)', glow: 6,  duration: 4, delay: 3 },
  { x: '92vw', y: '28vh', size: '3px', color: 'rgba(168, 85, 247, 1)', glow: 8,  duration: 5, delay: 1.8 },
  { x: '14vw', y: '52vh', size: '4px', color: 'rgba(232, 185, 91, 1)', glow: 10, duration: 4, delay: 2.2 },
  { x: '36vw', y: '62vh', size: '3px', color: 'rgba(255, 255, 255, 1)', glow: 8,  duration: 5, delay: 4.4 },
  { x: '54vw', y: '54vh', size: '2px', color: 'rgba(236, 72, 153, 1)', glow: 6,  duration: 4.5, delay: 1 },
  { x: '70vw', y: '60vh', size: '3px', color: 'rgba(34, 211, 238, 1)', glow: 8,  duration: 5, delay: 3.6 },
  { x: '20vw', y: '78vh', size: '4px', color: 'rgba(168, 85, 247, 1)', glow: 10, duration: 4.5, delay: 2.8 },
  { x: '88vw', y: '74vh', size: '3px', color: 'rgba(255, 255, 255, 1)', glow: 8,  duration: 4, delay: 0.4 },
];

// Rising suits — main background motion. Mix of huge, medium, and small
// floating suits drifting upward at varied speeds, with rotation and glow.
const SUITS: { glyph: string; color: string; size: string; startX: string; driftX: string; duration: number; delay: number; rotateEnd: string }[] = [
  // Huge anchor suits (slow, dominant)
  { glyph: '♠', color: 'rgba(20, 89, 91, 0.7)',    size: '12rem', startX: '5vw',  driftX: '6vw',  duration: 28, delay: 0,   rotateEnd: '180deg' },
  { glyph: '♦', color: 'rgba(192, 138, 48, 0.78)', size: '10rem', startX: '70vw', driftX: '-8vw', duration: 32, delay: 6,   rotateEnd: '-360deg' },
  { glyph: '♣', color: 'rgba(168, 85, 247, 0.7)',  size: '11rem', startX: '40vw', driftX: '5vw',  duration: 30, delay: 12,  rotateEnd: '270deg' },
  { glyph: '♥', color: 'rgba(236, 72, 153, 0.78)', size: '9rem',  startX: '85vw', driftX: '-10vw', duration: 26, delay: 18, rotateEnd: '-540deg' },
  // Large suits
  { glyph: '♥', color: 'rgba(232, 185, 91, 0.75)', size: '7rem',  startX: '20vw', driftX: '8vw',  duration: 22, delay: 3,   rotateEnd: '360deg' },
  { glyph: '♠', color: 'rgba(11, 47, 49, 0.75)',   size: '6rem',  startX: '55vw', driftX: '-6vw', duration: 24, delay: 9,   rotateEnd: '-360deg' },
  { glyph: '♦', color: 'rgba(34, 211, 238, 0.78)', size: '7rem',  startX: '92vw', driftX: '-12vw', duration: 26, delay: 15, rotateEnd: '720deg' },
  { glyph: '♣', color: 'rgba(15, 123, 74, 0.7)',   size: '6rem',  startX: '12vw', driftX: '10vw', duration: 23, delay: 21,  rotateEnd: '540deg' },
  // Medium suits
  { glyph: '♠', color: 'rgba(232, 185, 91, 0.78)', size: '4rem',  startX: '32vw', driftX: '7vw',  duration: 19, delay: 1.5, rotateEnd: '360deg' },
  { glyph: '♥', color: 'rgba(236, 72, 153, 0.85)', size: '3.5rem', startX: '48vw', driftX: '-6vw', duration: 17, delay: 4.5, rotateEnd: '-360deg' },
  { glyph: '♦', color: 'rgba(34, 211, 238, 0.85)', size: '4rem',  startX: '62vw', driftX: '10vw', duration: 21, delay: 7.5, rotateEnd: '720deg' },
  { glyph: '♣', color: 'rgba(168, 85, 247, 0.8)',  size: '3.5rem', startX: '78vw', driftX: '-9vw', duration: 18, delay: 10.5, rotateEnd: '-540deg' },
  { glyph: '♥', color: 'rgba(232, 185, 91, 0.8)',  size: '3rem',  startX: '8vw',  driftX: '5vw',  duration: 16, delay: 13.5, rotateEnd: '360deg' },
  { glyph: '♠', color: 'rgba(255, 255, 255, 0.65)', size: '3.5rem', startX: '88vw', driftX: '-8vw', duration: 19, delay: 16.5, rotateEnd: '-360deg' },
  { glyph: '♦', color: 'rgba(236, 72, 153, 0.8)',  size: '4rem',  startX: '38vw', driftX: '14vw', duration: 22, delay: 19.5, rotateEnd: '540deg' },
  { glyph: '♣', color: 'rgba(34, 211, 238, 0.8)',  size: '3rem',  startX: '72vw', driftX: '-12vw', duration: 20, delay: 22.5, rotateEnd: '-720deg' },
  // Small fast suits
  { glyph: '♥', color: 'rgba(236, 72, 153, 0.9)',  size: '2rem',  startX: '15vw', driftX: '4vw',  duration: 14, delay: 2,   rotateEnd: '360deg' },
  { glyph: '♦', color: 'rgba(232, 185, 91, 0.9)',  size: '2rem',  startX: '50vw', driftX: '-3vw', duration: 13, delay: 5,   rotateEnd: '-360deg' },
  { glyph: '♠', color: 'rgba(168, 85, 247, 0.85)', size: '2.5rem', startX: '65vw', driftX: '6vw',  duration: 15, delay: 8,   rotateEnd: '720deg' },
  { glyph: '♣', color: 'rgba(20, 89, 91, 0.85)',   size: '2rem',  startX: '90vw', driftX: '-5vw', duration: 12, delay: 11,  rotateEnd: '-360deg' },
  { glyph: '♥', color: 'rgba(34, 211, 238, 0.85)', size: '2.5rem', startX: '25vw', driftX: '-4vw', duration: 14, delay: 17,  rotateEnd: '360deg' },
  { glyph: '♠', color: 'rgba(192, 138, 48, 0.85)', size: '2rem',  startX: '58vw', driftX: '7vw',  duration: 13, delay: 20,  rotateEnd: '-360deg' },
];
