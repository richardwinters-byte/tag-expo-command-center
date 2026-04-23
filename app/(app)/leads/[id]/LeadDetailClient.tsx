'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { Lead, User, FollowUp, Temperature, FollowUpStage, Channel } from '@/lib/types';
import { fmt } from '@/lib/utils';
import { AttachmentsSection } from '@/components/app/AttachmentsSection';
import { VoiceButton } from '@/components/app/VoiceInput';

export function LeadDetailClient({
  lead,
  users,
  followUps: initialFollowUps,
  currentUser,
}: {
  lead: Lead & { target?: any; meeting?: any };
  users: User[];
  followUps: FollowUp[];
  currentUser: User;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: lead.full_name,
    company: lead.company,
    title: lead.title ?? '',
    email: lead.email ?? '',
    phone: lead.phone ?? '',
    linkedin_url: lead.linkedin_url ?? '',
    temperature: lead.temperature,
    owner_id: lead.owner_id ?? currentUser.id,
    next_action: lead.next_action ?? '',
    deadline: lead.deadline ?? '',
    preferred_followup_channel: lead.preferred_followup_channel ?? 'email' as Channel,
    follow_up_stage: lead.follow_up_stage,
    notes: lead.notes ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [followUps, setFollowUps] = useState(initialFollowUps);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from('leads')
      .update({
        ...form,
        title: form.title || null,
        email: form.email || null,
        phone: form.phone || null,
        linkedin_url: form.linkedin_url || null,
        next_action: form.next_action || null,
        deadline: form.deadline || null,
        notes: form.notes || null,
      })
      .eq('id', lead.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  async function del() {
    if (!confirm(`Delete lead ${lead.full_name}?`)) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from('leads').delete().eq('id', lead.id);
    router.push('/leads');
  }

  async function generateFollowUp(touch: 't1' | 't2' | 't3') {
    const draft = generateDraft(touch, lead, currentUser);
    const supabase = createSupabaseBrowserClient();
    const existing = followUps.find((f) => f.touch === touch);
    if (existing) {
      await supabase.from('follow_ups').update({ draft, channel: form.preferred_followup_channel }).eq('id', existing.id);
    } else {
      const { data } = await supabase
        .from('follow_ups')
        .insert({ lead_id: lead.id, touch, channel: form.preferred_followup_channel, draft })
        .select()
        .single();
      if (data) setFollowUps([...followUps, data as FollowUp]);
    }
    router.refresh();
  }

  async function markSent(touch: 't1' | 't2' | 't3') {
    const existing = followUps.find((f) => f.touch === touch);
    if (!existing) return;
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from('follow_ups')
      .update({ sent_at: new Date().toISOString(), sent_by_id: currentUser.id })
      .eq('id', existing.id);
    const newStage: FollowUpStage =
      touch === 't1' ? 't1_immediate_thanks' :
      touch === 't2' ? 't2_value_add' : 't3_proposal';
    await supabase.from('leads').update({ follow_up_stage: newStage }).eq('id', lead.id);
    router.refresh();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-5 md:py-8 space-y-5">
      {/* Linked target */}
      {lead.target && (
        <Link href={`/targets/${lead.target_id}`} className="card card-p block hover:bg-tag-50 transition-colors">
          <div className="text-[10px] uppercase tracking-wider text-tag-cold">Linked target</div>
          <div className="text-sm font-medium mt-0.5">{lead.target.company_name}</div>
        </Link>
      )}

      {/* Main form */}
      <section>
        <div className="section-header">Details</div>
        <div className="card card-p space-y-3">
          <Field label="Full name">
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full" />
          </Field>
          <Field label="Company">
            <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full" />
          </Field>
          <Field label="Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full" />
            </Field>
            <Field label="Phone">
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full" />
            </Field>
          </div>
          <Field label="LinkedIn">
            <input type="url" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/…" className="w-full" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Temperature">
              <select value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value as Temperature })} className="w-full">
                <option value="cold">Cold</option>
                <option value="warm">Warm</option>
                <option value="hot">Hot</option>
              </select>
            </Field>
            <Field label="Owner">
              <select value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })} className="w-full">
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Next action" action={<VoiceButton value={form.next_action} onChange={(v) => setForm({ ...form, next_action: v })} />}>
            <input value={form.next_action} onChange={(e) => setForm({ ...form, next_action: e.target.value })} className="w-full" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Deadline">
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full" />
            </Field>
            <Field label="Preferred channel">
              <select value={form.preferred_followup_channel} onChange={(e) => setForm({ ...form, preferred_followup_channel: e.target.value as Channel })} className="w-full">
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="linkedin">LinkedIn</option>
                <option value="in_person">In person</option>
              </select>
            </Field>
          </div>
          <Field label="Stage">
            <select value={form.follow_up_stage} onChange={(e) => setForm({ ...form, follow_up_stage: e.target.value as FollowUpStage })} className="w-full">
              <option value="not_started">Not started</option>
              <option value="t1_immediate_thanks">T1 — Immediate thanks sent</option>
              <option value="t2_value_add">T2 — Value-add sent</option>
              <option value="t3_proposal">T3 — Proposal/call booked</option>
            </select>
          </Field>
          <Field label="Notes" action={<VoiceButton value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />}>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={5} className="w-full" />
          </Field>
          <button onClick={save} disabled={saving} className="btn-primary w-full">
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </section>

      {/* Photos — business cards, brochures, booth shots */}
      <AttachmentsSection target={{ kind: 'lead', id: lead.id }} currentUserId={currentUser.id} users={users} />

      {/* 3-touch follow-ups */}
      <section>
        <div className="section-header">3-touch follow-up cadence</div>
        <div className="space-y-2">
          {(['t1', 't2', 't3'] as const).map((touch) => {
            const f = followUps.find((x) => x.touch === touch);
            const labels = { t1: 'T1 · Immediate thanks (day 1)', t2: 'T2 · Value-add (by day 7)', t3: 'T3 · Proposal or call (by day 14)' };
            return (
              <div key={touch} className="card card-p">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">{labels[touch]}</div>
                  {f?.sent_at && (
                    <span className="pill bg-tag-success/15 text-tag-success">
                      Sent {fmt(f.sent_at, 'MMM d')}
                    </span>
                  )}
                </div>
                {f?.draft ? (
                  <>
                    <pre className="text-xs whitespace-pre-wrap bg-tag-50 p-3 rounded-btn font-sans max-h-60 overflow-y-auto">{f.draft}</pre>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => { navigator.clipboard.writeText(f.draft ?? ''); }}
                        className="btn-outline btn-sm"
                      >
                        Copy
                      </button>
                      {!f.sent_at && (
                        <button onClick={() => markSent(touch)} className="btn-primary btn-sm">
                          Mark sent
                        </button>
                      )}
                      <button onClick={() => generateFollowUp(touch)} className="btn-ghost btn-sm">
                        Regenerate
                      </button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => generateFollowUp(touch)} className="btn-outline btn-sm">
                    Draft {touch.toUpperCase()} message
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Delete */}
      <button onClick={del} className="btn-ghost text-tag-error">
        <Trash2 size={14} /> Delete lead
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

// Rule-based drafts
function generateDraft(touch: 't1' | 't2' | 't3', lead: Lead, me: User): string {
  const first = lead.full_name.split(' ')[0];
  const sig = me.signature || `${me.name}\nTAG Grading`;
  if (touch === 't1') {
    return `Hi ${first},

Great meeting you at Licensing Expo. Short note to say thanks for the conversation and to make sure I have you in the right place for a follow-up.

${lead.next_action ? `Next step on my side: ${lead.next_action}.` : ''}

Let me know what makes sense on your end and I'll work around it.

Best,
${sig}`;
  }
  if (touch === 't2') {
    return `Hi ${first},

Following up on our Expo conversation. Attaching/linking what we discussed${lead.notes ? ` — specifically: ${lead.notes.slice(0, 120)}` : ''}.

Open to a 20-minute call to dig in. Anytime next week works on my side.

${sig}`;
  }
  return `Hi ${first},

Circling back to put something concrete in front of you. Proposal/pilot outline attached — happy to walk you through on a 30-minute call.

Have a few slots open next week:
- [offer 3 times]

${sig}`;
}
