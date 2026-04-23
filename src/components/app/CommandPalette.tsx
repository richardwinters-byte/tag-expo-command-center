'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Target as TargetIcon, UserPlus, Calendar, Zap, Sun, FileText, Settings as SettingsIcon, Home, Users as UsersIcon, MapPin, TrendingUp } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

type PaletteItem =
  | { kind: 'target'; id: string; title: string; sub: string; href: string; tier: string | null; search: string }
  | { kind: 'lead';   id: string; title: string; sub: string; href: string; temperature: string | null; search: string }
  | { kind: 'meeting'; id: string; title: string; sub: string; href: string; search: string }
  | { kind: 'intel';  id: string; title: string; sub: string; href: string; search: string }
  | { kind: 'nav';    id: string; title: string; sub: string; href: string; icon: React.ComponentType<{ size?: number; className?: string }>; search: string };

const NAV_ITEMS: PaletteItem[] = [
  { kind: 'nav', id: 'today',    title: 'Today',    sub: 'Home · briefing', href: '/today',    icon: Home,        search: 'today home brief' },
  { kind: 'nav', id: 'schedule', title: 'Schedule', sub: 'Meetings by day', href: '/schedule', icon: Calendar,    search: 'schedule meetings calendar' },
  { kind: 'nav', id: 'targets',  title: 'Targets',  sub: 'Tier 1–3 targets', href: '/targets', icon: TargetIcon,  search: 'targets tier' },
  { kind: 'nav', id: 'leads',    title: 'Leads',    sub: 'Captured contacts', href: '/leads', icon: UsersIcon,   search: 'leads contacts' },
  { kind: 'nav', id: 'intel',    title: 'Intel',    sub: 'Competitive log',  href: '/intel',   icon: Zap,         search: 'intel competitive' },
  { kind: 'nav', id: 'map',      title: 'Booth map', sub: 'Expo hall walking route', href: '/map', icon: MapPin,   search: 'map booth floor plan walking route' },
  { kind: 'nav', id: 'pipeline', title: 'Pipeline', sub: 'Post-show momentum',   href: '/pipeline', icon: TrendingUp, search: 'pipeline momentum conversion funnel followup' },
  { kind: 'nav', id: 'morning',  title: 'Morning brief', sub: 'Today\'s compiled brief', href: '/morning', icon: Sun, search: 'morning brief' },
  { kind: 'nav', id: 'report',   title: 'Trip report', sub: 'Executive PDF export', href: '/report', icon: FileText, search: 'trip report export pdf' },
  { kind: 'nav', id: 'settings', title: 'Settings', sub: 'Profile · team',    href: '/settings', icon: SettingsIcon, search: 'settings profile' },
];

