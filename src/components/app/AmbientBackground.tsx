/**
 * AmbientBackground — multi-layer atmospheric backdrop for authed pages.
 *
 * Layers (back to front):
 *  1. Five blurred color orbs that drift, breathe, and pulse on shorter cycles.
 *  2. A wide aurora gradient that pans horizontally across the middle.
 *  3. A dozen "ember" particles that float upward at varying speeds.
 *
 * Everything is fixed to the viewport, behind content (z-0), and
 * pointer-events:none so it never blocks interaction. All animations
 * are disabled when the user has prefers-reduced-motion set.
 */
export function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      <style>{`
        @keyframes ambient-drift-1 { 0%,100% { transform: translate(-15%, -12%) scale(1); } 50% { transform: translate(28%, 22%) scale(1.25); } }
        @keyframes ambient-drift-2 { 0%,100% { transform: translate(18%, 32%) scale(1.15); } 50% { transform: translate(-26%, -10%) scale(0.92); } }
        @keyframes ambient-drift-3 {
          0%   { transform: translate(-50%, -50%) scale(0.85); }
          33%  { transform: translate(-70%, -25%) scale(1.1); }
          66%  { transform: translate(-25%, -70%) scale(1.2); }
          100% { transform: translate(-50%, -50%) scale(0.85); }
        }
        @keyframes ambient-drift-4 { 0%,100% { transform: translate(60%, -30%) scale(0.9); } 50% { transform: translate(-20%, 50%) scale(1.1); } }
        @keyframes ambient-drift-5 { 0%,100% { transform: translate(-40%, 60%) scale(1); } 50% { transform: translate(40%, -20%) scale(1.2); } }
        @keyframes ambient-aurora-pan {
          0%   { transform: translateX(-40%); opacity: 0.0; }
          25%  { opacity: 0.7; }
          50%  { transform: translateX(0%); opacity: 0.7; }
          75%  { opacity: 0.7; }
          100% { transform: translateX(40%); opacity: 0.0; }
        }
        @keyframes ambient-ember-rise {
          0%   { transform: translate3d(var(--ax), 105vh, 0) scale(0.6); opacity: 0; }
          10%  { opacity: 0.85; }
          85%  { opacity: 0.65; }
          100% { transform: translate3d(calc(var(--ax) + var(--adx)), -8vh, 0) scale(1.1); opacity: 0; }
        }
        @keyframes ambient-glow-pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.55; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ambient-orb,
          .ambient-aurora,
          .ambient-ember { animation: none !important; }
        }
      `}</style>

      {/* Orb 1 — teal, top-left, big and active */}
      <div
        className="ambient-orb absolute top-0 left-0 w-[55rem] h-[55rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(20, 89, 91, 0.85) 0%, rgba(20, 89, 91, 0.25) 40%, transparent 65%)',
          filter: 'blur(90px)',
          animation: 'ambient-drift-1 22s ease-in-out infinite, ambient-glow-pulse 8s ease-in-out infinite',
        }}
      />

      {/* Orb 2 — gold, bottom-right, warm */}
      <div
        className="ambient-orb absolute bottom-0 right-0 w-[48rem] h-[48rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(192, 138, 48, 0.65) 0%, rgba(192, 138, 48, 0.2) 40%, transparent 65%)',
          filter: 'blur(100px)',
          animation: 'ambient-drift-2 26s ease-in-out infinite, ambient-glow-pulse 10s ease-in-out infinite',
        }}
      />

      {/* Orb 3 — cool green, roving centre */}
      <div
        className="ambient-orb absolute left-1/2 top-1/2 w-[34rem] h-[34rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(15, 123, 74, 0.55) 0%, rgba(15, 123, 74, 0.18) 45%, transparent 70%)',
          filter: 'blur(95px)',
          animation: 'ambient-drift-3 30s ease-in-out infinite',
        }}
      />

      {/* Orb 4 — bright gold accent, top-right */}
      <div
        className="ambient-orb absolute top-0 right-0 w-[28rem] h-[28rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(232, 185, 91, 0.55) 0%, transparent 60%)',
          filter: 'blur(80px)',
          animation: 'ambient-drift-4 18s ease-in-out infinite, ambient-glow-pulse 6s ease-in-out infinite',
        }}
      />

      {/* Orb 5 — deep teal, bottom-left */}
      <div
        className="ambient-orb absolute bottom-0 left-0 w-[32rem] h-[32rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(11, 47, 49, 0.55) 0%, rgba(11, 47, 49, 0.15) 45%, transparent 70%)',
          filter: 'blur(85px)',
          animation: 'ambient-drift-5 24s ease-in-out infinite',
        }}
      />

      {/* Aurora — wide horizontal shimmer panning across */}
      <div
        className="ambient-aurora absolute left-0 right-0 top-1/3 h-[45vh] w-[180%]"
        style={{
          background:
            'linear-gradient(110deg, transparent 0%, rgba(232, 185, 91, 0.18) 30%, rgba(20, 89, 91, 0.30) 50%, rgba(232, 185, 91, 0.18) 70%, transparent 100%)',
          filter: 'blur(40px)',
          animation: 'ambient-aurora-pan 16s ease-in-out infinite alternate',
        }}
      />

      {/* Embers — tiny rising particles, brighter and more numerous */}
      {EMBERS.map((e, i) => (
        <span
          key={i}
          className="ambient-ember absolute block rounded-full"
          style={{
            left: 0,
            top: 0,
            width: e.size,
            height: e.size,
            background: e.color,
            boxShadow: `0 0 ${e.glow}px ${e.color}, 0 0 ${e.glow * 2}px ${e.color}`,
            ['--ax' as string]: e.startX,
            ['--adx' as string]: e.driftX,
            animation: `ambient-ember-rise ${e.duration}s linear ${e.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

const EMBERS: { size: string; color: string; glow: number; startX: string; driftX: string; duration: number; delay: number }[] = [
  { size: '5px', color: 'rgba(232, 185, 91, 0.95)', glow: 12, startX: '8vw',  driftX: '8vw',   duration: 14, delay: 0 },
  { size: '4px', color: 'rgba(20, 89, 91, 0.95)',   glow: 10, startX: '20vw', driftX: '-6vw',  duration: 18, delay: 2 },
  { size: '6px', color: 'rgba(232, 185, 91, 0.85)', glow: 14, startX: '34vw', driftX: '10vw',  duration: 16, delay: 5 },
  { size: '3px', color: 'rgba(15, 123, 74, 0.95)',  glow: 9,  startX: '48vw', driftX: '-8vw',  duration: 12, delay: 1 },
  { size: '5px', color: 'rgba(192, 138, 48, 0.95)', glow: 12, startX: '60vw', driftX: '6vw',   duration: 17, delay: 7 },
  { size: '4px', color: 'rgba(255, 255, 255, 0.75)', glow: 8, startX: '72vw', driftX: '-4vw',  duration: 15, delay: 3 },
  { size: '5px', color: 'rgba(232, 185, 91, 0.9)',  glow: 11, startX: '84vw', driftX: '5vw',   duration: 19, delay: 9 },
  { size: '3px', color: 'rgba(15, 123, 74, 0.9)',   glow: 8,  startX: '92vw', driftX: '-7vw',  duration: 13, delay: 4 },
  { size: '6px', color: 'rgba(192, 138, 48, 0.85)', glow: 13, startX: '15vw', driftX: '-3vw',  duration: 21, delay: 11 },
  { size: '4px', color: 'rgba(232, 185, 91, 0.95)', glow: 10, startX: '40vw', driftX: '4vw',   duration: 16, delay: 8 },
  { size: '3px', color: 'rgba(255, 255, 255, 0.6)', glow: 6,  startX: '66vw', driftX: '-9vw',  duration: 14, delay: 6 },
  { size: '5px', color: 'rgba(20, 89, 91, 0.85)',   glow: 12, startX: '78vw', driftX: '7vw',   duration: 20, delay: 13 },
];
