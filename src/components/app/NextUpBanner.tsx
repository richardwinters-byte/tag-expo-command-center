'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, Circle, Check, X, Minimize2, Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { getErrorMessage } from '@/lib/utils';

type NextMeeting = {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  location: string | null;
  live_status: 'on_time' | 'running_late' | 'wrapping_early' | null;
  live_status_at: string | null;
  outcome: string | null;
  next_action: string | null;
};

/**
 * NextUpBanner — shows the anchor pair's next/in-progress meeting in a sticky strip.
 *
 * UX:
 *   - Collapsed pill in bottom-right if user minimized it AND meeting is >15 min out
 *   - Full banner otherwise (including in-progress, imminent, or when a new meeting takes over)
 *   - "Complete" button opens an inline outcome + next-action capture, then writes to the meeting
 *   - "Minimize" button collapses the banner (per-meeting — new meeting = full banner returns)
 *
 * Data:
 *   - Fetches its own user id via supabase auth (avoids prop-threading through layout)
 *   - Polls meetings every 90s so team updates propagate without websockets
 */
export function NextUpBanner() {
  const pathname = usePathname();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<NextMeeting[] | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // Per-meeting minimize state — stores the meeting id the user chose to hide
  const [minimizedId, setMinimizedId] = useState<string | null>(null);

  // Complete-meeting inline capture state
  const [completing, setCompleting] = useState(false);
  const [outcome, setOutcome] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [saving, setSaving] = useState(false);

  // Hide entirely on login + meeting detail pages (where dedicated UI takes over)
  const isMeetingDetail = pathname.startsWith('/schedule/') && !pathname.endsWith('/new') && pathname !== '/schedule';
  const shouldHide = pathname.startsWith('/login') || isMeetingDetail;

  // Bootstrap: get current user id
  useEffect(() => {
    if (shouldHide) return;
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setUserId(data.user?.id ?? null);
    });
    return () => { cancelled = true; };
  }, [shouldHide]);

  // Fetch meetings
  const fetchMeetings = useRef<(() => Promise<void>) | null>(null);
  useEffect(() => {
    if (shouldHide || !userId) return;
    let cancelled = false;
    const supabase = createSupabaseBrowserClient();

    const run = async () => {
      const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from('meetings')
        .select('id, title, start_at, end_at, location, live_status, live_status_at, outcome, next_action, owner_id, attendee_ids, status')
        .or(`owner_id.eq.${userId},attendee_ids.cs.{${userId}}`)
        .neq('status', 'completed')
        .neq('status', 'cancelled')
        .gte('end_at', since)
        .order('start_at')
        .limit(8);
      if (!cancelled && data) setMeetings(data as NextMeeting[]);
    };
    fetchMeetings.current = run;
    run();
    const poll = setInterval(run, 90_000);
    return () => { cancelled = true; clearInterval(poll); };
  }, [userId, shouldHide]);

  // Tick for accurate countdowns
  useEffect(() => {
    if (shouldHide) return;
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, [shouldHide]);

  const relevant = useMemo(() => {
    if (!meetings || meetings.length === 0) return null;
    const inProgress = meetings.find((m) => {
      const s = new Date(m.start_at).getTime();
      const e = new Date(m.end_at).getTime();
      return now >= s && now < e;
    });
    if (inProgress) return { meeting: inProgress, state: 'in_progress' as const };
    const next = meetings.find((m) => new Date(m.start_at).getTime() > now);
    if (next) return { meeting: next, state: 'upcoming' as const };
    return null;
  }, [meetings, now]);

  // Reset minimize + complete form when the active meeting changes
  useEffect(() => {
    if (relevant?.meeting.id !== minimizedId && minimizedId) {
      // Meeting rotated; drop the stale minimize
      setMinimizedId(null);
    }
    setCompleting(false);
    setOutcome('');
    setNextAction('');
  }, [relevant?.meeting.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (shouldHide || !relevant) return null;

  const { meeting, state } = relevant;
  const start = new Date(meeting.start_at).getTime();
  const end = new Date(meeting.end_at).getTime();
  const minsToStart = Math.round((start - now) / 60_000);
  const minsToEnd = Math.round((end - now) / 60_000);

  const statusFresh = meeting.live_status_at && new Date(meeting.end_at).getTime() + 15 * 60 * 1000 > now;
  const liveStatus = statusFresh ? meeting.live_status : null;

  const imminent = state === 'upcoming' && minsToStart <= 15;
  const leaveNow = state === 'upcoming' && minsToStart <= 5;
  const forceExpand = state === 'in_progress' || imminent; // auto-re-expand rule

  // Hide fully as floating pill if user minimized AND meeting is far enough away
  const isMinimized = minimizedId === meeting.id && !forceExpand;

  let tone: 'calm' | 'soon' | 'now' | 'live' = 'calm';
  if (state === 'in_progress') tone = 'live';
  else if (leaveNow) tone = 'now';
  else if (imminent) tone = 'soon';

  const bg =
    tone === 'live' ? '#0B2F31' :
    tone === 'now' ? '#D97706' :
    tone === 'soon' ? '#C08A30' :
    '#14595B';

  const kicker =
    state === 'in_progress' ? 'IN PROGRESS' :
    liveStatus === 'running_late' ? 'RUNNING LATE' :
    leaveNow ? 'LEAVE NOW' :
    imminent ? 'UP NEXT' :
    'NEXT UP';

  const timing =
    state === 'in_progress'
      ? (minsToEnd > 0 ? `ends in ${minsToEnd} min` : 'ending now')
      : (minsToStart < 1 ? 'starting now'
        : minsToStart === 1 ? 'in 1 min'
        : minsToStart < 60 ? `in ${minsToStart} min`
        : `in ${Math.floor(minsToStart / 60)}h ${minsToStart % 60}m`);

  // ---- MINIMIZED PILL ----
  if (isMinimized) {
    return (
      <button
        onClick={() => setMinimizedId(null)}
        aria-label="Show next up"
        className="fixed right-4 z-30 rounded-full text-white shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 px-3 py-1.5 text-[11px]"
        style={{ backgroundColor: bg, top: 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <Circle size={8} className="fill-white" />
        <span className="font-bold tracking-wider opacity-90">NEXT</span>
        <span className="opacity-80 font-mono">{timing}</span>
      </button>
    );
  }

  // ---- COMPLETE OUTCOME CAPTURE (replaces banner content) ----
  if (completing) {
    async function submitComplete() {
      setSaving(true);
      try {
        const supabase = createSupabaseBrowserClient();
        const { error } = await supabase
          .from('meetings')
          .update({
            status: 'completed',
            outcome: outcome.trim() || meeting.outcome || null,
            next_action: nextAction.trim() || meeting.next_action || null,
          })
          .eq('id', meeting.id);
        if (error) {
          alert(getErrorMessage(error, 'Failed to complete meeting.'));
          return;
        }
        setCompleting(false);
        setOutcome('');
        setNextAction('');
        if (fetchMeetings.current) await fetchMeetings.current();
        router.refresh();
      } finally {
        setSaving(false);
      }
    }
    return (
      <div className="text-white" style={{ backgroundColor: bg }}>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-2.5">
          <div className="flex items-center gap-2 mb-2">
            <Check size={14} className="shrink-0" />
            <span className="text-[11px] font-bold tracking-widest shrink-0 opacity-90">COMPLETE</span>
            <span className="text-[12px] font-semibold truncate">{meeting.title}</span>
            <button
              onClick={() => { setCompleting(false); setOutcome(''); setNextAction(''); }}
              aria-label="Cancel"
              className="ml-auto p-1 -mr-1 rounded-btn hover:bg-white/10 active:bg-white/20 shrink-0"
            >
              <X size={15} />
            </button>
          </div>
          <input
            type="text"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Outcome — one line"
            autoFocus
            className="w-full bg-white/15 placeholder:text-white/60 text-white text-[13px] rounded-btn px-2.5 py-1.5 mb-2 border border-white/20 focus:outline-none focus:border-white/50"
          />
          <input
            type="text"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="Next action (optional)"
            className="w-full bg-white/15 placeholder:text-white/60 text-white text-[13px] rounded-btn px-2.5 py-1.5 border border-white/20 focus:outline-none focus:border-white/50"
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={submitComplete}
              disabled={saving}
              className="flex-1 bg-white text-[#0B2F31] text-[12px] font-semibold rounded-btn py-1.5 inline-flex items-center justify-center gap-1.5 hover:bg-white/90 disabled:opacity-60"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {saving ? 'Saving…' : 'Mark complete'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- FULL BANNER ----
  return (
    <div
      className={`text-white transition-colors ${state === 'in_progress' ? 'pulse-live' : ''}`}
      style={{ backgroundColor: bg }}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-2 flex items-center gap-2">
        {state === 'in_progress' && (
          <span className="relative flex items-center justify-center w-2.5 h-2.5 shrink-0">
            <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-70" />
            <span className="relative rounded-full bg-white w-2.5 h-2.5" />
          </span>
        )}
        {state !== 'in_progress' && tone === 'now' && <Circle size={10} className="fill-white shrink-0" />}

        <Link href={`/schedule/${meeting.id}`} className="flex-1 min-w-0 flex items-baseline gap-2 hover:opacity-90">
          <span className="text-[10px] font-bold tracking-widest shrink-0 opacity-90">{kicker}</span>
          <span className="text-[13px] font-semibold truncate">{meeting.title}</span>
        </Link>

        <div className="text-[11px] font-mono opacity-90 shrink-0">{timing}</div>

        {meeting.location && (
          <div className="text-[11px] opacity-75 hidden md:block truncate max-w-[160px]">· {meeting.location}</div>
        )}

        {/* Action buttons */}
        <button
          onClick={() => setCompleting(true)}
          aria-label="Complete meeting"
          title="Complete meeting"
          className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-btn bg-white/15 hover:bg-white/25 active:bg-white/35 text-[11px] font-semibold"
        >
          <Check size={13} />
          <span className="hidden sm:inline">Done</span>
        </button>
        <button
          onClick={() => setMinimizedId(meeting.id)}
          aria-label="Minimize"
          title="Minimize"
          className="shrink-0 p-1 rounded-btn hover:bg-white/15 active:bg-white/25"
        >
          <Minimize2 size={14} />
        </button>
        <Link
          href={`/schedule/${meeting.id}`}
          aria-label="Open meeting"
          className="shrink-0 p-1 rounded-btn hover:bg-white/15 active:bg-white/25"
        >
          <ChevronRight size={16} className="opacity-80" />
        </Link>
      </div>
    </div>
  );
}
