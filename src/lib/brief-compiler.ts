import type { SupabaseClient } from '@supabase/supabase-js';
import { formatInTimeZone } from 'date-fns-tz';
import { TZ } from './utils';
import { subDays, parseISO, format } from 'date-fns';

/**
 * Rule-based morning brief compiler.
 * No LLM. Deterministic. Runs server-side.
 */
export async function compileMorningBrief(supabase: SupabaseClient, dateISO: string): Promise<string> {
  const target = parseISO(dateISO);
  const prior = subDays(target, 1);
  const priorISO = format(prior, 'yyyy-MM-dd');

  const dayStart = `${dateISO}T00:00:00-07:00`;
  const dayEnd = `${dateISO}T23:59:59-07:00`;

  // 1. Yesterday's debriefs (summarized per person)
  const { data: debriefs } = await supabase
    .from('debriefs')
    .select('*, users(name)')
    .eq('debrief_date', priorISO);

  // 2. High-significance intel from last 24h
  const { data: hotIntel } = await supabase
    .from('intel')
    .select('*, users:captured_by_id(name)')
    .eq('significance', 'high')
    .gte('date_observed', priorISO);

  // 3. Today's meetings (all people)
  const { data: meetings } = await supabase
    .from('meetings')
    .select('*, target:target_id(company_name, tier), owner:owner_id(name)')
    .gte('start_at', dayStart)
    .lte('start_at', dayEnd)
    .order('start_at');

  // 4. Open follow-ups with deadline <= today
  const { data: followUps } = await supabase
    .from('leads')
    .select('*, owner:owner_id(name)')
    .lte('deadline', dateISO)
    .in('follow_up_stage', ['not_started', 't1_immediate_thanks', 't2_value_add'])
    .order('deadline', { ascending: true });

  // 5. Conflict detection - check for overlapping meetings per user
  const conflicts = findConflicts(meetings ?? []);

  const dayStr = formatInTimeZone(target, TZ, 'EEEE, MMMM d');

  const sections: string[] = [];

  sections.push(`# Morning Brief — ${dayStr}`);
  sections.push(`_Compiled ${formatInTimeZone(new Date(), TZ, 'h:mm a')} · Vegas time_\n`);

  // --- Today's Priorities (from meetings) ---
  sections.push('## Today\'s meetings\n');
  if (!meetings || meetings.length === 0) {
    sections.push('_No meetings scheduled for today._\n');
  } else {
    const grouped: Record<string, typeof meetings> = {};
    for (const m of meetings) {
      const ownerName = (m as any).owner?.name ?? 'Unassigned';
      (grouped[ownerName] ||= []).push(m);
    }
    for (const [owner, ms] of Object.entries(grouped)) {
      sections.push(`**${owner}**`);
      for (const m of ms) {
        const time = formatInTimeZone(m.start_at, TZ, 'h:mm a');
        const target = (m as any).target?.company_name;
        sections.push(`- ${time} · ${m.title}${target ? ` · ${target}` : ''}${m.location ? ` · ${m.location}` : ''}`);
      }
      sections.push('');
    }
  }

  // --- Hot intel ---
  sections.push('## Competitive intel — last 24h\n');
  if (!hotIntel || hotIntel.length === 0) {
    sections.push('_Nothing flagged high-significance._\n');
  } else {
    for (const i of hotIntel) {
      const who = (i as any).users?.name ?? 'Unknown';
      sections.push(`- **${i.subject.toUpperCase()}** · ${i.headline} _(captured by ${who})_`);
      if (i.details) sections.push(`  ${i.details}`);
    }
    sections.push('');
  }

  // --- Open follow-ups ---
  sections.push('## Open follow-ups · due today or overdue\n');
  if (!followUps || followUps.length === 0) {
    sections.push('_None._\n');
  } else {
    for (const f of followUps.slice(0, 15)) {
      const owner = (f as any).owner?.name ?? 'Unassigned';
      const due = f.deadline ? formatInTimeZone(f.deadline, TZ, 'MMM d') : 'no deadline';
      sections.push(`- [${f.temperature.toUpperCase()}] ${f.full_name} (${f.company}) · ${owner} · due ${due} · ${f.next_action ?? '—'}`);
    }
    sections.push('');
  }

  // --- Conflicts ---
  if (conflicts.length > 0) {
    sections.push('## ⚠ Schedule conflicts\n');
    for (const c of conflicts) {
      sections.push(`- **${c.userName}**: ${c.meetingA} overlaps ${c.meetingB}`);
    }
    sections.push('');
  }

  // --- Yesterday's debriefs ---
  sections.push('## Yesterday\'s debriefs\n');
  if (!debriefs || debriefs.length === 0) {
    sections.push('_No debriefs submitted yet for yesterday._\n');
  } else {
    for (const d of debriefs) {
      const name = (d as any).users?.name ?? 'Unknown';
      sections.push(`**${name}**`);
      if (d.meetings_taken) sections.push(`- Meetings: ${truncate(d.meetings_taken, 200)}`);
      if (d.competitive_intel) sections.push(`- Intel: ${truncate(d.competitive_intel, 160)}`);
      if (d.surprises) sections.push(`- Surprises: ${truncate(d.surprises, 160)}`);
      if (d.open_follow_ups) sections.push(`- Open: ${truncate(d.open_follow_ups, 160)}`);
      sections.push('');
    }
  }

  return sections.join('\n');
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + '…';
}

type Conflict = { userName: string; meetingA: string; meetingB: string };

function findConflicts(
  meetings: Array<{ id: string; title: string; start_at: string; end_at: string; owner_id: string | null; attendee_ids: string[] | null; owner?: any }>
): Conflict[] {
  const conflicts: Conflict[] = [];
  const seenPairs = new Set<string>();

  // Group by each person involved
  const byUser = new Map<string, typeof meetings>();
  for (const m of meetings) {
    const ids = new Set<string>();
    if (m.owner_id) ids.add(m.owner_id);
    for (const id of m.attendee_ids ?? []) ids.add(id);
    for (const id of ids) {
      if (!byUser.has(id)) byUser.set(id, []);
      byUser.get(id)!.push(m);
    }
  }

  for (const [, list] of byUser) {
    list.sort((a, b) => a.start_at.localeCompare(b.start_at));
    // Sweep-line: maintain a set of "still open" meetings. Each time a new
    // meeting starts, any open meeting whose end_at is after the new start
    // is an overlap — flag every such pair. Handles N-way overlaps, not just
    // consecutive pairs.
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < i; j++) {
        // j is any earlier meeting in time order. If j hasn't ended before i starts,
        // they overlap.
        if (list[j].end_at > list[i].start_at) {
          const pairKey = [list[j].id, list[i].id].sort().join('|');
          if (seenPairs.has(pairKey)) continue;
          seenPairs.add(pairKey);
          conflicts.push({
            userName: (list[i] as any).owner?.name ?? 'Someone',
            meetingA: list[j].title,
            meetingB: list[i].title,
          });
        }
      }
    }
  }
  return conflicts;
}
