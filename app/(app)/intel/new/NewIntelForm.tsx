'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { VoiceButton } from '@/components/app/VoiceInput';
import { getErrorMessage } from '@/lib/utils';
import type { IntelSubject, IntelType, Significance, User } from '@/lib/types';

const SUBJECTS: { value: IntelSubject; label: string }[] = [
  { value: 'psa', label: 'PSA' },
  { value: 'cgc', label: 'CGC' },
  { value: 'beckett', label: 'Beckett' },
  { value: 'sgc', label: 'SGC' },
  { value: 'panini', label: 'Panini' },
  { value: 'collectors_holdings', label: 'Collectors' },
  { value: 'fanatics', label: 'Fanatics' },
  { value: 'other', label: 'Other' },
];

export function NewIntelForm({
  currentUser,
  targets,
  defaultTargetId,
}: {
  currentUser: User;
  targets: { id: string; company_name: string; tier: string }[];
  defaultTargetId?: string;
}) {
  const router = useRouter();

  const [aboutKind, setAboutKind] = useState<'target' | 'tag' | 'subject'>(defaultTargetId ? 'target' : 'target');
  const [form, setForm] = useState({
    target_id: defaultTargetId ?? '',
    tag: '',
    subject: 'cgc' as IntelSubject,
    type: 'booth_observation' as IntelType,
    significance: 'medium' as Significance,
    headline: '',
    details: '',
    source: '',
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.headline.trim()) return;
    if (aboutKind === 'target' && !form.target_id) return;
    if (aboutKind === 'tag' && !form.tag.trim()) return;
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('intel').insert({
        target_id: aboutKind === 'target' ? form.target_id : null,
        tag: aboutKind === 'tag' ? form.tag.trim() : null,
        subject: aboutKind === 'subject' ? form.subject : null,
        type: form.type,
        significance: form.significance,
        headline: form.headline.trim(),
        details: form.details.trim() || null,
        source: form.source.trim() || null,
        captured_by_id: currentUser.id,
        date_observed: new Date().toISOString().slice(0, 10),
      });
      if (error) {
        alert(getErrorMessage(error, 'Failed to log intel.'));
        return;
      }
      router.push('/intel');
    } finally {
      setSaving(false);
    }
  }

  const canSave =
    !!form.headline.trim() &&
    (aboutKind !== 'target' || !!form.target_id) &&
    (aboutKind !== 'tag' || !!form.tag.trim());

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-5 md:py-8">
      <div className="card card-p space-y-3">
        <Field label="About">
          <div className="grid grid-cols-3 gap-2">
            {([
              { k: 'target' as const, l: 'Target' },
              { k: 'tag' as const, l: 'Tag' },
              { k: 'subject' as const, l: 'Competitor' },
            ]).map(({ k, l }) => (
              <button
                key={k}
                type="button"
                onClick={() => setAboutKind(k)}
                className={`py-2 rounded-btn text-xs font-medium ${
                  aboutKind === k ? 'bg-tag-900 text-white' : 'bg-tag-50 text-tag-cold'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </Field>

        {aboutKind === 'target' && (
          <Field label="Target company">
            <select value={form.target_id} onChange={(e) => setForm({ ...form, target_id: e.target.value })} className="w-full">
              <option value="">— Select a target —</option>
              {targets.map((t) => <option key={t.id} value={t.id}>{t.company_name}</option>)}
            </select>
          </Field>
        )}
        {aboutKind === 'tag' && (
          <Field label="Tag">
            <input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} className="w-full" placeholder='e.g. "ubisoft", "industry"' />
            <div className="text-[10px] text-tag-cold mt-1">Use for off-list companies or general observations.</div>
          </Field>
        )}
        {aboutKind === 'subject' && (
          <Field label="Competitor">
            <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value as IntelSubject })} className="w-full">
              {SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as IntelType })} className="w-full">
              <option value="booth_observation">Booth observation</option>
              <option value="overheard">Overheard</option>
              <option value="announced_deal">Announced deal</option>
              <option value="pricing">Pricing</option>
              <option value="tech_demo">Tech demo</option>
              <option value="rumor">Rumor</option>
              <option value="personnel">Personnel</option>
            </select>
          </Field>
          <Field label="Significance">
            <select value={form.significance} onChange={(e) => setForm({ ...form, significance: e.target.value as Significance })} className="w-full">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
        </div>

        <Field label="Headline" action={<VoiceButton value={form.headline} onChange={(v) => setForm({ ...form, headline: v })} />}>
          <input autoFocus value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="One line — the finding" className="w-full" />
        </Field>

        <Field label="Details" action={<VoiceButton value={form.details} onChange={(v) => setForm({ ...form, details: v })} />}>
          <textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} rows={4} className="w-full" placeholder="What you saw, who said it, what it means" />
        </Field>

        <Field label="Source">
          <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full" placeholder="Booth, conversation, overheard…" />
        </Field>

        <button onClick={save} disabled={saving || !canSave} className="btn-primary w-full">
          {saving ? 'Logging…' : 'Log intel'}
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
