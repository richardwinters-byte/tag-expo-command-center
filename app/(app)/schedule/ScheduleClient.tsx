'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, AlertTriangle, Sparkles } from 'lucide-react';
import { fmt } from '@/lib/utils';
import { UserAvatar } from '@/components/app/Pills';
import { CheatSheetOverlay } from '@/components/app/CheatSheetOverlay';
import type { Meeting, User, Target } from '@/lib/types';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

const DAYS = [
  { iso: '2026-05-18', short: 'Mon', label: 'May 18', title: 'Travel Day' },
  { iso: '2026-05-19', short: 'Tue', label: 'May 19', title: 'Day 1' },
  { iso: '2026-05-20', short: 'Wed', label: 'May 20', title: 'Day 2' },
  { iso: '2026-05-21', short: 'Thu', label: 'May 21', title: 'Day 3' },
];

// Timeline layout constants
const START_HOUR = 7;
const END_HOUR = 23;
const HOUR_HEIGHT = 64;
const GUTTER_WIDTH = 52;
// 22px minimum keeps a 20-min meeting's time label readable without the block
// inflating visually into the next meeting's slot.
const MIN_BLOCK_HEIGHT = 22;
const MIN_BLOCK_HOURS = MIN_BLOCK_HEIGHT / HOUR_HEIGHT;

// Parse ISO time string to hours as float (10:30 -> 10.5)
function timeToHours(iso: string): number {
  const hhmm = iso.slice(11, 16);
  const [h, m] = hhmm.split(':').map(Number);
  return h + m / 60;
}

// End time *as rendered* — short meetings get floored to MIN_BLOCK_HEIGHT so the
// lane assigner treats them as occupying their visible footprint. Without this,
// a 20-min meeting rendered at 22px height could collide with a meeting that
// starts 30 min later.
function visualEndHours(m: Meeting): number {
  const s = timeToHours(m.start_at);
  const e = timeToHours(m.end_at);
  return Math.max(e, s + MIN_BLOCK_HOURS);
}

// Compact label for timeline blocks (8:30 AM -> 8:30)
function hm(iso: string): string {
  const [h, m] = iso.slice(11, 16).split(':').map(Number);
  return `${h}:${String(m).padStart(2, '0')}`;
}

