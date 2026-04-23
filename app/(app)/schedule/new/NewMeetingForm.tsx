'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { UserAvatar } from '@/components/app/Pills';
import { VoiceButton } from '@/components/app/VoiceInput';
import type { User, MeetingType } from '@/lib/types';

export function NewMeetingForm({
  defaultDate,
  defaultTargetId,
  defaultStart,
  defaultEnd,
  users,
  targets,
  currentUser,
}: {
  defaultDate: string;
  defaultTargetId: string;
  defaultStart: string;
  defaultEnd: string;
  users: User[];
  targets: { id: string; company_name: string; tier: string }[];
  currentUser: User;
}) {
  const router = useRouter();
  const selected = targets.find((t) => t.id === defaultTargetId);

  // Find Michael Cook as default co-attendee for anchor pair
  const michael = users.find((u) => u.name.toLowerCase().includes('michael'));

  const [form, setForm] = useState({
    title: selected ? `${selected.company_name} — meeting` : '',
    target_id: defaultTargetId,
    start_at: `${defaultDate}T${defaultStart}`,
    end_at: `${defaultDate}T${defaultEnd}`,
    location: '',
    type: 'pre_booked' as MeetingType,
    owner_id: currentUser.id,
    attendee_ids: michael && michael.id !== currentUser.id ? [currentUser.id, michael.id] : [currentUser.id],
    agenda: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  function toggleAttendee(id: string) {
    setForm((f) => ({
      ...f,
      attendee_ids: f.attendee_ids.includes(id) ? f.attendee_ids.filter((x) => x !== id) : [...f.attendee_ids, id],
    }));
  }

  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    // Convert local datetime to ISO with Vegas offset
    const startISO = `${form.start_at}:00-07:00`;
    const endISO = `${form.end_at}:00-07:00`;
    const { data, error } = await supabase
      .from('meetings')
      .insert({
        title: form.title.trim(),
        target_id: form.target_id || null,
        start_at: startISO,
        end_at: endISO,
        location: form.location || null,
        type: form.type,
        owner_id: form.owner_id,
        attendee_ids: form.attendee_ids,
        agenda: form.agenda || null,
        notes: form.notes || null,
        created_by: currentUser.id,
      })
      .select()
      .single();
    setSaving(false);
    if (error) { alert(error.message); return; }
    router.push(`/schedule/${data.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-5 md:py-8">
      <div className="card card-p space-y-3">
        <Field label="Title">
          <input autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full" placeholder="e.g. Panini America — first slot" />
        </Field>
        <Field label="Target (from brief)">
          <select value={form.target_id} onChange={(e) => {
            const t = targets.find((x) => x.id === e.target.value);
            setForm({ ...form, target_id: e.target.value, title: t ? `${t.company_name} — meeting` : form.title });
          }} className="w-full">
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
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Booth #, room, venue" className="w-full" />
        </Field>
        <Field label="Type">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MeetingType })} className="w-full">
            <option value="pre_booked">Pre-booked</option>
            <option value="walk_up">Walk-up</option>
            <option value="internal_huddle">Internal huddle</option>
            <option value="dinner">Dinner</option>
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
        <Field label="Notes" action={<VoiceButton value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />}>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Free-form — booth context, overheard intel, follow-ups" className="w-full" />
        </Field>
        <button onClick={save} disabled={saving || !form.title.trim()} className="btn-primary w-full">
          {saving ? 'Creating…' : 'Create meeting'}
        </button>
      </div>
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
