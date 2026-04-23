'use client';

import { useState, useMemo } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';
import { exportTripReportPdf } from '@/lib/export';
import { fmt } from '@/lib/utils';
import type { TripReportOptions } from '@/components/app/ExportPdfs';

type AnyRow = Record<string, any>;

export function TripReportClient({
  targets, leads, meetings, intel, users, debriefs, attachmentCount,
}: {
  targets: AnyRow[]; leads: AnyRow[]; meetings: AnyRow[]; intel: AnyRow[];
  users: AnyRow[]; debriefs: AnyRow[]; attachmentCount: number;
}) {
  // Export options
  const [includeMeetings, setIncludeMeetings] = useState<TripReportOptions['includeMeetings']>('all');
  const [includeLeads, setIncludeLeads] = useState<TripReportOptions['includeLeads']>('all');
  const [includeIntel, setIncludeIntel] = useState<TripReportOptions['includeIntel']>('all');
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeDebriefs, setIncludeDebriefs] = useState(true);
  const [nextSteps, setNextSteps] = useState('');
  const [exporting, setExporting] = useState(false);

  // Derived stats for preview
  const hotLeads = useMemo(() => leads.filter((l) => l.temperature === 'hot'), [leads]);
  const warmLeads = useMemo(() => leads.filter((l) => l.temperature === 'warm'), [leads]);
  const targetsEngaged = useMemo(() => targets.filter((t) => ['met', 'meeting_booked', 'follow_up', 'closed_won'].includes(t.status)), [targets]);
  const tier1 = useMemo(() => targets.filter((t) => t.tier === 'tier_1'), [targets]);
  const tier1Engaged = useMemo(() => tier1.filter((t) => ['met', 'meeting_booked', 'follow_up', 'closed_won'].includes(t.status)), [tier1]);
  const highIntel = useMemo(() => intel.filter((i) => i.significance === 'high'), [intel]);

  // Per-user meeting counts
  const meetingsByUser = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of meetings) {
      if (m.owner_id) map.set(m.owner_id, (map.get(m.owner_id) ?? 0) + 1);
    }
    return map;
  }, [meetings]);

  // Preview: how many items will be in the PDF
  const pdfMeetingCount = includeMeetings === 'none' ? 0 : includeMeetings === 'tier1' ? meetings.filter((m) => m.target?.tier === 'tier_1').length : meetings.length;
  const pdfLeadCount = includeLeads === 'none' ? 0 : includeLeads === 'hot' ? hotLeads.length : leads.length;
  const pdfIntelCount = includeIntel === 'none' ? 0 : includeIntel === 'high' ? highIntel.length : intel.length;

  async function onExport() {
    setExporting(true);
    try {
      await exportTripReportPdf({
        includeMeetings, includeLeads, includeIntel,
        includePhotos, includeDebriefs,
        nextSteps: nextSteps.trim() || undefined,
      });
    } catch (e) {
      alert('Export failed: ' + (e instanceof Error ? e.message : 'unknown'));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-5 md:py-8 space-y-5">
      {/* Export controls */}
      <div className="card card-p">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-tag-700" />
          <h2 className="text-sm font-semibold">PDF export options</h2>
        </div>
        <div className="space-y-3">
          <ToggleGroup
            label="Meetings"
            value={includeMeetings}
            onChange={(v) => setIncludeMeetings(v as any)}
            options={[
              { value: 'all', label: `All (${meetings.length})` },
              { value: 'tier1', label: `Tier 1 only (${meetings.filter((m) => m.target?.tier === 'tier_1').length})` },
              { value: 'none', label: 'Skip' },
            ]}
          />
          <ToggleGroup
            label="Leads"
            value={includeLeads}
            onChange={(v) => setIncludeLeads(v as any)}
            options={[
              { value: 'all', label: `All (${leads.length})` },
              { value: 'hot', label: `Hot only (${hotLeads.length})` },
              { value: 'none', label: 'Skip' },
            ]}
          />
          <ToggleGroup
            label="Intel"
            value={includeIntel}
            onChange={(v) => setIncludeIntel(v as any)}
            options={[
              { value: 'all', label: `All (${intel.length})` },
              { value: 'high', label: `High-sig only (${highIntel.length})` },
              { value: 'none', label: 'Skip' },
            ]}
          />
          <div className="flex items-center gap-4">
            <Checkbox
              label={`Include photos${attachmentCount > 0 ? ` (${attachmentCount})` : ''}`}
              checked={includePhotos}
              onChange={setIncludePhotos}
              disabled={attachmentCount === 0}
            />
            <Checkbox
              label={`Include debriefs (${debriefs.length})`}
              checked={includeDebriefs}
              onChange={setIncludeDebriefs}
              disabled={debriefs.length === 0}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider mb-1">
              Recommended next steps / 2027 ask (optional)
            </label>
            <textarea
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              rows={3}
              placeholder="e.g. Book 20x20 booth for 2027; apply for speaking slot; hire second growth hire; approve Panini pilot by June 15…"
              className="w-full text-sm"
            />
          </div>
          <button
            onClick={onExport}
            disabled={exporting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {exporting ? 'Generating PDF…' : 'Export Trip Report PDF'}
          </button>
          <div className="text-[11px] text-tag-cold text-center">
            PDF will include: exec summary, hottest leads, Tier 1 coverage table, {pdfMeetingCount} meeting{pdfMeetingCount !== 1 ? 's' : ''}, {pdfLeadCount} lead{pdfLeadCount !== 1 ? 's' : ''}, {pdfIntelCount} intel item{pdfIntelCount !== 1 ? 's' : ''}{includePhotos && attachmentCount > 0 ? `, ${attachmentCount} photo${attachmentCount !== 1 ? 's' : ''}` : ''}{includeDebriefs && debriefs.length > 0 ? `, ${debriefs.length} debrief${debriefs.length !== 1 ? 's' : ''}` : ''}.
          </div>
        </div>
      </div>

      {/* Live exec summary preview */}
      <article className="card card-p">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider text-tag-gold-dark font-semibold">TAG Grading · Confidential</div>
          <h1 className="text-2xl font-semibold mt-1">Licensing Expo 2026 — Trip Report</h1>
          <div className="text-sm text-tag-cold mt-1">May 19–21, 2026 · Mandalay Bay, Las Vegas</div>
          <div className="text-[11px] text-tag-cold font-mono mt-1">Live preview · PDF generates current data on export</div>
        </div>

        <section className="mb-6">
          <h2 className="text-sm uppercase tracking-wider font-semibold text-tag-700 mb-3">Executive summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Targets engaged" value={targetsEngaged.length} sub={`${tier1Engaged.length} Tier 1 of ${tier1.length}`} />
            <Stat label="Leads captured" value={leads.length} sub={`${hotLeads.length} hot · ${warmLeads.length} warm`} />
            <Stat label="Meetings held" value={meetings.length} />
            <Stat label="High-sig intel" value={highIntel.length} />
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-sm uppercase tracking-wider font-semibold text-tag-700 mb-3">Hottest leads</h2>
          {hotLeads.length === 0 ? (
            <p className="text-sm text-tag-cold">No hot leads logged yet.</p>
          ) : (
            <ul className="space-y-2">
              {hotLeads.slice(0, 10).map((l) => (
                <li key={l.id} className="text-sm border-l-2 border-tag-gold pl-3">
                  <div className="font-medium">{l.full_name} · {l.company}</div>
                  <div className="text-xs text-tag-cold">{l.title ?? ''} · owner {l.owner?.name ?? 'unassigned'}</div>
                  {l.next_action && <div className="text-xs mt-1">Next: {l.next_action}{l.deadline ? ` (by ${l.deadline})` : ''}</div>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-6">
          <h2 className="text-sm uppercase tracking-wider font-semibold text-tag-700 mb-3">Tier 1 coverage</h2>
          <ul className="text-sm space-y-1">
            {tier1.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 py-1 border-b border-hairline last:border-0">
                <span>{t.company_name}</span>
                <span className="text-xs text-tag-cold capitalize">{t.status.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-sm uppercase tracking-wider font-semibold text-tag-700 mb-3">High-significance intel</h2>
          {highIntel.length === 0 ? (
            <p className="text-sm text-tag-cold">None logged.</p>
          ) : (
            <ul className="space-y-2">
              {highIntel.map((i) => (
                <li key={i.id} className="text-sm">
                  <span className="font-mono text-[10px] uppercase text-tag-gold-dark mr-2">
                    {i.target?.company_name ?? i.tag ?? i.subject ?? 'general'}
                  </span>
                  <span className="font-medium">{i.headline}</span>
                  {i.details && <div className="text-xs text-tag-cold mt-0.5 ml-1">{i.details}</div>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wider font-semibold text-tag-700 mb-3">Per-person meeting load</h2>
          <ul className="text-sm space-y-1">
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-1 border-b border-hairline last:border-0">
                <span>{u.name}</span>
                <span className="font-mono text-sm">{meetingsByUser.get(u.id) ?? 0} meeting{meetingsByUser.get(u.id) === 1 ? '' : 's'}</span>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="card card-p !p-3">
      <div className="text-[10px] uppercase tracking-wider text-tag-cold">{label}</div>
      <div className="text-2xl font-semibold font-mono mt-0.5">{value}</div>
      {sub && <div className="text-[11px] text-tag-cold mt-0.5">{sub}</div>}
    </div>
  );
}

function ToggleGroup({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <div className="text-xs font-medium text-tag-700 uppercase tracking-wider mb-1.5">{label}</div>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`py-2 rounded-btn text-xs font-medium transition ${
              value === o.value ? 'bg-tag-900 text-white' : 'bg-tag-50 text-tag-cold hover:bg-tag-100'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Checkbox({
  label, checked, onChange, disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-center gap-2 text-sm ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        checked={checked && !disabled}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded border-hairline"
      />
      <span>{label}</span>
    </label>
  );
}