function hourLabel(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

type LaneInfo = { lane: number; totalLanes: number };

function assignLanes(meetings: Meeting[]): Map<string, LaneInfo> {
  const result = new Map<string, LaneInfo>();
  if (!meetings.length) return result;
  const sorted = [...meetings].sort((a, b) => a.start_at.localeCompare(b.start_at));
  const laneEndTimes: number[] = [];

  for (const m of sorted) {
    const s = timeToHours(m.start_at);
    const ve = visualEndHours(m);
    let lane = laneEndTimes.findIndex((endHr) => endHr <= s);
    if (lane === -1) {
      laneEndTimes.push(ve);
      lane = laneEndTimes.length - 1;
    } else {
      laneEndTimes[lane] = ve;
    }
    result.set(m.id, { lane, totalLanes: 1 });
  }

  for (const m of sorted) {
    const s = timeToHours(m.start_at);
    const ve = visualEndHours(m);
    const overlapping = sorted.filter((o) => {
      const os = timeToHours(o.start_at);
      const ove = visualEndHours(o);
      return os < ve && ove > s;
    });
    const maxLane = Math.max(...overlapping.map((o) => result.get(o.id)!.lane));
    const info = result.get(m.id)!;
    info.totalLanes = maxLane + 1;
  }
  return result;
}

export function ScheduleClient({
  currentUserId,
  initialDate,
  meetings: initialMeetings,
  users,
  targets,
}: {
  currentUserId: string;
  initialDate: string;
  meetings: Meeting[];
  users: User[];
  targets: Pick<Target, 'id' | 'company_name' | 'tier'>[];
}) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [meetings, setMeetings] = useState(initialMeetings);

  // Cheat sheet overlay state
  const [cheatSheet, setCheatSheet] = useState<{ target: Target; meeting: Meeting } | null>(null);
  const [loadingCheatSheet, setLoadingCheatSheet] = useState(false);

  async function openCheatSheet(meeting: Meeting) {
    if (!meeting.target_id) return;
    setLoadingCheatSheet(true);
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.from('targets').select('*').eq('id', meeting.target_id).single();
    setLoadingCheatSheet(false);
    if (data) setCheatSheet({ target: data as Target, meeting });
  }

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel('schedule-meetings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meetings' },
        async () => {
          const { data } = await supabase
            .from('meetings')
            .select('*')
            .gte('start_at', '2026-05-18T00:00:00-07:00')
            .lte('start_at', '2026-05-21T23:59:59-07:00')
            .order('start_at');
          if (data) setMeetings(data as Meeting[]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const usersById = useMemo(() => {
    const m = new Map<string, User>();
    users.forEach((u) => m.set(u.id, u));
    return m;
  }, [users]);

  const targetsById = useMemo(() => {
    const m = new Map<string, typeof targets[number]>();
    targets.forEach((t) => m.set(t.id, t));
    return m;
  }, [targets]);

  const dayMeetings = useMemo(() => {
    return meetings
      .filter((m) => m.start_at.slice(0, 10) === date)
      .filter((m) => {
        if (filter === 'mine') {
          return m.owner_id === currentUserId || (m.attendee_ids ?? []).includes(currentUserId);
        }
        return true;
      })
      .sort((a, b) => a.start_at.localeCompare(b.start_at));
  }, [meetings, date, filter, currentUserId]);

  const conflicts = useMemo(() => {
    const byUser = new Map<string, Meeting[]>();
    for (const m of dayMeetings) {
      const ids = new Set<string>();
      if (m.owner_id) ids.add(m.owner_id);
      (m.attendee_ids ?? []).forEach((id) => ids.add(id));
      for (const id of ids) {
        if (!byUser.has(id)) byUser.set(id, []);
        byUser.get(id)!.push(m);
      }
    }
    const flags = new Set<string>();
    for (const [, list] of byUser) {
      list.sort((a, b) => a.start_at.localeCompare(b.start_at));
      // Check every pair — handles N-way overlaps (e.g. A 9-10, B 9:30-10:15, C 9:45-10:30).
      for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < i; j++) {
          if (list[j].end_at > list[i].start_at) {
            flags.add(list[i].id);
            flags.add(list[j].id);
          }
        }
      }
    }
    return flags;
  }, [dayMeetings]);

  // Conflict pairs for the top-of-day banner — shows which two meetings collide
  // and for which attendee. Empty if no conflicts today.
  const conflictPairs = useMemo(() => {
    const pairs: Array<{ a: Meeting; b: Meeting; userIds: string[] }> = [];
    const seen = new Set<string>(); // dedupe by (a.id, b.id)
    const byUser = new Map<string, Meeting[]>();
    for (const m of dayMeetings) {
      const ids = new Set<string>();
      if (m.owner_id) ids.add(m.owner_id);
      (m.attendee_ids ?? []).forEach((id) => ids.add(id));
      for (const id of ids) {
        if (!byUser.has(id)) byUser.set(id, []);
        byUser.get(id)!.push(m);
      }
    }
    const pairUserMap = new Map<string, Set<string>>();
    for (const [userId, list] of byUser) {
      list.sort((a, b) => a.start_at.localeCompare(b.start_at));
      // N-way overlap detection: for each meeting, flag every earlier meeting it overlaps.
      for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < i; j++) {
          if (list[j].end_at > list[i].start_at) {
            const a = list[j];
            const b = list[i];
            const key = [a.id, b.id].sort().join('|');
            if (!pairUserMap.has(key)) pairUserMap.set(key, new Set());
            pairUserMap.get(key)!.add(userId);
            if (!seen.has(key)) {
              seen.add(key);
              pairs.push({ a, b, userIds: [] });
            }
          }
        }
      }
    }
    // attach userIds
    for (const pair of pairs) {
      const key = [pair.a.id, pair.b.id].sort().join('|');
      pair.userIds = Array.from(pairUserMap.get(key) ?? []);
    }
    return pairs;
  }, [dayMeetings]);

  const lanes = useMemo(() => assignLanes(dayMeetings), [dayMeetings]);
  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  function createAtHour(hour: number) {
    const h = String(hour).padStart(2, '0');
    router.push(`/schedule/new?date=${date}&start=${h}:00&end=${h}:30`);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-5 md:py-8">
      {/* Day picker */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {DAYS.map((d) => (
          <button
            key={d.iso}
            onClick={() => setDate(d.iso)}
            className={`shrink-0 px-4 py-2.5 rounded-btn text-sm font-medium min-w-[110px] text-left transition-colors ${
              date === d.iso
                ? 'bg-tag-900 text-white'
                : 'bg-white border border-hairline text-tag-ink hover:bg-tag-100'
            }`}
          >
            <div className="text-[10px] uppercase tracking-wider opacity-70">{d.short} · {d.title}</div>
            <div className="text-sm font-semibold">{d.label}</div>
          </button>
        ))}
      </div>

      {/* Filter + Add */}
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex bg-white rounded-btn border border-hairline p-0.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${filter === 'all' ? 'bg-tag-900 text-white' : 'text-tag-ink'}`}
          >
            All team
          </button>
          <button
            onClick={() => setFilter('mine')}
            className={`px-3 py-1.5 text-xs font-medium rounded ${filter === 'mine' ? 'bg-tag-900 text-white' : 'text-tag-ink'}`}
          >
            Just me
          </button>
        </div>
        <Link href={`/schedule/new?date=${date}`} className="btn-primary btn-sm">
          <Plus size={14} /> Meeting
        </Link>
      </div>

      {/* Conflict banner — real-time overlap detection */}
      {conflictPairs.length > 0 && (
        <div className="mb-3 rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(139, 42, 31, 0.25)', backgroundColor: '#FEF2F0' }}>
          <div className="px-4 py-2.5 flex items-center gap-2 border-b" style={{ borderColor: 'rgba(139, 42, 31, 0.15)', backgroundColor: 'rgba(139, 42, 31, 0.08)' }}>
            <AlertTriangle size={14} className="text-tag-error shrink-0" />
            <div className="text-[11px] font-bold uppercase tracking-wider text-tag-error">
              {conflictPairs.length} conflict{conflictPairs.length !== 1 ? 's' : ''} · {fmt(date, 'EEEE')}
            </div>
          </div>
          <ul className="divide-y" style={{ borderColor: 'rgba(139, 42, 31, 0.15)' }}>
            {conflictPairs.map((pair) => {
              const affected = pair.userIds
                .map((id) => usersById.get(id)?.name.split(' ')[0])
                .filter(Boolean)
                .join(' & ');
              return (
                <li key={`${pair.a.id}-${pair.b.id}`} className="px-4 py-2.5">
                  <div className="text-[11px] font-semibold text-tag-ink mb-1">
                    {affected ? `${affected} · ` : ''}overlap of {Math.round((new Date(pair.a.end_at).getTime() - new Date(pair.b.start_at).getTime()) / 60000)} min
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Link href={`/schedule/${pair.a.id}`} className="flex-1 text-tag-ink hover:underline truncate">
                      <span className="font-mono text-[10px] text-tag-cold mr-1.5">{hm(pair.a.start_at)}–{hm(pair.a.end_at)}</span>
                      {pair.a.title}
                    </Link>
                    <span className="text-tag-cold shrink-0">×</span>
                    <Link href={`/schedule/${pair.b.id}`} className="flex-1 text-tag-ink hover:underline truncate">
                      <span className="font-mono text-[10px] text-tag-cold mr-1.5">{hm(pair.b.start_at)}–{hm(pair.b.end_at)}</span>
                      {pair.b.title}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Timeline */}
      <div className="card overflow-hidden">
        <div style={{ padding: '8px 0 12px' }}>
          <div className="relative" style={{ height: `${totalHeight}px` }}>
          {/* Hour labels */}
          {hours.map((hour, i) => (
            <div
              key={`label-${hour}`}
              className="absolute text-[10px] font-mono text-tag-cold leading-none select-none"
              style={{ top: `${i * HOUR_HEIGHT - 4}px`, left: 8, width: GUTTER_WIDTH - 12 }}
            >
              {hourLabel(hour)}
            </div>
          ))}
          {/* Horizontal hour lines */}
          {hours.slice(1).map((hour, i) => (
            <div
              key={`line-${hour}`}
              className="absolute tl-line"
              style={{ top: `${(i + 1) * HOUR_HEIGHT}px`, left: GUTTER_WIDTH, right: 0, height: 1 }}
            />
          ))}

          {/* Vertical gutter divider */}
          <div className="absolute tl-divider" style={{ top: 0, bottom: 0, left: GUTTER_WIDTH, width: 1 }} />

          {/* Tap-to-create slot overlay */}
          <div className="absolute" style={{ top: 0, bottom: 0, left: GUTTER_WIDTH, right: 0, zIndex: 1 }}>
            {hours.slice(0, -1).map((hour, i) => (
              <button
                key={`slot-${hour}`}
                onClick={() => createAtHour(hour)}
                className="absolute tl-slot w-full"
                style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px`, left: 0 }}
                aria-label={`Create meeting at ${hourLabel(hour)}`}
              />
            ))}
          </div>

          {/* Meeting blocks */}
          <div className="absolute pointer-events-none" style={{ top: 0, bottom: 0, left: GUTTER_WIDTH, right: 0, zIndex: 2 }}>
            {dayMeetings.map((m) => {
              const s = timeToHours(m.start_at);
              const e = timeToHours(m.end_at);
              if (e <= START_HOUR || s >= END_HOUR) return null;
              const clippedS = Math.max(s, START_HOUR);
              const clippedE = Math.min(e, END_HOUR);
              const top = (clippedS - START_HOUR) * HOUR_HEIGHT;
              // Min 22px keeps time label readable; small meetings don't inflate into next slot
              const height = Math.max((clippedE - clippedS) * HOUR_HEIGHT, 22);
              const li = lanes.get(m.id) ?? { lane: 0, totalLanes: 1 };
              const widthPct = 100 / li.totalLanes;
              const leftPct = li.lane * widthPct;
              // Content tier by height — what fits
              //   micro  (<38px):  time only
              //   small  (38-62):  time + 1-line title
              //   medium (62-92):  time + 2-line title + 1 context line
              //   large  (>=92):   time + 2-line title + target + location + attendees
              const tier = height < 38 ? 'micro' : height < 62 ? 'small' : height < 92 ? 'medium' : 'large';
              const isConflict = conflicts.has(m.id);
              const owner = m.owner_id ? usersById.get(m.owner_id) : null;
              const attendees = (m.attendee_ids ?? []).map((id) => usersById.get(id)).filter(Boolean) as User[];
              const target = m.target_id ? targetsById.get(m.target_id) : null;
              const creator = m.created_by ? usersById.get(m.created_by) : null;
              const typeClass = `t-${m.type ?? 'pre_booked'}`;
              const typeAccent =
                m.type === 'keynote' ? '#C08A30' :
                m.type === 'party' ? '#A0721F' :
                m.type === 'internal_huddle' ? '#8B97A0' :
                m.type === 'travel' ? '#14595B' :
                m.type === 'dinner' ? '#8B4A00' :
                m.type === 'walk_up' ? '#14595B' :
                '#0B2F31';
              return (
                <div
                  key={m.id}
                  className="absolute"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `calc(${leftPct}% + 4px)`,
                    width: `calc(${widthPct}% - 8px)`,
                    pointerEvents: 'auto',
                  }}
                >
                  <Link
                    href={`/schedule/${m.id}`}
                    className={`tl-block ${typeClass} absolute inset-0 overflow-hidden hover:shadow-float transition-shadow block`}
                    style={{
                      borderLeft: `3px solid ${typeAccent}`,
                      borderRadius: 6,
                      padding: tier === 'micro' ? '3px 8px' : tier === 'small' ? '4px 8px' : '6px 8px',
                      boxShadow: isConflict ? '0 0 0 2px #8B2A1F' : undefined,
                    }}
                  >
                  {tier === 'micro' ? (
                    <div className="flex items-center gap-1.5 h-full">
                      <div className="tl-time text-[9px] font-mono font-semibold leading-none shrink-0" style={{ color: typeAccent }}>
                        {hm(m.start_at)}
                      </div>
                      <div className="flex-1 text-[11px] font-semibold leading-none text-tag-ink truncate">
                        {m.title}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {isConflict && <AlertTriangle size={10} className="text-tag-error" />}
                        {creator && (
                          <span
                            className="inline-flex items-center justify-center rounded-full text-[9px] font-bold text-white leading-none"
                            style={{ backgroundColor: creator.color ?? '#0B2F31', width: 16, height: 16, letterSpacing: 0 }}
                            title={`Created by ${creator.name}`}
                          >
                            {creator.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-1">
                        <div className="tl-time text-[10px] font-mono font-semibold leading-tight" style={{ color: typeAccent }}>
                          {hm(m.start_at)}–{hm(m.end_at)}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isConflict && <AlertTriangle size={10} className="text-tag-error" />}
                          {creator && (
                            <span
                              className="inline-flex items-center justify-center rounded-full text-[9px] font-bold text-white leading-none"
                              style={{ backgroundColor: creator.color ?? '#0B2F31', width: 16, height: 16, letterSpacing: 0 }}
                              title={`Created by ${creator.name}`}
                            >
                              {creator.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className="text-[12px] font-semibold leading-tight text-tag-ink mt-0.5"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: tier === 'small' ? 1 : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {m.title}
                      </div>
                      {(() => {
                        if (!m.live_status || !m.live_status_at) return null;
                        const end = new Date(m.end_at).getTime();
                        if (Date.now() > end + 15 * 60 * 1000) return null;
                        const pillStyle = m.live_status === 'running_late'
                          ? { backgroundColor: '#D97706', color: '#FFFFFF' }
                          : m.live_status === 'wrapping_early'
                          ? { backgroundColor: '#C08A30', color: '#FFFFFF' }
                          : { backgroundColor: '#0B2F31', color: '#FFFFFF' };
                        const label = m.live_status === 'running_late' ? 'LATE'
                          : m.live_status === 'wrapping_early' ? 'EARLY'
                          : 'ON TIME';
                        return (
                          <span
                            className="inline-block rounded-full px-1.5 py-[1px] text-[8px] font-bold tracking-wider mt-1"
                            style={pillStyle}
                          >
                            {label}
                          </span>
                        );
                      })()}
                    </>
                  )}
                  {tier === 'medium' && (target || m.location) && (
                    <div className="text-[10px] text-tag-cold mt-0.5 truncate">
                      {target ? target.company_name : m.location}
                    </div>
                  )}
                  {tier === 'large' && target && (
                    <div className="text-[10px] text-tag-cold mt-0.5 truncate">{target.company_name}</div>
                  )}
                  {tier === 'large' && m.location && (
                    <div className="text-[10px] text-tag-cold mt-0.5 font-mono truncate">{m.location}</div>
                  )}
                  {tier === 'large' && (owner || attendees.length > 0) && (
                    <div className="flex items-center gap-1 mt-1">
                      {owner && <UserAvatar name={owner.name} color={owner.color} />}
                      {attendees.filter((a) => a.id !== owner?.id).slice(0, 3).map((a) => (
                        <UserAvatar key={a.id} name={a.name} color={a.color} />
                      ))}
                    </div>
                  )}
                  </Link>
                  {/* Cheat sheet trigger — only for blocks with a linked target and enough room */}
                  {m.target_id && tier !== 'micro' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openCheatSheet(m); }}
                      aria-label="Open cheat sheet"
                      className="absolute bottom-1 right-1 w-6 h-6 rounded-full flex items-center justify-center bg-tag-gold text-white shadow-sm hover:scale-110 transition-transform z-10"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Sparkles size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        </div>
      </div>

      {/* Cheat sheet overlay */}
      {cheatSheet && (
        <CheatSheetOverlay
          target={cheatSheet.target}
          meetingTitle={cheatSheet.meeting.title}
          meetingTime={`${hm(cheatSheet.meeting.start_at)}–${hm(cheatSheet.meeting.end_at)}`}
          onClose={() => setCheatSheet(null)}
        />
      )}

      {loadingCheatSheet && (
        <div className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center pointer-events-none">
          <div className="card card-p text-xs text-tag-cold">Loading cheat sheet…</div>
        </div>
      )}

      {dayMeetings.length === 0 && (
        <div className="mt-3 text-center text-xs text-tag-cold">
          No meetings {filter === 'mine' ? 'for you ' : ''}on {fmt(date, 'EEEE, MMMM d')}. Tap any hour to create one.
        </div>
      )}
    </div>
  );
}
