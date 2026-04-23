'use client';

import { useEffect, useRef, useState } from 'react';

export type Celebration = {
  title: string;      // e.g. "FIRST PILOT CLOSED"
  subtitle?: string;  // e.g. "Tier 1 target reached T3 · Proposal"
  key: string;        // unique id — used to re-trigger
};

/**
 * Full-screen celebration overlay with confetti.
 * Dismisses on tap or after ~2.8s. Confetti continues falling after text fades.
 */
export function CelebrationOverlay({ celebration, onDismiss }: {
  celebration: Celebration | null;
  onDismiss: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [textPhase, setTextPhase] = useState<'in' | 'hold' | 'out'>('in');

  // Fire confetti every time celebration.key changes
  useEffect(() => {
    if (!celebration) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const colors = ['#C08A30', '#E8B95B', '#14595B', '#0F7B4A', '#FFFFFF'];
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    type Piece = { x: number; y: number; vx: number; vy: number; color: string; size: number; rot: number; vr: number; life: number };
    const pieces: Piece[] = Array.from({ length: 140 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 60,
      y: h / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 14 - 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.4,
      life: 1,
    }));

    let frame = 0;
    let rafId = 0;
    const tick = () => {
      frame++;
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of pieces) {
        if (p.life <= 0) continue;
        alive++;
        p.vy += 0.35;
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 0.006;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.45);
        ctx.restore();
      }
      if (alive > 0 && frame < 500) rafId = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, w, h);
    };
    tick();
    return () => cancelAnimationFrame(rafId);
  }, [celebration?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Text phase machine
  useEffect(() => {
    if (!celebration) return;
    setTextPhase('in');
    const t1 = setTimeout(() => setTextPhase('hold'), 300);
    const t2 = setTimeout(() => setTextPhase('out'), 2200);
    const t3 = setTimeout(() => onDismiss(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [celebration?.key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!celebration) return null;

  const opacity = textPhase === 'out' ? 0 : 1;
  const transform =
    textPhase === 'in' ? 'translateY(20px) scale(0.92)' :
    textPhase === 'hold' ? 'translateY(0) scale(1)' :
    'translateY(-12px) scale(1.05)';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center cursor-pointer"
      onClick={onDismiss}
      role="dialog"
      aria-label={celebration.title}
    >
      {/* Dim backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      {/* Confetti layer */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0"
        style={{ width: '100%', height: '100%' }}
        aria-hidden="true"
      />
      {/* Text */}
      <div
        className="relative text-center px-8 max-w-xl transition-all duration-500 ease-out"
        style={{ opacity, transform }}
      >
        <div className="text-[11px] md:text-xs font-bold tracking-[0.3em] text-[#E8B95B] mb-3">
          GOAL REACHED
        </div>
        <div
          className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight"
          style={{ textShadow: '0 4px 20px rgba(192,138,48,0.4)' }}
        >
          {celebration.title}
        </div>
        {celebration.subtitle && (
          <div className="mt-3 text-sm md:text-base text-white/80 font-medium">
            {celebration.subtitle}
          </div>
        )}
        <div className="mt-6 text-[10px] text-white/50 tracking-wider uppercase">
          Tap anywhere to dismiss
        </div>
      </div>
    </div>
  );
}