/**
 * Global command palette.
 * Keyboard: Cmd/Ctrl+K to open, ↑/↓ to navigate, Enter to select, Esc to close.
 * Touch: bottom-nav search button also opens it.
 * Data: lazy-loaded once per session on first open.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [data, setData] = useState<{ targets: PaletteItem[]; leads: PaletteItem[]; meetings: PaletteItem[]; intel: PaletteItem[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K → toggle
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery('');
      setSelected(0);
    }
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Load data on first open
  useEffect(() => {
    if (!open || data || loading) return;
    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    (async () => {
      const [tRes, lRes, mRes, iRes] = await Promise.all([
        supabase.from('targets').select('id, company_name, tier, track, proof_point').order('company_name'),
        supabase.from('leads').select('id, full_name, company, title, temperature, email').order('updated_at', { ascending: false }),
        supabase.from('meetings').select('id, title, start_at, location').order('start_at'),
        supabase.from('intel').select('id, headline, details, subject, date_observed').order('date_observed', { ascending: false }).limit(50),
      ]);
      setData({
        targets: (tRes.data ?? []).map((t) => ({
          kind: 'target' as const,
          id: t.id,
          title: t.company_name as string,
          sub: `${(t.tier as string | null)?.replace(/_/g, ' ') ?? '—'} · ${(t.track as string | null)?.replace(/_/g, ' ') ?? '—'}`,
          href: `/targets/${t.id}`,
          tier: t.tier as string | null,
          search: `${t.company_name} ${t.tier ?? ''} ${t.track ?? ''} ${t.proof_point ?? ''}`.toLowerCase(),
        })),
        leads: (lRes.data ?? []).map((l) => ({
          kind: 'lead' as const,
          id: l.id,
          title: `${l.full_name} · ${l.company}`,
          sub: [l.title, l.email].filter(Boolean).join(' · ') || 'Lead',
          href: `/leads/${l.id}`,
          temperature: l.temperature as string | null,
          search: `${l.full_name} ${l.company} ${l.title ?? ''} ${l.email ?? ''}`.toLowerCase(),
        })),
        meetings: (mRes.data ?? []).map((m) => ({
          kind: 'meeting' as const,
          id: m.id,
          title: m.title as string,
          sub: `${new Date(m.start_at as string).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · ${new Date(m.start_at as string).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}${m.location ? ' · ' + m.location : ''}`,
          href: `/schedule/${m.id}`,
          search: `${m.title} ${m.location ?? ''}`.toLowerCase(),
        })),
        intel: (iRes.data ?? []).map((i) => ({
          kind: 'intel' as const,
          id: i.id,
          title: i.headline as string,
          sub: `Intel · ${i.subject ?? 'general'} · ${new Date(i.date_observed as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          href: `/intel?highlight=${i.id}`,
          search: `${i.headline} ${i.details ?? ''} ${i.subject ?? ''}`.toLowerCase(),
        })),
      });
      setLoading(false);
    })();
  }, [open, data, loading]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all: PaletteItem[] = data
      ? [...data.targets, ...data.leads, ...data.meetings, ...data.intel, ...NAV_ITEMS]
      : NAV_ITEMS;
    if (!q) {
      // Default: show nav + top 5 of each entity type
      if (!data) return NAV_ITEMS;
      return [
        ...NAV_ITEMS,
        ...data.targets.slice(0, 5),
        ...data.leads.slice(0, 5),
        ...data.meetings.slice(0, 5),
        ...data.intel.slice(0, 5),
      ];
    }
    // Score: exact word match > startsWith > includes
    const scored = all
      .map((item) => {
        const s = item.search;
        let score = 0;
        const tokens = q.split(/\s+/);
        for (const t of tokens) {
          if (!s.includes(t)) return { item, score: -1 };
          if (s.startsWith(t)) score += 10;
          if (new RegExp(`\\b${t}`).test(s)) score += 5;
          score += 1;
        }
        return { item, score };
      })
      .filter((x) => x.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map((x) => x.item);
    return scored;
  }, [query, data]);

  // Keep selected index in bounds as results change
  useEffect(() => {
    setSelected(0);
  }, [query]);

  function select(i: number) {
    const item = results[i];
    if (!item) return;
    setOpen(false);
    router.push(item.href);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-100">
      <button onClick={() => setOpen(false)} aria-label="Close" className="absolute inset-0" />
      <div className="relative w-full max-w-xl bg-white dark:bg-[#14171A] rounded-xl shadow-2xl border border-hairline overflow-hidden flex flex-col max-h-[70vh]">
        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-hairline">
          <Search size={16} className="text-tag-cold shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
              else if (e.key === 'Enter') { e.preventDefault(); select(selected); }
            }}
            placeholder="Search targets, leads, meetings, intel…"
            className="flex-1 bg-transparent text-sm outline-none border-none placeholder:text-tag-cold"
          />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-tag-50 dark:hover:bg-white/5"
          >
            <X size={16} className="text-tag-cold" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading && !data && (
            <div className="px-4 py-8 text-center text-sm text-tag-cold">Loading…</div>
          )}
          {results.length === 0 && !loading && (
            <div className="px-4 py-8 text-center text-sm text-tag-cold">No matches</div>
          )}
          {results.map((item, i) => (
            <button
              key={`${item.kind}-${item.id}`}
              onClick={() => select(i)}
              onMouseEnter={() => setSelected(i)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                selected === i ? 'bg-tag-50 dark:bg-white/5' : ''
              }`}
            >
              <PaletteIcon item={item} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{item.title}</div>
                <div className="text-[11px] text-tag-cold truncate">{item.sub}</div>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-tag-cold shrink-0">
                {item.kind}
              </span>
            </button>
          ))}
        </div>

        {/* Footer shortcuts */}
        <div className="border-t border-hairline px-3 py-2 flex items-center gap-3 text-[10px] text-tag-cold">
          <span><kbd className="font-mono bg-tag-50 dark:bg-white/5 px-1.5 py-0.5 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono bg-tag-50 dark:bg-white/5 px-1.5 py-0.5 rounded">↵</kbd> open</span>
          <span><kbd className="font-mono bg-tag-50 dark:bg-white/5 px-1.5 py-0.5 rounded">esc</kbd> close</span>
          <span className="ml-auto">{results.length} result{results.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}

function PaletteIcon({ item }: { item: PaletteItem }) {
  if (item.kind === 'nav') {
    const Icon = item.icon;
    return (
      <div className="w-8 h-8 rounded-md bg-tag-50 dark:bg-white/5 flex items-center justify-center shrink-0">
        <Icon size={15} className="text-tag-700" />
      </div>
    );
  }
  const bg = item.kind === 'target' ? '#14595B' : item.kind === 'lead' ? '#C08A30' : item.kind === 'meeting' ? '#0B2F31' : '#8B4A00';
  const Icon = item.kind === 'target' ? TargetIcon : item.kind === 'lead' ? UserPlus : item.kind === 'meeting' ? Calendar : Zap;
  return (
    <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: bg }}>
      <Icon size={15} />
    </div>
  );
}
