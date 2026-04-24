/**
 * AmbientBackground — subtle, always-on glow layer for authed pages.
 *
 * Two large blurred orbs (teal + gold) drift slowly. Very low opacity so it
 * adds atmosphere without competing with content. Disabled when the user has
 * prefers-reduced-motion set.
 *
 * Stays behind content via `-z-10` on a position:fixed layer, so it covers
 * the full viewport and doesn't scroll with content.
 */
export function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      <style>{`
        @keyframes ambient-drift-1 { 0%,100% { transform: translate(-10%, -10%) scale(1); } 50% { transform: translate(20%, 15%) scale(1.15); } }
        @keyframes ambient-drift-2 { 0%,100% { transform: translate(15%, 25%) scale(1.1); } 50% { transform: translate(-20%, -5%) scale(1); } }
        @media (prefers-reduced-motion: reduce) {
          .ambient-orb { animation: none !important; }
        }
      `}</style>

      <div
        className="ambient-orb absolute top-0 left-0 w-[55rem] h-[55rem] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(20, 89, 91, 0.55) 0%, transparent 62%)',
          filter: 'blur(100px)',
          animation: 'ambient-drift-1 40s ease-in-out infinite',
        }}
      />
      <div
        className="ambient-orb absolute bottom-0 right-0 w-[46rem] h-[46rem] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(192, 138, 48, 0.32) 0%, transparent 62%)',
          filter: 'blur(110px)',
          animation: 'ambient-drift-2 48s ease-in-out infinite',
        }}
      />
    </div>
  );
}
