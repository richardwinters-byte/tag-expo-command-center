'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { Target, TargetStatus } from '@/lib/types';

const STATUSES: TargetStatus[] = ['not_contacted', 'outreach_sent', 'meeting_booked', 'met', 'follow_up', 'closed_won', 'closed_lost', 'dead'];

export function TargetStatusForm({ target }: { target: Target }) {
  const router = useRouter();
  const [status, setStatus] = useState<TargetStatus>(target.status);
  const [booth, setBooth] = useState(target.booth_number ?? '');
  const [notes, setNotes] = useState(target.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from('targets').update({ status, booth_number: booth || null, notes: notes || null }).eq('id', target.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <section>
      <div className="section-header">Update</div>
      <div className="card card-p space-y-3">
        <div>
          <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider mb-1.5">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as TargetStatus)} className="w-full">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider mb-1.5">Booth #</label>
          <input type="text" value={booth} onChange={(e) => setBooth(e.target.value)} placeholder="e.g. G225" className="w-full font-mono" />
        </div>
        <div>
          <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider mb-1.5">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="w-full" />
        </div>
        <button onClick={save} disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
    </section>
  );
}
