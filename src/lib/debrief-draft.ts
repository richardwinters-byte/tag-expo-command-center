import type { Meeting, Lead, Intel } from './types';

export type DebriefDraft = {
  meetings_taken: string;
  booths_visited: string;
  contacts_captured: string;
  competitive_intel: string;
  surprises: string;
  open_follow_ups: string;
  one_thing_different: string;
};

type MeetingWithTarget = Meeting & { target?: { company_name: string; tier: string } };
type LeadWithTarget = Lead & { target?: { company_name: string } };
type IntelWithTarget = Intel & { target?: { company_name: string } };

/**
 * Rule-based debrief draft — pre-fills fields from the day's actual data.
 * User reviews + edits, not generates from scratch at 8:30 PM.
 *
 * Output is plain text (newline-separated bullets). Deliberately terse —
 * user should be polishing, not deleting.
 */
export function buildDebriefDraft({
  meetings,
  leads,
  intel,
}: {
  meetings: MeetingWithTarget[];
  leads: LeadWithTarget[];
  intel: IntelWithTarget[];
}): DebriefDraft {
  const completedMeetings = meetings.filter((m) => m.status === 'completed' || m.outcome);
  const hotLeads = leads.filter((l) => l.temperature === 'hot');
  const highIntel = intel.filter((i) => i.significance === 'high');

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' });

  // Meetings taken — time + title + target
  const meetings_taken = completedMeetings.length === 0
    ? ''
    : completedMeetings.map((m) => {
        const tgt = m.target?.company_name ? ` (${m.target.company_name})` : '';
        const outcome = m.outcome ? ` — ${m.outcome.slice(0, 80)}${m.outcome.length > 80 ? '…' : ''}` : '';
        return `• ${fmt(m.start_at)} ${m.title}${tgt}${outcome}`;
      }).join('\n');

  // Booths visited — pull from meeting locations (unique, deduped)
  const booths = new Set<string>();
  for (const m of meetings) {
    if (m.location && m.location.trim()) {
      const loc = m.location.trim();
      const companyHint = m.target?.company_name ? ` — ${m.target.company_name}` : '';
      booths.add(`${loc}${companyHint}`);
    }
  }
  const booths_visited = booths.size === 0 ? '' : Array.from(booths).map((b) => `• ${b}`).join('\n');

  // Contacts captured — from leads logged today
  const contacts_captured = leads.length === 0
    ? ''
    : leads.map((l) => {
        const co = l.company || l.target?.company_name || '—';
        const ti = l.title ? `, ${l.title}` : '';
        const tempIcon = l.temperature === 'hot' ? ' 🔥' : '';
        return `• ${l.full_name}${ti} · ${co}${tempIcon}`;
      }).join('\n');

  // Competitive intel — from intel logged today (high-sig first)
  const sortedIntel = [
    ...intel.filter((i) => i.significance === 'high'),
    ...intel.filter((i) => i.significance !== 'high'),
  ];
  const competitive_intel = sortedIntel.length === 0
    ? ''
    : sortedIntel.map((i) => {
        const subject = i.target?.company_name ?? i.subject?.replace(/_/g, ' ') ?? 'general';
        const tag = i.significance === 'high' ? '★ ' : '';
        return `• ${tag}[${subject}] ${i.headline}`;
      }).join('\n');

  // Surprises — hot leads + high-sig intel as seeds
  const surpriseParts: string[] = [];
  if (hotLeads.length > 0) {
    surpriseParts.push(`Hot leads today: ${hotLeads.map((l) => l.full_name).join(', ')}`);
  }
  if (highIntel.length > 0) {
    surpriseParts.push(`Standout intel: ${highIntel[0].headline}`);
  }
  const surprises = surpriseParts.length === 0 ? '' : surpriseParts.map((p) => `• ${p}`).join('\n');

  // Follow-ups — leads with next_action set
  const withNextAction = leads.filter((l) => l.next_action && l.next_action.trim());
  const open_follow_ups = withNextAction.length === 0
    ? ''
    : withNextAction.map((l) => {
        const due = l.deadline ? ` (by ${new Date(l.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})` : '';
        return `• ${l.full_name}: ${l.next_action}${due}`;
      }).join('\n');

  // One thing different — left blank for user to fill; suggest a prompt
  const one_thing_different = '';

  return {
    meetings_taken,
    booths_visited,
    contacts_captured,
    competitive_intel,
    surprises,
    open_follow_ups,
    one_thing_different,
  };
}
