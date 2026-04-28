'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronDown, X, SlidersHorizontal, Search, BadgeCheck } from 'lucide-react';
import { TierBadge, PriorityBadge, StatusPill, trackColor } from '@/components/app/Pills';
import { coverageLabel, trackLabel } from '@/lib/utils';
import type { Target } from '@/lib/types';

const TIER_ORDER = ['tier_1', 'nice_to_meet', 'opportunistic', 'retailer', 'tier_2', 'tier_3'];

const TIER_LABELS: Record<string, string> = {
  tier_1: 'Tier 1 · Must-Meet',
  nice_to_meet: 'Nice-to-Meet',
  opportunistic: 'Opportunistic',
  retailer: 'Retailers',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3',
};
const TIER_SHORT: Record<string, string> = {
  tier_1: 'Tier 1',
  nice_to_meet: 'Nice-to-Meet',
  opportunistic: 'Opportunistic',
  retailer: 'Retailers',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3',
};
const STATUS_LABELS: Record<string, string> = {
  not_contacted: 'Not contacted',
  outreach_sent: 'Outreach sent',
  meeting_booked: 'Meeting booked',
  met: 'Met',
  follow_up: 'Follow-up',
  closed_won: 'Closed won',
  closed_lost: 'Closed lost',
  dead: 'Dead',
};
const STATUS_ORDER = ['not_contacted', 'outreach_sent', 'meeting_booked', 'met', 'follow_up', 'closed_won', 'closed_lost', 'dead'];

type GroupBy = 'tier' | 'track' | 'coverage_unit' | 'status';

const GROUP_BY_LABEL: Record<GroupBy, string> = {
  tier: 'Tier',
  track: 'Track',
  status: 'Status',
  coverage_unit: 'Coverage',
};

