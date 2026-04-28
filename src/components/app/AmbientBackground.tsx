/**
 * AmbientBackground — multi-layer atmospheric backdrop for authed pages.
 *
 * Layers (back to front):
 *  1. Three large blurred color orbs that drift and breathe slowly.
 *  2. A wide aurora gradient that pans horizontally.
 *  3. A handful of tiny "ember" particles that float upward.
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
        @keyframes ambient-drift-1 { 0%,100% { transform: translate(-12%, -12%) scale(1); } 50% { transform: translate(22%, 18%) scale(1.18); } }
        @keyframes ambient-drift-2 { 0%,100% { transform: translate(15%, 30%) scale(1.1); } 50% { transform: translate(-22%, -8%) scale(0.95); } }
        @keyframes ambient-drift-3 { 0%,100% { transform: translate(40%, 70%) scale(0.9); } 33% { transform: translate(-30%, 30%) scale(1.05); } 66% { transform: translate(20%, -40%) scale(1.15); } }
        @keyframes ambient-aurora-pan { 0% { transform: translateX(-30%); opacity: 0.0; } 30% { opacity: 0.55; } 70% { opacity: 0.55; } 100% { transform: translateX(30%); opacity: 0.0; } }
        @keyframes ambient-ember-rise {
          0% { transform: translate3d(var(--ax), 110vh, 0) scale(0.6); opacity: 0; }
          12% { opacity: 0.7; }
          80% { opacity: 0.5; }
          100% { transform: translate3d(calc(var(--ax) + var(--adx)), -10vh, 0) scale(1); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ambient-orb,
          .ambient-aurora,
          .ambient-ember { animation: none !important; }
        }
      `}</style>

      {/* Orb 1 — teal, top-left */}
      <div
        className="ambient-orb absolute top-0 left-0 w-[60rem] h-[60rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(20, 89, 91, 0.6) 0%, transparent 62%)',
          filter: 'blur(110px)',
          animation: 'ambient-drift-1 42s ease-in-out infinite',
        }}
      />

      {/* Orb 2 — gold, bottom-right */}
      <div
        className="ambient-orb absolute bottom-0 right-0 w-[50rem] h-[50rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(192, 138, 48, 0.36) 0%, transparent 62%)',
          filter: 'blur(120px)',
          animation: 'ambient-drift-2 50s ease-in-out infinite',
        }}
      />

      {/* Orb 3 — soft cool accent, centred and roving */}
      <div
        className="ambient-orb absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(15, 123, 74, 0.28) 0%, transparent 65%)',
          filter: 'blur(110px)',
          animation: 'ambient-drift-3 64s ease-in-out infinite',
        }}
      />

      {/* Aurora — wide horizontal shimmer that pans left↔right */}
      <div
        className="ambient-aurora absolute left-0 right-0 top-1/3 h-[40vh] w-[160%]"
        style={{
          background:
            'linear-gradient(110deg, transparent 0%, rgba(232, 185, 91, 0.10) 35%, rgba(20, 89, 91, 0.18) 55%, transparent 100%)',
          filter: 'blur(60px)',
          animation: 'ambient-aurora-pan 28s ease-in-out infinite alternate',
        }}
      />

      {/* Embers — tiny rising particles */}
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
            boxShadow: `0 0 ${e.glow}px ${e.color}`,
            // CSS variables consumed by the keyframe
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
  { size: '4px', color: 'rgba(232, 185, 91, 0.9)', glow: 8, startX: '12vw', driftX: '6vw',  duration: 22, delay: 0 },
  { size: '3px', color: 'rgba(20, 89, 91, 0.9)',   glow: 6, startX: '32vw', driftX: '-4vw', duration: 28, delay: 5 },
  { size: '5px', color: 'rgba(232, 185, 91, 0.7)', glow: 10, startX: '58vw', driftX: '8vw',  duration: 26, delay: 11 },
  { size: '3px', color: 'rgba(15, 123, 74, 0.85)', glow: 7,  startX: '74vw', driftX: '-6vw', duration: 24, delay: 3 },
  { size: '4px', color: 'rgba(192, 138, 48, 0.85)', glow: 9, startX: '88vw', driftX: '4vw',  duration: 30, delay: 14 },
  { size: '2px', color: 'rgba(255, 255, 255, 0.6)', glow: 5, startX: '46vw', driftX: '-2vw', duration: 20, delay: 8 },
];
