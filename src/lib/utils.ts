import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatInTimeZone } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TZ = 'America/Los_Angeles';

export function fmt(date: string | Date, pattern: string) {
  return formatInTimeZone(date, TZ, pattern);
}

export function fmtDay(date: string | Date) {
  return fmt(date, 'EEE, MMM d');
}

export function fmtTime(date: string | Date) {
  return fmt(date, 'h:mm a');
}

export function fmtRange(start: string | Date, end: string | Date) {
  return `${fmtTime(start)} – ${fmtTime(end)}`;
}

export function todayInVegas(): string {
  return formatInTimeZone(new Date(), TZ, 'yyyy-MM-dd');
}

export function nowInVegasISO(): string {
  return formatInTimeZone(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

// Produce an ICS file for a meeting
export function meetingToICS(meeting: {
  id: string;
  title: string;
  start_at: string;
  end_at: string;
  location?: string | null;
  agenda?: string | null;
}): string {
  const dt = (iso: string) =>
    formatInTimeZone(iso, 'UTC', "yyyyMMdd'T'HHmmss'Z'");
  const escape = (s: string) =>
    s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TAG Expo//EN',
    'BEGIN:VEVENT',
    `UID:${meeting.id}@tag-expo`,
    `DTSTAMP:${dt(new Date().toISOString())}`,
    `DTSTART:${dt(meeting.start_at)}`,
    `DTEND:${dt(meeting.end_at)}`,
    `SUMMARY:${escape(meeting.title)}`,
    meeting.location ? `LOCATION:${escape(meeting.location)}` : '',
    meeting.agenda ? `DESCRIPTION:${escape(meeting.agenda)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

export function downloadICS(
  meeting: Parameters<typeof meetingToICS>[0],
  filename?: string
) {
  const ics = meetingToICS(meeting);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename ?? `${meeting.title.replace(/\W+/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadCSV(rows: Record<string, any>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const csv = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => esc(r[h])).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function tierLabel(tier: string): string {
  const map: Record<string, string> = {
    tier_1: 'Tier 1',
    tier_2: 'Tier 2',
    tier_3: 'Tier 3',
    nice_to_meet: 'Nice-to-Meet',
    opportunistic: 'Opportunistic',
    retailer: 'Retailer',
  };
  return map[tier] ?? tier;
}

export function trackLabel(track: string): string {
  const map: Record<string, string> = {
    entertainment_ip: 'Entertainment & IP',
    sports: 'Sports',
    cpg_backflip: 'CPG / Backflip',
    japanese_ip: 'Japanese IP',
    retail: 'Retail',
    agent: 'Licensing Agent',
    competitor: 'Competitor',
    new_surfaced: 'Newly Surfaced',
  };
  return map[track] ?? track;
}

export function coverageLabel(c: string): string {
  const map: Record<string, string> = {
    anchor_pair: 'Anchor Pair',
  };
  return map[c] ?? c;
}

export function statusLabel(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? '').concat(parts[1]?.[0] ?? '').toUpperCase();
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (typeof error === 'string' && error.trim()) return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}
