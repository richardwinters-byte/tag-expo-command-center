/**
 * AmbientBackground — Vegas-inspired atmospheric backdrop for authed pages.
 *
 * Layers (back to front):
 *  1. Slow whole-viewport breathing wash.
 *  2. Ten color orbs — TAG teal/gold core PLUS Vegas neons (hot pink,
 *     electric purple, cyan) — drift, breathe, and pulse fast.
 *  3. Aurora gradient panning across the middle band.
 *  4. A vertical SEARCHLIGHT beam that sweeps left-to-right.
 *  5. A diagonal COMET streak that arcs across periodically.
 *  6. Twenty rising EMBER particles (gold/teal/neon mix).
 *  7. Twelve TWINKLE stars that pop in and out at varied positions.
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
        @keyframes ambient-drift-1 { 0%,100% { transform: translate(-15%, -12%) scale(1); } 50% { transform: translate(28%, 22%) scale(1.3); } }
        @keyframes ambient-drift-2 { 0%,100% { transform: translate(20%, 32%) scale(1.2); } 50% { transform: translate(-28%, -10%) scale(0.9); } }
        @keyframes ambient-drift-3 {
          0%   { transform: translate(-50%, -50%) scale(0.85); }
          33%  { transform: translate(-78%, -22%) scale(1.15); }
          66%  { transform: translate(-22%, -78%) scale(1.25); }
          100% { transform: translate(-50%, -50%) scale(0.85); }
        }
        @keyframes ambient-drift-4 { 0%,100% { transform: translate(60%, -30%) scale(0.85); } 50% { transform: translate(-25%, 55%) scale(1.15); } }
        @keyframes ambient-drift-5 { 0%,100% { transform: translate(-45%, 60%) scale(1); } 50% { transform: translate(45%, -25%) scale(1.25); } }
        @keyframes ambient-drift-6 { 0%,100% { transform: translate(70%, 70%) scale(0.9); } 50% { transform: translate(-30%, -30%) scale(1.1); } }
        @keyframes ambient-drift-7 { 0%,100% { transform: translate(-60%, -10%) scale(0.95); } 50% { transform: translate(60%, 20%) scale(1.2); } }
        @keyframes ambient-drift-pink { 0%,100% { transform: translate(40%, -40%) scale(0.9); } 50% { transform: translate(-50%, 40%) scale(1.15); } }
        @keyframes ambient-drift-purple { 0%,100% { transform: translate(-30%, 20%) scale(1); } 50% { transform: translate(30%, -40%) scale(1.2); } }
        @keyframes ambient-drift-cyan { 0%,100% { transform: translate(20%, 60%) scale(0.85); } 50% { transform: translate(-40%, -30%) scale(1.1); } }
        @keyframes ambient-aurora-pan {
          0%   { transform: translateX(-45%); opacity: 0.0; }
          25%  { opacity: 0.85; }
          50%  { transform: translateX(0%); opacity: 0.85; }
          75%  { opacity: 0.85; }
          100% { transform: translateX(45%); opacity: 0.0; }
        }
        @keyframes ambient-searchlight {
          0%   { transform: translateX(-30vw) rotate(8deg); opacity: 0; }
          15%  { opacity: 0.55; }
          50%  { opacity: 0.55; }
          85%  { opacity: 0.55; }
          100% { transform: translateX(130vw) rotate(8deg); opacity: 0; }
        }
        @keyframes ambient-comet {
          0%   { transform: translate(-20vw, -20vh) rotate(35deg) scaleX(0.5); opacity: 0; }
          5%   { opacity: 0.95; }
          18%  { transform: translate(120vw, 80vh) rotate(35deg) scaleX(1); opacity: 0; }
          100% { transform: translate(120vw, 80vh) rotate(35deg) scaleX(1); opacity: 0; }
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
          25%      { opacity: 1; transform: scale(1.2); }
          50%      { opacity: 0.6; transform: scale(0.9); }
          75%      { opacity: 1; transform: scale(1.3); }
          85%      { opacity: 0; transform: scale(0.5); }
        }
        @keyframes ambient-glow-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (prefers-reduced-motion: reduce) {
          .ambient-bg-pulse,
          .ambient-orb,
          .ambient-aurora,
          .ambient-searchlight,
          .ambient-comet,
          .ambient-ember,
          .ambient-twinkle { animation: none !important; }
        }
      `}</style>

      {/* Whole-viewport breathing wash */}
      <div
        className="ambient-bg-pulse absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(20, 89, 91, 0.12) 0%, transparent 70%)',
          animation: 'ambient-pulse-bg 9s ease-in-out infinite',
        }}
      />

      {/* Orb 1 — teal, top-left */}
      <div
        className="ambient-orb absolute top-0 left-0 w-[55rem] h-[55rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(20, 89, 91, 0.95) 0%, rgba(20, 89, 91, 0.3) 35%, transparent 65%)',
          filter: 'blur(80px)',
          animation: 'ambient-drift-1 14s ease-in-out infinite, ambient-glow-pulse 5s ease-in-out infinite',
        }}
      />

      {/* Orb 2 — gold, bottom-right */}
      <div
        className="ambient-orb absolute bottom-0 right-0 w-[48rem] h-[48rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(192, 138, 48, 0.78) 0%, rgba(192, 138, 48, 0.22) 40%, transparent 65%)',
          filter: 'blur(90px)',
          animation: 'ambient-drift-2 18s ease-in-out infinite, ambient-glow-pulse 7s ease-in-out infinite',
        }}
      />

      {/* Orb 3 — cool green, roving centre */}
      <div
        className="ambient-orb absolute left-1/2 top-1/2 w-[36rem] h-[36rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(15, 123, 74, 0.7) 0%, rgba(15, 123, 74, 0.22) 45%, transparent 70%)',
          filter: 'blur(85px)',
          animation: 'ambient-drift-3 22s ease-in-out infinite',
        }}
      />

      {/* Orb 4 — bright gold, top-right */}
      <div
        className="ambient-orb absolute top-0 right-0 w-[28rem] h-[28rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(232, 185, 91, 0.7) 0%, transparent 60%)',
          filter: 'blur(70px)',
          animation: 'ambient-drift-4 12s ease-in-out infinite, ambient-glow-pulse 4s ease-in-out infinite',
        }}
      />

      {/* Orb 5 — deep teal, bottom-left */}
      <div
        className="ambient-orb absolute bottom-0 left-0 w-[34rem] h-[34rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(11, 47, 49, 0.7) 0%, rgba(11, 47, 49, 0.18) 45%, transparent 70%)',
          filter: 'blur(75px)',
          animation: 'ambient-drift-5 16s ease-in-out infinite',
        }}
      />

      {/* Orb 6 — gold accent, lower-right roaming */}
      <div
        className="ambient-orb absolute right-0 bottom-1/3 w-[22rem] h-[22rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(232, 185, 91, 0.6) 0%, transparent 55%)',
          filter: 'blur(60px)',
          animation: 'ambient-drift-6 10s ease-in-out infinite, ambient-glow-pulse 3.5s ease-in-out infinite',
        }}
      />

      {/* Orb 7 — bright teal, mid-left roaming */}
      <div
        className="ambient-orb absolute left-0 top-1/3 w-[24rem] h-[24rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(20, 89, 91, 0.65) 0%, transparent 55%)',
          filter: 'blur(65px)',
          animation: 'ambient-drift-7 13s ease-in-out infinite',
        }}
      />

      {/* Orb 8 — VEGAS HOT PINK, upper-right roamer */}
      <div
        className="ambient-orb absolute top-1/4 right-1/4 w-[26rem] h-[26rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.65) 0%, rgba(236, 72, 153, 0.18) 45%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'ambient-drift-pink 15s ease-in-out infinite, ambient-glow-pulse 4.5s ease-in-out infinite',
          mixBlendMode: 'screen',
        }}
      />

      {/* Orb 9 — VEGAS PURPLE, mid-bottom roamer */}
      <div
        className="ambient-orb absolute bottom-1/4 left-1/3 w-[28rem] h-[28rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, rgba(168, 85, 247, 0.18) 45%, transparent 70%)',
          filter: 'blur(75px)',
          animation: 'ambient-drift-purple 17s ease-in-out infinite, ambient-glow-pulse 6s ease-in-out infinite',
          mixBlendMode: 'screen',
        }}
      />

      {/* Orb 10 — VEGAS CYAN, upper-mid roamer */}
      <div
        className="ambient-orb absolute top-1/3 left-1/2 w-[22rem] h-[22rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.55) 0%, rgba(34, 211, 238, 0.16) 45%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'ambient-drift-cyan 11s ease-in-out infinite, ambient-glow-pulse 3.5s ease-in-out infinite',
          mixBlendMode: 'screen',
        }}
      />

      {/* Aurora — wide horizontal shimmer panning across */}
      <div
        className="ambient-aurora absolute left-0 right-0 top-1/3 h-[50vh] w-[200%]"
        style={{
          background:
            'linear-gradient(110deg, transparent 0%, rgba(232, 185, 91, 0.25) 25%, rgba(20, 89, 91, 0.4) 50%, rgba(236, 72, 153, 0.22) 75%, transparent 100%)',
          filter: 'blur(35px)',
          animation: 'ambient-aurora-pan 12s ease-in-out infinite alternate',
        }}
      />

      {/* Searchlight — vertical Vegas-style beam sweeping */}
      <div
        className="ambient-searchlight absolute top-0 bottom-0 w-[6vw] -ml-[3vw]"
        style={{
          background:
            'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.18) 20%, rgba(255, 255, 255, 0.45) 50%, rgba(255, 255, 255, 0.18) 80%, transparent 100%)',
          filter: 'blur(8px)',
          animation: 'ambient-searchlight 18s linear infinite',
        }}
      />

      {/* Comet — diagonal streak */}
      <div
        className="ambient-comet absolute top-0 left-0 w-[60vw] h-[3px]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(232, 185, 91, 0) 5%, rgba(232, 185, 91, 0.95) 80%, rgba(255, 255, 255, 1) 100%)',
          boxShadow: '0 0 30px rgba(232, 185, 91, 0.9), 0 0 60px rgba(232, 185, 91, 0.5)',
          transformOrigin: '100% 50%',
          animation: 'ambient-comet 11s linear infinite',
          animationDelay: '2s',
        }}
      />

      {/* Embers — twenty rising particles, mix of TAG + neon */}
      {EMBERS.map((e, i) => (
        <span
          key={`e${i}`}
          className="ambient-ember absolute block rounded-full"
          style={{
            left: 0,
            top: 0,
            width: e.size,
            height: e.size,
            background: e.color,
            boxShadow: `0 0 ${e.glow}px ${e.color}, 0 0 ${e.glow * 2}px ${e.color}, 0 0 ${e.glow * 3}px ${e.color}`,
            ['--ax' as string]: e.startX,
            ['--adx' as string]: e.driftX,
            animation: `ambient-ember-rise ${e.duration}s linear ${e.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}

      {/* Twinkle stars — small bright points popping in/out */}
      {TWINKLES.map((t, i) => (
        <span
          key={`t${i}`}
          className="ambient-twinkle absolute block rounded-full"
          style={{
            left: t.x,
            top: t.y,
            width: t.size,
            height: t.size,
            background: t.color,
            boxShadow: `0 0 ${t.glow}px ${t.color}, 0 0 ${t.glow * 2}px ${t.color}`,
            animation: `ambient-twinkle ${t.duration}s ease-in-out ${t.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

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
