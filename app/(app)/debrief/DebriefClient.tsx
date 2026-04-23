'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Download, Loader2, Sparkles } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { exportDebriefPdf } from '@/lib/export';
import { VoiceButton } from '@/components/app/VoiceInput';
import type { Debrief, User } from '@/lib/types';
import type { DebriefDraft } from '@/lib/debrief-draft';

const DATES = ['2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21'];

export function DebriefClient({
  date,
  existing,
  teamDebriefs,
  users,
  currentUser,
  prefill,
}: {
  date: string;
  existing: Debrief | null;
  teamDebriefs: (Debrief & { users: { name: string; color: string } })[];
  users: User[];
  currentUser: User;
  prefill?: DebriefDraft | null;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    meetings_taken: existing?.meetings_taken ?? '',
    booths_visited: existing?.booths_visited ?? '',
    contacts_captured: existing?.contacts_captured ?? '',
    competitive_intel: existing?.competitive_intel ?? '',
    surprises: existing?.surprises ?? '',
    open_follow_ups: existing?.open_follow_ups ?? '',
    one_thing_different: existing?.one_thing_different ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [prefillApplied, setPrefillApplied] = useState(false);

  // Only show the apply button when there's actually data to insert
  const hasUsefulPrefill = !!prefill && Object.values(prefill).some((v) => v && v.trim().length > 0);

  function applyPrefill() {
    if (!prefill) return;
    // Non-destructive: only fill fields the user hasn't already written in
    setForm((prev) => ({
      meetings_taken: prev.meetings_taken || prefill.meetings_taken,
      booths_visited: prev.booths_visited || prefill.booths_visited,
      contacts_captured: prev.contacts_captured || prefill.contacts_captured,
      competitive_intel: prev.competitive_intel || prefill.competitive_intel,
      surprises: prev.surprises || prefill.surprises,
      open_follow_ups: prev.open_follow_ups || prefill.open_follow_ups,
      one_thing_different: prev.one_thing_different || prefill.one_thing_different,
    }));
    setPrefillApplied(true);
  }

  async function submit() {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase
      .from('debriefs')
      .upsert(
        {
          user_id: currentUser.id,
          debrief_date: date,
          ...form,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,debrief_date' }
      );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    router.refresh();
  }

  // Who submitted?
  const submittedIds = new Set(teamDebriefs.map((d) => d.user_id));

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-5 md:py-8 space-y-5">
      {/* Date picker */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {DATES.map((d) => (
          <a
            key={d}
            href={`/debrief?date=${d}`}
            className={`shrink-0 px-4 py-2 rounded-btn text-sm font-medium ${
              date === d ? 'bg-tag-900 text-white' : 'bg-white border border-hairline'
            }`}
          >
            {new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </a>
        ))}
      </div>

      {/* Export buttons */}
      <ExportButtons date={date} />

      {/* Team submission status */}
      <div className="card card-p">
        <div className="section-header">Team status · {date}</div>
        <div className="flex flex-wrap gap-2">
          {users.map((u) => {
            const submitted = submittedIds.has(u.id);
            return (
              <div key={u.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${submitted ? 'bg-tag-success/15 text-tag-success' : 'bg-tag-gold/15 text-tag-gold-dark'}`}>
                {submitted ? <Check size={12} /> : <span className="w-1.5 h-1.5 rounded-full bg-tag-gold" />}
                <span>{u.name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* My submission */}
      <div className="space-y-4">
        {!existing && hasUsefulPrefill && !prefillApplied && (
          <div className="rounded-xl border-2 border-dashed p-4" style={{ borderColor: '#C08A30', backgroundColor: 'rgba(192, 138, 48, 0.06)' }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#C08A30', color: '#FFFFFF' }}>
                <Sparkles size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-tag-ink">Pre-fill from today's data</div>
                <p className="text-[12px] text-tag-cold mt-0.5">
                  Auto-drafted from your completed meetings, leads captured, and intel logged. Fills only empty fields — your edits are safe.
                </p>
                <button
                  onClick={applyPrefill}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold rounded-btn px-3 py-1.5"
                  style={{ backgroundColor: '#C08A30', color: '#FFFFFF' }}
                >
                  <Sparkles size={12} /> Fill from today
                </button>
              </div>
            </div>
          </div>
        )}
        {prefillApplied && !existing && (
          <div className="rounded-btn px-3 py-2 text-[12px] flex items-center gap-2" style={{ backgroundColor: 'rgba(192, 138, 48, 0.1)', color: '#A0721F' }}>
            <Check size={14} /> Pre-filled — edit and submit when ready.
          </div>
        )}
        <TextArea
          label="Meetings taken today"
          hint="Company — person — topic — outcome — next action"
          value={form.meetings_taken}
          onChange={(v) => setForm({ ...form, meetings_taken: v })}
        />
        <TextArea
          label="Booths visited"
          hint="Booth # — brand — 1-line takeaway"
          value={form.booths_visited}
          onChange={(v) => setForm({ ...form, booths_visited: v })}
        />
        <TextArea
          label="Contacts captured"
          hint="Name, company, role, email/phone, follow-up method"
          value={form.contacts_captured}
          onChange={(v) => setForm({ ...form, contacts_captured: v })}
        />
        <TextArea
          label="Competitive intel"
          hint="PSA/CGC/Beckett/SGC/Panini observations"
          value={form.competitive_intel}
          onChange={(v) => setForm({ ...form, competitive_intel: v })}
        />
        <TextArea
          label="Surprises / opportunities not on the plan"
          value={form.surprises}
          onChange={(v) => setForm({ ...form, surprises: v })}
        />
        <TextArea
          label="Open follow-ups for tomorrow"
          value={form.open_follow_ups}
          onChange={(v) => setForm({ ...form, open_follow_ups: v })}
        />
        <TextArea
          label="One thing TAG should do differently at the next expo"
          hint="Goes into the trip report"
          value={form.one_thing_different}
          onChange={(v) => setForm({ ...form, one_thing_different: v })}
        />
        <button onClick={submit} disabled={saving} className="btn-primary w-full">
          {saving ? 'Submitting…' : saved ? '✓ Submitted' : existing ? 'Update debrief' : 'Submit debrief'}
        </button>
      </div>

      {/* Other submissions */}
      {teamDebriefs.length > 0 && (
        <section>
          <div className="section-header">Team debriefs · {date}</div>
          <div className="space-y-2">
            {teamDebriefs.filter((d) => d.user_id !== currentUser.id).map((d) => (
              <div key={d.id} className="card card-p">
                <div className="font-medium text-sm mb-2" style={{ color: d.users?.color ?? '#14595B' }}>
                  {d.users?.name}
                </div>
                {d.meetings_taken && <DebriefSection label="Meetings" text={d.meetings_taken} />}
                {d.competitive_intel && <DebriefSection label="Intel" text={d.competitive_intel} />}
                {d.surprises && <DebriefSection label="Surprises" text={d.surprises} />}
                {d.open_follow_ups && <DebriefSection label="Open" text={d.open_follow_ups} />}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TextArea({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium">{label}</label>
        <VoiceButton value={value} onChange={onChange} />
      </div>
      {hint && <div className="text-[11px] text-tag-cold mb-1.5">{hint}</div>}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full" />
    </div>
  );
}

function DebriefSection({ label, text }: { label: string; text: string }) {
  return (
    <div className="text-xs mt-2">
      <span className="text-tag-cold uppercase tracking-wider text-[10px] font-medium mr-2">{label}</span>
      <span className="text-tag-ink whitespace-pre-line">{text}</span>
    </div>
  );
}

function ExportButtons({ date }: { date: string }) {
  const [exporting, setExporting] = useState<'day' | 'all' | null>(null);

  async function onExport(kind: 'day' | 'all') {
    setExporting(kind);
    try {
      const dates = kind === 'day' ? [date] : DATES;
      await exportDebriefPdf(dates);
    } catch (e) {
      alert('Export failed: ' + (e instanceof Error ? e.message : 'unknown'));
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => onExport('day')}
        disabled={exporting !== null}
        className="inline-flex items-center gap-1.5 bg-white border border-hairline text-tag-900 px-3 py-2 rounded-btn text-xs font-medium hover:bg-tag-50 disabled:opacity-50"
      >
        {exporting === 'day' ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        Export {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} as PDF
      </button>
      <button
        onClick={() => onExport('all')}
        disabled={exporting !== null}
        className="inline-flex items-center gap-1.5 bg-white border border-hairline text-tag-900 px-3 py-2 rounded-btn text-xs font-medium hover:bg-tag-50 disabled:opacity-50"
      >
        {exporting === 'all' ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
        Export all 4 days
      </button>
    </div>
  );
}
