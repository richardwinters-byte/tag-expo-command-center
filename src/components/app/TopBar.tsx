'use client';

import { ArrowLeft, MessageCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { NextUpBanner } from './NextUpBanner';
import type { User } from '@/lib/types';

// ============================================================
// PHONE NUMBER FOR SMS CHAT
// ============================================================
// Sourced from NEXT_PUBLIC_MICHAEL_PHONE at build time so Richard can set it
// without a code change (Vercel env vars → redeploy).
// Format: E.164 preferred (e.g. '+14155551234'). Bare 10-digit also works on iOS.
// When empty/unset, the chat icon is hidden automatically.
const MICHAEL_PHONE = (process.env.NEXT_PUBLIC_MICHAEL_PHONE ?? '').trim();

export function TopBar({
  title,
  subtitle,
  showBack,
  rightAction,
  currentUser,
}: {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  currentUser?: User;
}) {
  const router = useRouter();
  return (
    <header
      className="md:hidden sticky top-0 z-20 bg-tag-50/90 dark:bg-[#0A1415]/90 backdrop-blur-md border-b border-hairline"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* Row 1 — always: TAG logo, title, chat, theme toggle */}
      <div className="flex items-center gap-3 px-4 py-3 min-h-[56px]">
        <Link
          href="/today"
          aria-label="Home"
          className="w-9 h-9 rounded-lg bg-black flex items-center justify-center -ml-1 shadow-sm hover:shadow-md transition-shadow dark:bg-white shrink-0"
        >
          <span className="font-bold text-white dark:text-black text-[10px] tracking-wider">TAG</span>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs text-tag-cold truncate">{subtitle}</p>}
        </div>
        {rightAction}
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
          aria-label="Search"
          className="w-8 h-8 flex items-center justify-center rounded-btn hover:bg-tag-100 dark:hover:bg-white/5 text-tag-ink dark:text-tag-50"
        >
          <Search size={18} />
        </button>
        {MICHAEL_PHONE && currentUser && (
          <a
            href={`sms:${MICHAEL_PHONE}`}
            aria-label="Text Michael"
            className="w-8 h-8 flex items-center justify-center rounded-btn hover:bg-tag-100 dark:hover:bg-white/5 text-tag-ink dark:text-tag-50"
          >
            <MessageCircle size={18} />
          </a>
        )}
        <ThemeToggle compact />
      </div>

      {/* Row 2 — only when back is present */}
      {showBack && (
        <div className="flex items-center px-4 pb-2 -mt-1">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-tag-700 dark:text-tag-50 hover:text-tag-900 dark:hover:text-white px-2 py-1 -ml-2 rounded-btn hover:bg-tag-100 dark:hover:bg-white/5"
            aria-label="Back"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      )}

      {/* Row 3 — next-up banner (if relevant), rendered below the logo on mobile */}
      <NextUpBanner />
    </header>
  );
}
