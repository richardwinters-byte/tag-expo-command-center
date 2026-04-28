'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Trash2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { uploadAttachment } from '@/lib/attachments';
import { VoiceButton } from '@/components/app/VoiceInput';
import { getErrorMessage } from '@/lib/utils';
import type { User, Temperature } from '@/lib/types';

export function NewLeadForm({
  currentUser,
  targets,
  defaultCompany = '',
  defaultTargetId = '',
}: {
  currentUser: User;
  targets: { id: string; company_name: string; tier: string }[];
  defaultCompany?: string;
  defaultTargetId?: string;
}) {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Resolve company name from target id if only target was passed
  const initialCompany =
    defaultCompany ||
    (defaultTargetId ? targets.find((t) => t.id === defaultTargetId)?.company_name ?? '' : '');

  const [form, setForm] = useState({
    full_name: '',
    company: initialCompany,
    title: '',
    email: '',
    temperature: 'warm' as Temperature,
    next_action: '',
    deadline: '',
    notes: '',
  });
  const [queuedPhoto, setQueuedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!queuedPhoto) { setPhotoPreview(null); return; }
    const url = URL.createObjectURL(queuedPhoto);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [queuedPhoto]);

  async function save() {
    if (!form.full_name.trim() || !form.company.trim()) return;
    setSaving(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const normalizedCompany = form.company.trim();
      const matchedTarget = targets.find(
        (t) => t.company_name.trim().toLowerCase() === normalizedCompany.toLowerCase(),
      );
      const { data, error } = await supabase
        .from('leads')
        .insert({
          full_name: form.full_name.trim(),
          company: normalizedCompany,
          title: form.title.trim() || null,
          email: form.email.trim() || null,
          temperature: form.temperature,
          owner_id: currentUser.id,
          met_by_id: currentUser.id,
          target_id: matchedTarget?.id ?? null,
          next_action: form.next_action.trim() || null,
          deadline: form.deadline || null,
          notes: form.notes.trim() || null,
        })
        .select()
        .single();
      if (error) {
        alert(getErrorMessage(error, 'Failed to save lead.'));
        return;
      }
      if (queuedPhoto) {
        try {
          await uploadAttachment(queuedPhoto, { kind: 'lead', id: data.id }, { note: 'biz card', userId: currentUser.id });
        } catch (e) {
          alert(getErrorMessage(e, 'Lead saved, but photo upload failed.'));
        }
      }
      router.push(`/leads/${data.id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-5 md:py-8">
      <div className="card card-p space-y-3">
        <Field label="Name *">
          <input autoFocus value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full" placeholder="First and last" />
        </Field>

        <Field label="Company *">
          <input
            list="target-companies"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full"
            placeholder="Pick a target or type free-form"
          />
          <datalist id="target-companies">
            {targets.map((t) => <option key={t.id} value={t.company_name} />)}
          </datalist>
        </Field>

        <Field label="Business card">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setQueuedPhoto(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          {!queuedPhoto ? (
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-btn border-2 border-dashed border-hairline text-tag-cold hover:bg-tag-50 hover:border-tag-gold hover:text-tag-900 transition-colors"
            >
              <Camera size={16} /> <span className="text-sm font-medium">Snap business card</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-btn bg-tag-50 border border-hairline">
              {photoPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt="Preview" className="w-14 h-14 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-tag-900 truncate">{queuedPhoto.name}</div>
                <div className="text-[10px] text-tag-cold">Will upload when lead is saved</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQueuedPhoto(null);
                  if (cameraInputRef.current) cameraInputRef.current.value = '';
                }}
                className="text-tag-cold hover:text-red-600 p-1"
                aria-label="Remove photo"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </Field>

        <Field label="Temperature">
          <div className="grid grid-cols-3 gap-2">
            {(['cold', 'warm', 'hot'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, temperature: t })}
                className={`py-2 rounded-btn text-xs font-medium uppercase ${
                  form.temperature === t
                    ? t === 'hot' ? 'bg-red-700 text-white' : t === 'warm' ? 'bg-tag-gold text-white' : 'bg-gray-500 text-white'
                    : 'bg-tag-50 text-tag-cold'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full" placeholder="VP Licensing, Founder, etc." />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full" placeholder="name@company.com" />
          </Field>
        </div>

        <Field label="Next action" action={<VoiceButton value={form.next_action} onChange={(v) => setForm({ ...form, next_action: v })} />}>
          <input value={form.next_action} onChange={(e) => setForm({ ...form, next_action: e.target.value })} className="w-full" placeholder="What you committed to do" />
        </Field>

        <Field label="Deadline">
          <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full" />
        </Field>

        <Field label="Notes" action={<VoiceButton value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />}>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full" placeholder="Free-form — booth context, conversation summary, anything that helps the follow-up" />
        </Field>

        <button
          onClick={save}
          disabled={saving || !form.full_name.trim() || !form.company.trim()}
          className="btn-primary w-full"
        >
          {saving ? (queuedPhoto ? 'Saving + uploading photo…' : 'Saving…') : 'Add Lead'}
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
