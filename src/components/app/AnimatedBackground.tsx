const STARS = [
  { top: 8, left: 12, size: 2, delay: 0 },
  { top: 14, left: 78, size: 1, delay: 1.3 },
  { top: 22, left: 34, size: 2, delay: 2.1 },
  { top: 29, left: 61, size: 1, delay: 0.7 },
  { top: 33, left: 8, size: 1, delay: 3.4 },
  { top: 40, left: 48, size: 2, delay: 1.9 },
  { top: 46, left: 89, size: 1, delay: 2.6 },
  { top: 51, left: 23, size: 1, delay: 0.4 },
  { top: 56, left: 70, size: 2, delay: 3.1 },
  { top: 62, left: 3, size: 1, delay: 1.1 },
  { top: 67, left: 54, size: 1, delay: 2.8 },
  { top: 73, left: 82, size: 2, delay: 0.9 },
  { top: 78, left: 17, size: 1, delay: 3.6 },
  { top: 84, left: 43, size: 1, delay: 1.5 },
  { top: 89, left: 67, size: 2, delay: 2.3 },
  { top: 94, left: 29, size: 1, delay: 0.2 },
  { top: 5, left: 45, size: 1, delay: 2.9 },
  { top: 11, left: 92, size: 1, delay: 0.6 },
  { top: 18, left: 55, size: 1, delay: 3.2 },
  { top: 25, left: 18, size: 2, delay: 1.7 },
  { top: 36, left: 73, size: 1, delay: 2.4 },
  { top: 42, left: 6, size: 1, delay: 0.3 },
  { top: 48, left: 36, size: 1, delay: 3.0 },
  { top: 55, left: 95, size: 2, delay: 1.2 },
  { top: 60, left: 40, size: 1, delay: 2.5 },
  { top: 69, left: 11, size: 1, delay: 0.8 },
  { top: 75, left: 58, size: 1, delay: 3.7 },
  { top: 81, left: 27, size: 2, delay: 1.6 },
  { top: 87, left: 76, size: 1, delay: 2.2 },
  { top: 92, left: 51, size: 1, delay: 0.5 },
  { top: 3, left: 30, size: 1, delay: 3.3 },
  { top: 16, left: 66, size: 2, delay: 1.4 },
  { top: 27, left: 84, size: 1, delay: 2.7 },
  { top: 38, left: 20, size: 1, delay: 0.1 },
  { top: 44, left: 62, size: 1, delay: 3.5 },
  { top: 52, left: 9, size: 2, delay: 1.8 },
  { top: 58, left: 77, size: 1, delay: 2.0 },
  { top: 64, left: 38, size: 1, delay: 0.0 },
  { top: 72, left: 90, size: 1, delay: 3.8 },
  { top: 80, left: 49, size: 2, delay: 1.0 },
];

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes drift1 { 0%,100% { transform: translate(-10%, -5%) scale(1); } 50% { transform: translate(15%, 10%) scale(1.15); } }
        @keyframes drift2 { 0%,100% { transform: translate(20%, 30%) scale(1.1); } 50% { transform: translate(-15%, 5%) scale(1); } }
        @keyframes drift3 { 0%,100% { transform: translate(-25%, 25%) scale(1); } 50% { transform: translate(30%, -10%) scale(1.2); } }
        @keyframes aurora { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes pulse-grid { 0%,100% { opacity: 0.04; } 50% { opacity: 0.08; } }
        @keyframes twinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 0.9; } }
        @media (prefers-reduced-motion: reduce) {
          .anim-bg * { animation: none !important; }
        }
      `}</style>

      <div className="anim-bg absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(20, 89, 91, 0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(20, 89, 91, 0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            animation: 'pulse-grid 8s ease-in-out infinite',
          }}
        />

        <div
          className="absolute inset-0 opacity-25"
          style={{
            background:
              'linear-gradient(120deg, transparent 0%, rgba(20, 89, 91, 0.6) 25%, rgba(192, 138, 48, 0.25) 50%, rgba(20, 89, 91, 0.6) 75%, transparent 100%)',
            backgroundSize: '300% 300%',
            animation: 'aurora 22s ease-in-out infinite',
          }}
        />

        <div
          className="absolute top-1/4 left-1/4 w-[45rem] h-[45rem] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(20, 89, 91, 0.8) 0%, transparent 65%)',
            filter: 'blur(80px)',
            animation: 'drift1 24s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-[35rem] h-[35rem] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(192, 138, 48, 0.7) 0%, transparent 65%)',
            filter: 'blur(90px)',
            animation: 'drift2 28s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-[40rem] h-[40rem] rounded-full opacity-25"
          style={{
            background: 'radial-gradient(circle, rgba(14, 59, 60, 0.9) 0%, transparent 65%)',
            filter: 'blur(85px)',
            animation: 'drift3 32s ease-in-out infinite',
          }}
        />

        {STARS.map((star, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animation: `twinkle ${4 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
