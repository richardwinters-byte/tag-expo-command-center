'use client';

import { useEffect, useState, useRef } from 'react';

/**
 * Tweens a number toward `target` over `duration` ms with ease-out.
 * Used for live counters on Pipeline stat tiles.
 */
export function useAnimatedNumber(target: number, duration = 600): number {
  const [value, setValue] = useState(target);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(target);

  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    if (fromRef.current === target) return;

    let rafId = 0;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const current = fromRef.current + (target - fromRef.current) * eased;
      setValue(current);
      if (t < 1) rafId = requestAnimationFrame(step);
      else setValue(target);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  return Math.round(value);
}

/**
 * Render helper — just renders the animated value.
 */
export function AnimatedNumber({ value, duration = 600 }: { value: number; duration?: number }) {
  const animated = useAnimatedNumber(value, duration);
  return <>{animated}</>;
}

/**
 * FlashingNumber — animates + flashes a directional arrow when the value changes.
 * Green ▲ for increases, red ▼ for decreases. Fades out after ~900ms.
 */
export function FlashingNumber({ value, duration = 600 }: { value: number; duration?: number }) {
  const animated = useAnimatedNumber(value, duration);
  const prevRef = useRef(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (value === prevRef.current) return;
    setFlash(value > prevRef.current ? 'up' : 'down');
    prevRef.current = value;
    const t = setTimeout(() => setFlash(null), 900);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <span className="relative inline-flex items-baseline">
      <span>{animated}</span>
      {flash && (
        <span
          aria-hidden
          className="absolute -right-3 -top-1 text-[10px] font-bold leading-none pointer-events-none"
          style={{
            color: flash === 'up' ? '#0F7B4A' : '#8B2A1F',
            animation: 'tag-flash 900ms ease-out forwards',
          }}
        >
          {flash === 'up' ? '▲' : '▼'}
        </span>
      )}
      <style jsx>{`
        @keyframes tag-flash {
          0% { opacity: 0; transform: translateY(4px) scale(0.8); }
          20% { opacity: 1; transform: translateY(-6px) scale(1.1); }
          80% { opacity: 1; transform: translateY(-10px) scale(1); }
          100% { opacity: 0; transform: translateY(-14px) scale(0.9); }
        }
      `}</style>
    </span>
  );
}