export function TargetsClient({ targets }: { targets: Target[] }) {
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('tier');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Options in each dimension (only show values actually present in data)
  const tierOptions = useMemo(() => {
    const present = new Set(targets.map((t) => t.tier));
    return TIER_ORDER.filter((t) => present.has(t as Target['tier']));
  }, [targets]);
  const trackOptions = useMemo(
    () =>
      Array.from(new Set(targets.map((t) => t.track))).sort((a, b) =>
        trackLabel(a).localeCompare(trackLabel(b))
      ),
    [targets]
  );
  const statusOptions = useMemo(() => {
    const present = new Set(targets.map((t) => t.status));
    return STATUS_ORDER.filter((s) => present.has(s as Target['status']));
  }, [targets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return targets.filter((t) => {
      if (tierFilter !== 'all' && t.tier !== tierFilter) return false;
      if (trackFilter !== 'all' && t.track !== trackFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      // "Verified at expo" v1 = has a confirmed booth number on the floor plan.
      // (Future: expand to meeting-table / verified speaker / panelist flags.)
      if (verifiedOnly && !t.booth_number) return false;
      if (q && !t.company_name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [targets, tierFilter, trackFilter, statusFilter, verifiedOnly, search]);

  // Contextual count for a hypothetical filter change (keeps other active filters in play)
  function countWith(dim: 'tier' | 'track' | 'status', value: string): number {
    return targets.filter((t) => {
      if (dim === 'tier' && value !== 'all' && t.tier !== value) return false;
      if (dim === 'track' && value !== 'all' && t.track !== value) return false;
      if (dim === 'status' && value !== 'all' && t.status !== value) return false;
      if (dim !== 'tier' && tierFilter !== 'all' && t.tier !== tierFilter) return false;
      if (dim !== 'track' && trackFilter !== 'all' && t.track !== trackFilter) return false;
      if (dim !== 'status' && statusFilter !== 'all' && t.status !== statusFilter) return false;
      return true;
    }).length;
  }

  const grouped = useMemo(() => {
    const g: Record<string, Target[]> = {};
    for (const t of filtered) {
      const key = (t as unknown as Record<string, string>)[groupBy] ?? 'other';
      (g[key] ||= []).push(t);
    }
    return g;
  }, [filtered, groupBy]);

  const groupKeys = useMemo(
    () =>
      Object.keys(grouped).sort((a, b) => {
        if (groupBy === 'tier') return TIER_ORDER.indexOf(a) - TIER_ORDER.indexOf(b);
        return a.localeCompare(b);
      }),
    [grouped, groupBy]
  );

  const keyLabel = (key: string) => {
    if (groupBy === 'tier') return TIER_LABELS[key] ?? key;
    if (groupBy === 'track') return trackLabel(key);
    if (groupBy === 'coverage_unit') return coverageLabel(key);
    if (groupBy === 'status') return STATUS_LABELS[key] ?? key;
    return key.replace(/_/g, ' ');
  };

  const activeCount =
    [tierFilter, trackFilter, statusFilter].filter((v) => v !== 'all').length +
    (verifiedOnly ? 1 : 0);
  const clearAll = () => {
    setTierFilter('all');
    setTrackFilter('all');
    setStatusFilter('all');
    setVerifiedOnly(false);
    setSearch('');
  };

  const verifiedCount = useMemo(() => targets.filter((t) => !!t.booth_number).length, [targets]);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-5 md:py-8">
      {/* Search + Verified-attendance toggle */}
      <div className="flex flex-col gap-2 mb-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tag-cold" />
          <input
            type="search"
            placeholder="Search targets by company name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9"
          />
        </div>
        <button
          type="button"
          onClick={() => setVerifiedOnly((v) => !v)}
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-btn text-sm font-medium border transition-colors shrink-0 ${
            verifiedOnly
              ? 'bg-tag-900 text-white border-tag-900'
              : 'bg-white border-hairline hover:bg-tag-100'
          }`}
          title="Show only targets with a confirmed booth number on the floor plan"
        >
          <BadgeCheck size={14} />
          Verified at expo
          <span className={`text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] inline-flex items-center justify-center px-1 ${
            verifiedOnly ? 'bg-white/20 text-white' : 'bg-tag-100 text-tag-700'
          }`}>
            {verifiedCount}
          </span>
        </button>
      </div>

      {/* Control row */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-btn border border-hairline bg-white text-sm font-medium hover:bg-tag-100 transition-colors"
        >
          <SlidersHorizontal size={14} />
          Filter
          {activeCount > 0 && (
            <span className="bg-tag-900 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] inline-flex items-center justify-center px-1">
              {activeCount}
            </span>
          )}
          <ChevronDown size={14} className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>

        <div className="relative inline-flex items-center">
          <label className="sr-only" htmlFor="group-by-select">Group by</label>
          <select
            id="group-by-select"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="appearance-none pl-3 pr-7 py-2 rounded-btn border border-hairline bg-white text-sm font-medium hover:bg-tag-100 transition-colors cursor-pointer"
          >
            <option value="tier">Group: Tier</option>
            <option value="track">Group: Track</option>
            <option value="status">Group: Status</option>
            <option value="coverage_unit">Group: Coverage</option>
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2 text-tag-cold" />
        </div>

        <div className="flex-1 text-right text-xs text-tag-cold">
          {filtered.length === targets.length ? (
            <>{targets.length} targets</>
          ) : (
            <>{filtered.length} of {targets.length}</>
          )}
        </div>
      </div>

      {/* Expandable filter panel */}
      {filtersOpen && (
        <div className="card card-p mb-3 space-y-3">
          <FilterSelect
            label="Tier"
            value={tierFilter}
            onChange={setTierFilter}
            options={[
              { value: 'all', label: `All tiers (${countWith('tier', 'all')})`, count: countWith('tier', 'all') },
              ...tierOptions.map((t) => ({
                value: t,
                label: `${TIER_SHORT[t] ?? t} (${countWith('tier', t)})`,
                count: countWith('tier', t),
              })),
            ]}
          />
          <FilterSelect
            label="Track"
            value={trackFilter}
            onChange={setTrackFilter}
            options={[
              { value: 'all', label: `All tracks (${countWith('track', 'all')})`, count: countWith('track', 'all') },
              ...trackOptions.map((t) => ({
                value: t,
                label: `${trackLabel(t)} (${countWith('track', t)})`,
                count: countWith('track', t),
              })),
            ]}
          />
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: `All statuses (${countWith('status', 'all')})`, count: countWith('status', 'all') },
              ...statusOptions.map((s) => ({
                value: s,
                label: `${STATUS_LABELS[s] ?? s} (${countWith('status', s)})`,
                count: countWith('status', s),
              })),
            ]}
          />
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={clearAll}
              disabled={activeCount === 0}
              className="text-xs text-tag-700 underline disabled:text-tag-cold disabled:no-underline disabled:cursor-not-allowed"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="btn-primary btn-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Active filter pills (when collapsed) */}
      {!filtersOpen && activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {tierFilter !== 'all' && (
            <FilterPill label={TIER_SHORT[tierFilter] ?? tierFilter} onRemove={() => setTierFilter('all')} />
          )}
          {trackFilter !== 'all' && (
            <FilterPill
              label={trackLabel(trackFilter)}
              dotColor={trackColor(trackFilter)}
              onRemove={() => setTrackFilter('all')}
            />
          )}
          {statusFilter !== 'all' && (
            <FilterPill label={STATUS_LABELS[statusFilter] ?? statusFilter} onRemove={() => setStatusFilter('all')} />
          )}
          <button
            type="button"
            onClick={clearAll}
            className="text-[11px] text-tag-cold underline hover:text-tag-700 ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Sections with sticky headers */}
      {filtered.length === 0 ? (
        <div className="card card-p text-sm text-tag-cold text-center py-12">
          No targets match those filters.{' '}
          <button onClick={clearAll} className="underline text-tag-700 hover:text-tag-900">
            Clear all
          </button>
          .
        </div>
      ) : (
        groupKeys.map((key) => (
          <section key={key} className="mb-6">
            <h2 className="tgt-sticky-h sticky top-0 z-10 -mx-4 px-4 md:-mx-8 md:px-8 py-2 text-sm font-semibold uppercase tracking-wider text-tag-700 flex items-center gap-2 border-b border-hairline">
              {groupBy === 'tier' && key === 'tier_1' && <span className="h-1.5 w-1.5 rounded-full bg-tag-gold" />}
              {groupBy === 'track' && (
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: trackColor(key) }} />
              )}
              <span>{keyLabel(key)}</span>
              <span className="text-tag-cold font-normal normal-case tracking-normal">({grouped[key].length})</span>
            </h2>
            <div className="grid gap-2 md:grid-cols-2 mt-3">
              {grouped[key].map((t) => (
                <Link
                  key={t.id}
                  href={`/targets/${t.id}`}
                  className="bg-white rounded-xl border border-hairline p-4 block hover:shadow-float hover:-translate-y-0.5 transition-all border-l-4"
                  style={{ borderLeftColor: trackColor(t.track) }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-semibold text-sm leading-tight">{t.company_name}</div>
                    <TierBadge tier={t.tier} />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <PriorityBadge priority={t.priority} />
                    <StatusPill status={t.status} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="inline-flex items-center gap-1 font-medium" style={{ color: trackColor(t.track) }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: trackColor(t.track) }} />
                      {trackLabel(t.track)}
                    </span>
                    <span className="text-tag-cold">· {coverageLabel(t.coverage_unit)}</span>
                  </div>
                  {t.booth_number && (
                    <div className="text-[11px] font-mono text-tag-900 mt-1">Booth {t.booth_number}</div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; count: number }[];
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-tag-cold mb-1">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none pl-3 pr-8 py-2 rounded-btn border border-hairline bg-white text-sm cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.count === 0 && opt.value !== 'all'}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-tag-cold" />
      </div>
    </div>
  );
}

function FilterPill({
  label,
  dotColor,
  onRemove,
}: {
  label: string;
  dotColor?: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-full text-[11px] font-medium bg-tag-100 text-tag-ink hover:bg-tag-200 border border-hairline group"
    >
      {dotColor && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dotColor }} />}
      <span>{label}</span>
      <X size={12} className="text-tag-cold group-hover:text-tag-900" />
    </button>
  );
}
