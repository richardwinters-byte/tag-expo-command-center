'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Download, Trash2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { UserAvatar } from '@/components/app/Pills';
import { AttachmentsSection } from '@/components/app/AttachmentsSection';
import { VoiceButton } from '@/components/app/VoiceInput';
import { downloadICS, fmt, fmtRange } from '@/lib/utils';
import type { Meeting, User, MeetingStatus, MeetingType } from '@/lib/types';

export function MeetingDetailClient({
  meeting,
  users,
  targets,
  currentUser,
}: {
  meeting: Meeting & { target?: { id: string; company_name: string; tier: string } };
  users: User[];
  targets: { id: string; company_name: string; tier: string }[];
  currentUser: User;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: meeting.title,
    target_id: meeting.target_id ?? '',
    start_at: meeting.start_at.slice(0, 16),
    end_at: meeting.end_at.slice(0, 16),
    location: meeting.location ?? '',
    type: meeting.type,
    status: meeting.status,
    owner_id: meeting.owner_id ?? currentUser.id,
    attendee_ids: meeting.attendee_ids ?? [],
    agenda: meeting.agenda ?? '',
    outcome: meeting.outcome ?? '',
    notes: meeting.notes ?? '',
    next_action: meeting.next_action ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleAttendee(id: string) {
    setForm((f) => ({
      ...f,
      attendee_ids: f.attendee_ids.includes(id) ? f.attendee_ids.filter((x) => x !== id) : [...f.attendee_ids, id],
    }));
  }

  async function save() {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from('meetings')
      .update({
        ...form,
        target_id: form.target_id || null,
        location: form.location || null,
        agenda: form.agenda || null,
        outcome: form.outcome || null,
        notes: form.notes || null,
        next_action: form.next_action || null,
      })
      .eq('id', meeting.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function del() {
    if (!confirm('Delete this meeting?')) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from('meetings').delete().eq('id', meeting.id);
    router.push('/schedule');
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-5 md:py-8 space-y-5">
      {/* Quick info strip */}
      <div className="card card-p">
        <div className="text-xs text-tag-cold mb-1">{fmt(meeting.start_at, 'EEEE, MMMM d')}</div>
        <div className="text-lg font-semibold">{meeting.title}</div>
        <div className="text-sm text-tag-cold font-mono mt-1">{fmtRange(meeting.start_at, meeting.end_at)}</div>
        {meeting.location && <div className="text-sm text-tag-700 mt-1">📍 {meeting.location}</div>}
        {meeting.created_by && (() => {
          const creator = users.find((u) => u.id === meeting.created_by);
          if (!creator) return null;
          return (
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-tag-cold">
              <span>Created by</span>
              <UserAvatar name={creator.name} color={creator.color} />
              <span className="text-tag-ink font-medium">{creator.name}</span>
            </div>
          );
        })()}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => downloadICS({ id: meeting.id, title: meeting.title, start_at: meeting.start_at, end_at: meeting.end_at, location: meeting.location, agenda: meeting.agenda })}
            className="btn-outline btn-sm"
          >
            <Download size={12} /> Add to calendar
          </button>
          {meeting.target && (
            <Link href={`/targets/${meeting.target.id}`} className="btn-ghost btn-sm">
              Target brief
            </Link>
          )}
        </div>
      </div>

      {/* Live status strip — running late / on time / wrapping early */}
      <LiveStatusStrip meeting={meeting} />

      {/* Edit form */}
      <section>
        <div className="section-header">Edit</div>
        <div className="card card-p space-y-3">
          <Field label="Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full" />
          </Field>
          <Field label="Target">
            <select value={form.target_id} onChange={(e) => setForm({ ...form, target_id: e.target.value })} className="w-full">
              <option value="">— No linked target —</option>
              {targets.map((t) => <option key={t.id} value={t.id}>{t.company_name}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start">
              <input type="datetime-local" value={form.start_at} onChange={(e) => setForm({ ...form, start_at: e.target.value })} className="w-full" />
            </Field>
            <Field label="End">
              <input type="datetime-local" value={form.end_at} onChange={(e) => setForm({ ...form, end_at: e.target.value })} className="w-full" />
            </Field>
          </div>
          <Field label="Location">
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Booth # or venue" className="w-full" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MeetingType })} className="w-full">
                <option value="pre_booked">Pre-booked</option>
                <option value="walk_up">Walk-up</option>
                <option value="keynote">Keynote</option>
                <option value="party">Party</option>
                <option value="internal_huddle">Internal huddle</option>
                <option value="travel">Travel</option>
                <option value="dinner">Dinner</option>
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MeetingStatus })} className="w-full">
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="no_show">No show</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </Field>
          </div>
          <Field label="Owner">
            <select value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })} className="w-full">
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </Field>
          <Field label="Attendees">
            <div className="flex flex-wrap gap-2">
              {users.map((u) => {
                const active = form.attendee_ids.includes(u.id);
                return (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => toggleAttendee(u.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${active ? 'bg-tag-900 text-white' : 'bg-tag-50 border border-hairline'}`}
                  >
                    <UserAvatar name={u.name} color={u.color} />
                    {u.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Agenda" action={<VoiceButton value={form.agenda} onChange={(v) => setForm({ ...form, agenda: v })} />}>
            <textarea value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} rows={3} className="w-full" />
          </Field>
          <Field label="Outcome (filled post-meeting)" action={<VoiceButton value={form.outcome} onChange={(v) => setForm({ ...form, outcome: v })} />}>
            <textarea value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} rows={3} className="w-full" />
          </Field>
          <Field label="Notes" action={<VoiceButton value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />}>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Free-form — booth context, overheard intel, follow-ups" className="w-full" />
          </Field>
          <Field label="Next action" action={<VoiceButton value={form.next_action} onChange={(v) => setForm({ ...form, next_action: v })} />}>
            <input value={form.next_action} onChange={(e) => setForm({ ...form, next_action: e.target.value })} className="w-full" />
          </Field>
          <button onClick={save} disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save meeting'}
          </button>
        </div>
      </section>

      {/* Photos — booth signage, materials, evidence */}
      <AttachmentsSection target={{ kind: 'meeting', id: meeting.id }} currentUserId={currentUser.id} users={users} />

      <button onClick={del} className="btn-ghost text-tag-error">
        <Trash2 size={14} /> Delete meeting
      </button>
    </div>
  );
}

function Field({ label, children, action }: { label: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider">{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}

// ============================================================
// LIVE STATUS STRIP — running late / on time / wrapping early
// ============================================================
function LiveStatusStrip({ meeting }: { meeting: Meeting }) {
  const router = useRouter();
  const [saving, setSaving] = useState<'running_late' | 'on_time' | 'wrapping_early' | null>(null);
  const [localStatus, setLocalStatus] = useState(meeting.live_status);

  // Stale after meeting ends + 15 min — hide status then
  const isStale = (() => {
    if (!meeting.live_status_at) return false;
    const end = new Date(meeting.end_at).getTime();
    return Date.now() > end + 15 * 60 * 1000;
  })();

  async function setStatus(status: 'running_late' | 'on_time' | 'wrapping_early') {
    setSaving(status);
    const supabase = createSupabaseBrowserClient();
    // Toggle off if already set to same
    const newStatus = localStatus === status ? null : status;
    await supabase
      .from('meetings')
      .update({ live_status: newStatus, live_status_at: newStatus ? new Date().toISOString() : null })
      .eq('id', meeting.id);
    setLocalStatus(newStatus);
    setSaving(null);
    router.refresh();
  }

  const active = isStale ? null : localStatus;

  return (
    <section>
      <div className="section-header">Live status</div>
      <div className="card card-p">
        <div className="grid grid-cols-3 gap-2">
          <StatusButton
            active={active === 'running_late'}
            loading={saving === 'running_late'}
            onClick={() => setStatus('running_late')}
            tone="amber"
            label="Running late"
            sub="+10 min"
          />
          <StatusButton
            active={active === 'on_time'}
            loading={saving === 'on_time'}
            onClick={() => setStatus('on_time')}
            tone="teal"
            label="On time"
            sub="tracking well"
          />
          <StatusButton
            active={active === 'wrapping_early'}
            loading={saving === 'wrapping_early'}
            onClick={() => setStatus('wrapping_early')}
            tone="gold"
            label="Wrapping early"
            sub="free in 5"
          />
        </div>
        {active && (
          <p className="text-[11px] text-tag-cold mt-2 text-center">
            Anchor pair sees this on Today + Schedule. Tap again to clear.
          </p>
        )}
      </div>
    </section>
  );
}

function StatusButton({
  active, loading, onClick, tone, label, sub,
}: {
  active: boolean; loading: boolean; onClick: () => void;
  tone: 'amber' | 'teal' | 'gold'; label: string; sub: string;
}) {
  const toneStyle = active
    ? tone === 'amber' ? { backgroundColor: '#D97706', color: '#FFFFFF' }
    : tone === 'teal'  ? { backgroundColor: '#0B2F31', color: '#FFFFFF' }
    :                    { backgroundColor: '#C08A30', color: '#FFFFFF' }
    : {};
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`rounded-btn py-2.5 text-center transition-colors ${active ? '' : 'bg-tag-50 dark:bg-white/5 hover:bg-tag-100 dark:hover:bg-white/10'} disabled:opacity-60`}
      style={toneStyle}
    >
      <div className="text-[12px] font-semibold">{label}</div>
      <div className={`text-[10px] mt-0.5 ${active ? 'text-white/80' : 'text-tag-cold'}`}>{sub}</div>
    </button>
  );
}
