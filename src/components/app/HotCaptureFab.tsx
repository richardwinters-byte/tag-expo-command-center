'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, X, UserPlus, Zap, Calendar } from 'lucide-react';

/**
 * Bottom-right floating action button.
 * Tap → expands to 3 quick-capture actions.
 * Tap outside or Escape → closes.
 *
 * Hidden on /schedule/new, /leads/new, /intel/new to avoid nesting.
 */
export function HotCaptureFab({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const hideOn = ['/login', '/schedule/new', '/leads/new', '/intel/new'];
  const hidden = hideOn.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Close when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (hidden) return null;

  return (
    <>
      {/* Backdrop — dims + closes on tap */}
      {open && (
        <button
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/20 animate-in fade-in duration-150"
        />
      )}

      {/* Expand options — stack above FAB. Order top-to-bottom: Lead, Quick meeting, Intel. */}
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2 animate-in slide-in-from-bottom-2 duration-200">
          <FabOption
            href="/leads/new"
            icon={UserPlus}
            label="Add lead"
            sub="From booth conversation"
            tone="teal"
            onClick={() => setOpen(false)}
          />
          <FabOption
            href="/schedule/new"
            icon={Calendar}
            label="Quick meeting"
            sub="Walk-up or booked"
            tone="dark"
            onClick={() => setOpen(false)}
          />
          <FabOption
            href="/intel/new"
            icon={Zap}
            label="Capture intel"
            sub="PSA, CGC, booth sighting"
            tone="gold"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      {/* Main FAB — bottom-nav clearance = 16px + 56px (nav) + 16px = bottom-24 */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close capture menu' : 'Open capture menu'}
        aria-expanded={open}
        className="fixed right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          backgroundColor: open ? '#14595B' : '#C08A30',
          color: '#FFFFFF',
          transform: open ? 'rotate(45deg)' : 'rotate(0)',
        }}
      >
        {open ? <X size={24} /> : <Plus size={26} />}
      </button>
    </>
  );
}

function FabOption({
  href,
  icon: Icon,
  label,
  sub,
  tone,
  onClick,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  sub: string;
  tone: 'gold' | 'teal' | 'dark';
  onClick: () => void;
}) {
  const bg = tone === 'gold' ? '#C08A30' : tone === 'teal' ? '#14595B' : '#0B2F31';
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-full pl-3 pr-5 py-2.5 shadow-float bg-white dark:bg-[#14171A] border border-hairline hover:shadow-lg transition-shadow"
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: bg, color: '#FFFFFF' }}>
        <Icon size={16} />
      </div>
      <div className="text-left">
        <div className="text-sm font-semibold leading-none">{label}</div>
        <div className="text-[11px] text-tag-cold mt-1 leading-none">{sub}</div>
      </div>
    </Link>
  );
}
