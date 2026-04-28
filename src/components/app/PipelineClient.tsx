'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  TrendingUp, AlertCircle, Snowflake, Flame, Clock,
  Target as TargetIcon, DollarSign, Activity, CheckCircle2,
  X as XIcon, Filter, Flame as FlameIcon, ThermometerSnowflake, ThermometerSun,
  Undo2,
} from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { FlashingNumber } from './AnimatedNumber';
import { CelebrationOverlay, type Celebration } from './CelebrationOverlay';
import type { Lead, User, Tier, Track, FollowUpStage, Temperature } from '@/lib/types';

export type LeadFull = Lead & {
  target: { company_name: string; tier: Tier; track: Track } | null;
  owner?: { name: string; color: string } | null;
};

type TargetLite = { id: string; company_name: string; tier: Tier; track: Track };

const PILOT_ECON = { min: 100_000, max: 250_000 };
const ENTERPRISE_ECON = { min: 500_000, max: 1_500_000 };
const RETAIL_ECON = { min: 1_000_000, max: 3_000_000 };

const STAGE_ORDER: FollowUpStage[] = ['not_started', 't1_immediate_thanks', 't2_value_add', 't3_proposal'];
const STAGE_LABEL: Record<FollowUpStage, string> = {
  not_started: 'Captured',
  t1_immediate_thanks: 'T1 · Thanks',
  t2_value_add: 'T2 · Value add',
  t3_proposal: 'T3 · Proposal',
};
const STAGE_COLOR: Record<FollowUpStage, string> = {
  not_started: '#8B97A0',
  t1_immediate_thanks: '#14595B',
  t2_value_add: '#C08A30',
  t3_proposal: '#0B2F31',
};

type DrillDown = { title: string; leads: LeadFull[] } | null;

export function PipelineClient({
  initialLeads,
  targets,
  users,
}: {
  initialLeads: LeadFull[];
  targets: TargetLite[];
  users: User[];
}) {
  const router = useRouter();
  const [leads, setLeads] = useState<LeadFull[]>(initialLeads);
  const [now, setNow] = useState(() => Date.now());

  // ---- FILTER STATE ----
  const [ownerFilter, setOwnerFilter] = useState<string | 'all'>('all');
  const [trackFilter, setTrackFilter] = useState<Track | 'all'>('all');
  const [tempFilter, setTempFilter] = useState<Temperature | 'all'>('all');

  // ---- DRILL-DOWN ----
  const [drill, setDrill] = useState<DrillDown>(null);

  // ---- DRAG-DROP ----
  const [dragLeadId, setDragLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<FollowUpStage | null>(null);

  // ---- TOAST (drop confirmation + undo) ----
  const [toast, setToast] = useState<{
    id: number;
    title: string;
    previousStage: FollowUpStage;
    newStage: FollowUpStage;
    leadId: string;
  } | null>(null);

  // ---- CELEBRATION ----
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [celebratedGoals, setCelebratedGoals] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;

  // Apply filters
  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (ownerFilter !== 'all' && l.owner_id !== ownerFilter) return false;
      if (trackFilter !== 'all' && (l.target?.track ?? 'new_surfaced') !== trackFilter) return false;
      if (tempFilter !== 'all' && l.temperature !== tempFilter) return false;
      return true;
    });
  }, [leads, ownerFilter, trackFilter, tempFilter]);

  const filtersActive = ownerFilter !== 'all' || trackFilter !== 'all' || tempFilter !== 'all';

  // Stats (derived from FILTERED view)
  const hotLeads = filtered.filter((l) => l.temperature === 'hot');
  const coolingHotLeads = hotLeads.filter((l) => {
    const last = new Date(l.updated_at).getTime();
    return now - last > 48 * HOUR && (l.follow_up_stage === 'not_started' || l.follow_up_stage === 't1_immediate_thanks');
  });

  const stageCounts = {
    not_started: filtered.filter((l) => l.follow_up_stage === 'not_started').length,
    t1_immediate_thanks: filtered.filter((l) => l.follow_up_stage === 't1_immediate_thanks').length,
    t2_value_add: filtered.filter((l) => l.follow_up_stage === 't2_value_add').length,
    t3_proposal: filtered.filter((l) => l.follow_up_stage === 't3_proposal').length,
  };
  const totalLeads = filtered.length;
  const advanced = stageCounts.t2_value_add + stageCounts.t3_proposal;
  const conversionRate = totalLeads === 0 ? 0 : Math.round((advanced / totalLeads) * 100);

  // Goal progress (unfiltered — goals shouldn't change based on filter toggles)
  const pilotsReached = leads.filter((l) => l.follow_up_stage === 't3_proposal' && l.target?.tier === 'tier_1').length;
  const pilotLeads = leads.filter((l) => l.follow_up_stage === 't3_proposal' && l.target?.tier === 'tier_1');
  const enterpriseReached = leads.filter((l) => l.follow_up_stage === 't3_proposal' && l.target?.track === 'agent').length;
  const enterpriseLeads = leads.filter((l) => l.follow_up_stage === 't3_proposal' && l.target?.track === 'agent');
  const retailReached = leads.filter((l) => l.follow_up_stage === 't3_proposal' && l.target?.tier === 'retailer').length;
  const retailLeads = leads.filter((l) => l.follow_up_stage === 't3_proposal' && l.target?.tier === 'retailer');
  const qualified = leads.length;

  // Detect goal-met transitions → fire celebration
  useEffect(() => {
    const checks: { key: string; threshold: number; actual: number; title: string; subtitle: string }[] = [
      { key: 'pilots', threshold: 1, actual: pilotsReached, title: 'FIRST PILOT CLOSED', subtitle: 'Tier 1 target reached T3 · Proposal' },
      { key: 'pilots_max', threshold: 2, actual: pilotsReached, title: 'SECOND PILOT CLOSED', subtitle: 'Top pilot goal reached · 1–2 target' },
      { key: 'enterprise', threshold: 1, actual: enterpriseReached, title: 'ENTERPRISE TERM-SHEET', subtitle: 'Agent track reached T3 · $500K–$1.5M' },
      { key: 'retail', threshold: 1, actual: retailReached, title: 'RETAIL LOI', subtitle: 'Retailer reached T3 · $1M+ multi-year' },
      { key: 'qualified_min', threshold: 25, actual: qualified, title: '25 QUALIFIED LEADS', subtitle: 'Trip ROI cover achieved' },
      { key: 'qualified_max', threshold: 40, actual: qualified, title: '40 QUALIFIED LEADS', subtitle: 'Top of qualified range hit' },
    ];
    for (const g of checks) {
      if (g.actual >= g.threshold && !celebratedGoals.has(g.key)) {
        setCelebratedGoals((prev) => new Set(prev).add(g.key));
        setCelebration({ key: g.key + ':' + Date.now(), title: g.title, subtitle: g.subtitle });
        break; // one at a time — most significant first
      }
    }
  }, [pilotsReached, enterpriseReached, retailReached, qualified]); // eslint-disable-line react-hooks/exhaustive-deps

  const leadTargetIds = new Set(leads.filter((l) => l.target_id).map((l) => l.target_id));
  const tier12Targets = targets.filter((t) => t.tier === 'tier_1' || t.tier === 'tier_2');
  const uncoveredTargets = tier12Targets.filter((t) => !leadTargetIds.has(t.id));

  // Daily velocity (over last 7 days, based on FILTERED view)
  const dayBuckets: { date: string; label: string; count: number; hot: number; leads: LeadFull[] }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now - i * DAY);
    const iso = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayLeads = filtered.filter((l) => l.created_at.slice(0, 10) === iso);
    dayBuckets.push({
      date: iso,
      label,
      count: dayLeads.length,
      hot: dayLeads.filter((l) => l.temperature === 'hot').length,
      leads: dayLeads,
    });
  }
  const maxDaily = Math.max(1, ...dayBuckets.map((d) => d.count));

  // Tracks (based on FILTERED view)
  const trackStats = new Map<Track, { total: number; advanced: number; hot: number; leads: LeadFull[] }>();
  for (const l of filtered) {
    const t = (l.target?.track ?? 'new_surfaced') as Track;
    if (!trackStats.has(t)) trackStats.set(t, { total: 0, advanced: 0, hot: 0, leads: [] });
    const s = trackStats.get(t)!;
    s.total++;
    s.leads.push(l);
    if (l.follow_up_stage === 't2_value_add' || l.follow_up_stage === 't3_proposal') s.advanced++;
    if (l.temperature === 'hot') s.hot++;
  }
  const sortedTracks = Array.from(trackStats.entries())
    .map(([track, s]) => ({ track, ...s, pct: s.total === 0 ? 0 : Math.round((s.advanced / s.total) * 100) }))
    .sort((a, b) => b.total - a.total);

  const recentlyAdvanced = filtered
    .filter((l) => l.follow_up_stage !== 'not_started' && now - new Date(l.updated_at).getTime() < DAY)
    .slice(0, 5);

  // Pipeline value (unfiltered — projections are macro)
  const projLow = pilotsReached * PILOT_ECON.min + enterpriseReached * ENTERPRISE_ECON.min + retailReached * RETAIL_ECON.min;
  const projHigh = pilotsReached * PILOT_ECON.max + enterpriseReached * ENTERPRISE_ECON.max + retailReached * RETAIL_ECON.max;

  const fmtK = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
    return `$${n}`;
  };

  // ---- DRAG HANDLERS ----
  async function moveLead(leadId: string, newStage: FollowUpStage, opts?: { silent?: boolean; previousStageOverride?: FollowUpStage }) {
    const current = leads.find((l) => l.id === leadId);
    if (!current || current.follow_up_stage === newStage) return;
    const previousStage = opts?.previousStageOverride ?? (current.follow_up_stage as FollowUpStage);

    // Optimistic
    setLeads((prev) => prev.map((l) =>
      l.id === leadId ? { ...l, follow_up_stage: newStage, updated_at: new Date().toISOString() } : l
    ));

    if (!opts?.silent) {
      setToast({
        id: Date.now(),
        title: `${current.full_name} · ${current.company} → ${STAGE_LABEL[newStage]}`,
        previousStage,
        newStage,
        leadId,
      });
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from('leads')
      .update({ follow_up_stage: newStage, updated_at: new Date().toISOString() })
      .eq('id', leadId);
    if (error) {
      setLeads((prev) => prev.map((l) =>
        l.id === leadId ? { ...l, follow_up_stage: previousStage } : l
      ));
      setToast(null);
      alert('Update failed: ' + error.message);
    } else {
      router.refresh();
    }
  }

  function undoLastMove() {
    if (!toast) return;
    moveLead(toast.leadId, toast.previousStage, { silent: true, previousStageOverride: toast.newStage });
    setToast(null);
  }

  // Auto-dismiss toast after 5s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const owners = users; // for filter chip

  return (
    <>
      <CelebrationOverlay celebration={celebration} onDismiss={() => setCelebration(null)} />

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-5 md:py-8 space-y-6">
        {/* FILTER CHIPS */}
        <div className="flex items-center gap-2 flex-wrap sticky top-0 z-10 bg-tag-50/95 dark:bg-[#0A1415]/95 -mx-4 md:mx-0 px-4 md:px-0 py-2 backdrop-blur-sm">
          <Filter size={13} className="text-tag-cold shrink-0" />
          <FilterChip
            label={ownerFilter === 'all' ? 'All owners' : owners.find((u) => u.id === ownerFilter)?.name.split(' ')[0] ?? 'Owner'}
            active={ownerFilter !== 'all'}
            onClick={() => {
              const opts: (string | 'all')[] = ['all', ...owners.map((u) => u.id)];
              const i = opts.indexOf(ownerFilter);
              setOwnerFilter(opts[(i + 1) % opts.length]);
            }}
          />
          <FilterChip
            label={trackFilter === 'all' ? 'All tracks' : trackFilter.replace(/_/g, ' ')}
            active={trackFilter !== 'all'}
            onClick={() => {
              const tracksSet = new Set<Track>();
              for (const l of leads) if (l.target?.track) tracksSet.add(l.target.track);
              const opts: (Track | 'all')[] = ['all', ...Array.from(tracksSet)];
              const i = opts.indexOf(trackFilter);
              setTrackFilter(opts[(i + 1) % opts.length]);
            }}
          />
          <FilterChip
            label={tempFilter === 'all' ? 'All temps' : tempFilter}
            active={tempFilter !== 'all'}
            icon={tempFilter === 'hot' ? FlameIcon : tempFilter === 'cold' ? ThermometerSnowflake : tempFilter === 'warm' ? ThermometerSun : undefined}
            onClick={() => {
              const opts: (Temperature | 'all')[] = ['all', 'hot', 'warm', 'cold'];
              const i = opts.indexOf(tempFilter);
              setTempFilter(opts[(i + 1) % opts.length]);
            }}
          />
          {filtersActive && (
            <button
              onClick={() => { setOwnerFilter('all'); setTrackFilter('all'); setTempFilter('all'); }}
              className="text-[11px] text-tag-cold hover:text-tag-ink underline"
            >
              Clear
            </button>
          )}
          <div className="ml-auto text-[11px] text-tag-cold font-mono">
            {filtered.length} / {leads.length} leads
          </div>
        </div>

        {/* SECTION 1: Goal framework */}
        <section>
          <div className="section-header flex items-center gap-2">
            <CheckCircle2 size={12} className="text-tag-700" />
            Success framework · Target Brief §13
          </div>
          <div className="card card-p">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GoalTile
                label="Pilot deals closed"
                goal="1-2"
                actual={pilotsReached}
                target={2}
                detail="Tier 1 at T3 · $100K-$250K each"
                onDrill={() => setDrill({ title: 'Pilots closed — Tier 1 at T3', leads: pilotLeads })}
              />
              <GoalTile
                label="Enterprise term-sheet"
                goal="1"
                actual={enterpriseReached}
                target={1}
                detail="Agent track · $500K-$1.5M annual"
                onDrill={() => setDrill({ title: 'Enterprise term-sheets', leads: enterpriseLeads })}
              />
              <GoalTile
                label="Retail LOI"
                goal="1"
                actual={retailReached}
                target={1}
                detail="Retailer track · $1M+ multi-year"
                onDrill={() => setDrill({ title: 'Retail LOIs', leads: retailLeads })}
              />
              <GoalTile
                label="Qualified top-of-funnel"
                goal="25-40"
                actual={qualified}
                target={40}
                detail="Trip ROI cover"
                onDrill={() => setDrill({ title: 'All qualified leads', leads })}
              />
            </div>
          </div>
        </section>

        {/* SECTION 1.5: Visual charts (funnel + stage distribution + track donut) */}
        <section>
          <div className="section-header">Pipeline charts</div>
          <div className="grid gap-3 md:grid-cols-2">
            <FunnelChart
              steps={[
                { label: 'Tier 1+2 targets', value: tier12Targets.length, color: '#0B2F31' },
                { label: 'Captured leads', value: totalLeads, color: '#14595B' },
                { label: 'Reached T2+', value: advanced, color: '#0F7B4A' },
                { label: 'Hot leads', value: hotLeads.length, color: '#C08A30' },
                { label: 'Pilot closed', value: pilotsReached, color: '#E8B95B' },
              ]}
            />
            <StageBarChart
              counts={stageCounts}
              total={totalLeads}
            />
          </div>
          {sortedTracks.length > 0 && (
            <div className="mt-3">
              <TrackDonut
                tracks={sortedTracks.map((t) => ({ track: t.track, total: t.total, hot: t.hot }))}
                onSelect={(track) => setTrackFilter(trackFilter === track ? 'all' : track)}
                activeTrack={trackFilter === 'all' ? null : (trackFilter as Track)}
              />
            </div>
          )}
        </section>

        {/* SECTION 2: Headline stats */}
        <section>
          <div className="section-header">Current state{filtersActive && ' · filtered'}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Leads captured"
              value={totalLeads}
              sub={`${hotLeads.length} hot`}
              icon={Flame}
              tone="gold"
              onClick={() => setDrill({ title: 'Captured leads', leads: filtered })}
            />
            <StatCard
              label="Reached T2+"
              value={advanced}
              sub={`${conversionRate}% conversion`}
              icon={TrendingUp}
              tone="teal"
              onClick={() => setDrill({ title: 'Leads at T2+', leads: filtered.filter((l) => l.follow_up_stage === 't2_value_add' || l.follow_up_stage === 't3_proposal') })}
            />
            <StatCard
              label="Cooling hot leads"
              value={coolingHotLeads.length}
              sub="48h+ since contact"
              icon={Snowflake}
              tone={coolingHotLeads.length > 0 ? 'error' : 'calm'}
              onClick={coolingHotLeads.length > 0 ? () => setDrill({ title: 'Cooling hot leads', leads: coolingHotLeads }) : undefined}
            />
            <StatCard
              label="Tier 1/2 uncovered"
              value={uncoveredTargets.length}
              sub={`of ${tier12Targets.length} targets`}
              icon={TargetIcon}
              tone={uncoveredTargets.length > 0 ? 'gold' : 'calm'}
            />
          </div>
        </section>

        {/* SECTION 3: Pipeline value projection */}
        {(pilotsReached > 0 || enterpriseReached > 0 || retailReached > 0) && (
          <section>
            <div className="section-header flex items-center gap-2">
              <DollarSign size={12} className="text-tag-gold-dark" />
              Pipeline value projection
            </div>
            <div className="card card-p">
              <div className="flex items-baseline gap-3 flex-wrap">
                <div className="text-3xl font-bold text-tag-900">{fmtK(projLow)}–{fmtK(projHigh)}</div>
                <div className="text-[11px] text-tag-cold">illustrative · Year 1</div>
              </div>
              <div className="text-[12px] text-tag-cold mt-2 space-y-1">
                {pilotsReached > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-tag-gold" />
                    {pilotsReached} pilot{pilotsReached > 1 ? 's' : ''} · {fmtK(pilotsReached * PILOT_ECON.min)}–{fmtK(pilotsReached * PILOT_ECON.max)}
                  </div>
                )}
                {enterpriseReached > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-tag-700" />
                    {enterpriseReached} enterprise · {fmtK(enterpriseReached * ENTERPRISE_ECON.min)}–{fmtK(enterpriseReached * ENTERPRISE_ECON.max)}
                  </div>
                )}
                {retailReached > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-tag-900" />
                    {retailReached} retail · {fmtK(retailReached * RETAIL_ECON.min)}–{fmtK(retailReached * RETAIL_ECON.max)}
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-hairline text-[10px] text-tag-cold leading-relaxed">
                Based on Target Brief §13 illustrative ranges · Pilot $100K-$250K · Enterprise $500K-$1.5M · Retail $1M+
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: Funnel Kanban (drag-drop) */}
        <section>
          <div className="section-header flex items-center gap-2">
            <Activity size={12} />
            Follow-up funnel · drag between stages
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {STAGE_ORDER.map((stage) => {
              const stageLeads = filtered.filter((l) => l.follow_up_stage === stage);
              const isDropTarget = dragOverStage === stage;
              return (
                <div
                  key={stage}
                  onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage); }}
                  onDragLeave={() => setDragOverStage(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragLeadId) moveLead(dragLeadId, stage);
                    setDragLeadId(null);
                    setDragOverStage(null);
                  }}
                  className={`rounded-xl border-2 min-h-[180px] p-2 transition-all ${
                    isDropTarget ? 'border-dashed scale-[1.02]' : 'border-solid'
                  }`}
                  style={{
                    borderColor: isDropTarget ? STAGE_COLOR[stage] : 'rgba(11,47,49,0.08)',
                    backgroundColor: isDropTarget ? STAGE_COLOR[stage] + '11' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  <div className="flex items-baseline justify-between mb-2 px-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: STAGE_COLOR[stage] }}>
                      {STAGE_LABEL[stage]}
                    </div>
                    <span className="text-[10px] font-mono text-tag-cold"><FlashingNumber value={stageLeads.length} /></span>
                  </div>
                  <div className="space-y-1.5">
                    {stageLeads.slice(0, 8).map((l) => (
                      <div
                        key={l.id}
                        draggable
                        onDragStart={() => setDragLeadId(l.id)}
                        onDragEnd={() => { setDragLeadId(null); setDragOverStage(null); }}
                        className={`text-[11px] bg-white dark:bg-[#132022] rounded-btn px-2 py-1.5 border border-hairline cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                          dragLeadId === l.id ? 'opacity-40' : ''
                        }`}
                      >
                        <div className="font-medium truncate leading-tight">{l.full_name}</div>
                        <div className="text-tag-cold truncate text-[10px]">{l.company}</div>
                        {l.temperature === 'hot' && (
                          <Flame size={9} className="inline mr-1 mt-0.5" style={{ color: '#C08A30' }} />
                        )}
                      </div>
                    ))}
                    {stageLeads.length > 8 && (
                      <button
                        onClick={() => setDrill({ title: STAGE_LABEL[stage], leads: stageLeads })}
                        className="text-[10px] text-tag-cold hover:text-tag-ink w-full text-center pt-1"
                      >
                        + {stageLeads.length - 8} more
                      </button>
                    )}
                    {stageLeads.length === 0 && (
                      <div className="text-[10px] text-tag-cold/60 italic text-center py-4">
                        drop here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] text-tag-cold mt-1 pl-1">
            Drag lead cards between stages to advance. Changes save immediately.
          </div>
        </section>

        {/* SECTION 5: Daily velocity */}
        {totalLeads > 0 && (
          <section>
            <div className="section-header flex items-center gap-2">
              <Activity size={12} />
              Daily capture velocity · last 7 days
            </div>
            <div className="card card-p">
              <div className="flex items-end gap-1.5 h-28 pt-1">
                {dayBuckets.map((d) => (
                  <button
                    key={d.date}
                    onClick={d.count > 0 ? () => setDrill({ title: `Leads captured ${d.label}`, leads: d.leads }) : undefined}
                    disabled={d.count === 0}
                    className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0 group disabled:cursor-default"
                    style={{ height: '100%' }}
                  >
                    <div className="w-full relative transition-all group-hover:opacity-80" style={{ height: `${(d.count / maxDaily) * 80}px`, minHeight: d.count === 0 ? 0 : 4 }}>
                      {d.hot > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 rounded-t" style={{ backgroundColor: '#C08A30', height: `${(d.hot / d.count) * 100}%` }} />
                      )}
                      {d.count > d.hot && (
                        <div className="absolute left-0 right-0 rounded-t" style={{ backgroundColor: '#14595B', bottom: `${(d.hot / d.count) * 100}%`, height: `${((d.count - d.hot) / d.count) * 100}%` }} />
                      )}
                    </div>
                    <div className="text-[9px] font-mono text-tag-cold">{d.count || ''}</div>
                    <div className="text-[9px] text-tag-cold truncate w-full text-center">{d.label.split(' ')[1]}</div>
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-hairline flex items-center gap-3 text-[10px] text-tag-cold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-tag-gold" /> Hot</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-tag-700" /> Warm / Cold</span>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 6: Conversion by track — click filters */}
        {sortedTracks.length > 0 && (
          <section>
            <div className="section-header">Conversion by track · tap to filter</div>
            <div className="card divide-y divide-hairline">
              {sortedTracks.map(({ track, total, advanced, hot, pct }) => (
                <button
                  key={track}
                  onClick={() => setTrackFilter(trackFilter === track ? 'all' : track)}
                  className={`w-full p-3 flex items-center gap-3 transition-colors text-left ${
                    trackFilter === track ? 'bg-tag-gold/10' : 'hover:bg-tag-50 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-tag-ink capitalize">{track.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-tag-cold">{total} lead{total === 1 ? '' : 's'} · {hot} hot · {advanced} at T2+</div>
                  </div>
                  <div className="w-24 h-1.5 rounded-full bg-tag-50 dark:bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-tag-gold transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs font-mono font-semibold text-tag-ink w-9 text-right">{pct}%</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 7: Recently advanced */}
        {recentlyAdvanced.length > 0 && (
          <section>
            <div className="section-header flex items-center gap-2">
              <TrendingUp size={12} className="text-tag-success" />
              Recent momentum · last 24h
            </div>
            <div className="card divide-y divide-hairline">
              {recentlyAdvanced.map((l) => (
                <Link
                  key={l.id}
                  href={`/leads/${l.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-tag-50 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-tag-success/20 text-tag-success">
                    <TrendingUp size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{l.full_name} · {l.company}</div>
                    <div className="text-[11px] text-tag-cold capitalize">Advanced to {l.follow_up_stage.replace(/_/g, ' ')}</div>
                  </div>
                  {l.owner && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: l.owner.color, color: '#FFFFFF' }}>
                      {l.owner.name.split(' ')[0]}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 8: Cooling hot leads (in drill-down) */}
        {coolingHotLeads.length > 0 && (
          <section>
            <div className="section-header flex items-center gap-2">
              <AlertCircle size={12} className="text-tag-error" />
              Hot leads at risk
            </div>
            <div className="card divide-y divide-hairline">
              {coolingHotLeads.slice(0, 10).map((l) => {
                const hoursSince = Math.round((now - new Date(l.updated_at).getTime()) / HOUR);
                return (
                  <Link key={l.id} href={`/leads/${l.id}`} className="flex items-center gap-3 p-3 hover:bg-tag-50 dark:hover:bg-white/5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#8B2A1F', color: '#FFFFFF' }}>
                      <Snowflake size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{l.full_name} · {l.company}</div>
                      <div className="text-[11px] text-tag-cold flex items-center gap-1">
                        <Clock size={10} /> {hoursSince}h since last touch · {(l.follow_up_stage ?? 'not_started').replace(/_/g, ' ')}
                      </div>
                    </div>
                    {l.owner && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: l.owner.color, color: '#FFFFFF' }}>
                        {l.owner.name.split(' ')[0]}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 9: Coverage gap */}
        {uncoveredTargets.length > 0 && (
          <section>
            <div className="section-header">Coverage gap · Tier 1/2 targets without leads</div>
            <div className="card p-3">
              <div className="flex flex-wrap gap-1.5">
                {uncoveredTargets.map((t) => (
                  <Link
                    key={t.id}
                    href={`/targets/${t.id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-tag-50 hover:bg-tag-100 border border-hairline transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: t.tier === 'tier_1' ? '#C08A30' : '#14595B' }} />
                    {t.company_name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* DRILL-DOWN SHEET */}
      {drill && (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-end md:items-center md:justify-center p-0 md:p-4"
          onClick={() => setDrill(null)}
        >
          <div
            className="bg-white dark:bg-[#132022] rounded-t-2xl md:rounded-xl w-full md:max-w-lg max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-hairline flex items-center gap-2">
              <div className="flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-tag-gold-dark">Drill down</div>
                <div className="text-sm font-semibold leading-tight">{drill.title}</div>
                <div className="text-[11px] text-tag-cold">{drill.leads.length} lead{drill.leads.length === 1 ? '' : 's'}</div>
              </div>
              <button onClick={() => setDrill(null)} aria-label="Close" className="p-1 rounded-btn hover:bg-tag-50 dark:hover:bg-white/5">
                <XIcon size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-hairline">
              {drill.leads.length === 0 ? (
                <div className="text-center text-xs text-tag-cold py-8">No leads in this cut.</div>
              ) : drill.leads.map((l) => (
                <Link
                  key={l.id}
                  href={`/leads/${l.id}`}
                  onClick={() => setDrill(null)}
                  className="flex items-center gap-3 p-3 hover:bg-tag-50 dark:hover:bg-white/5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{l.full_name}</div>
                    <div className="text-[11px] text-tag-cold truncate">{l.company}{l.title ? ' · ' + l.title : ''}</div>
                    <div className="text-[10px] text-tag-cold capitalize mt-0.5">{(l.follow_up_stage ?? 'not_started').replace(/_/g, ' ')}</div>
                  </div>
                  {l.temperature === 'hot' && <Flame size={14} className="text-tag-gold shrink-0" />}
                  {l.owner && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: l.owner.color, color: '#FFFFFF' }}>
                      {l.owner.name.split(' ')[0]}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOAST — drop confirmation + undo */}
      {toast && (
        <div
          key={toast.id}
          className="fixed left-1/2 -translate-x-1/2 z-40 px-4 max-w-lg w-full"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)' }}
        >
          <div className="bg-tag-900 text-white rounded-lg shadow-xl flex items-center gap-3 px-3 py-2.5 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <CheckCircle2 size={16} className="text-tag-success shrink-0" />
            <div className="flex-1 min-w-0 text-[12px] leading-tight truncate">{toast.title}</div>
            <button
              onClick={undoLastMove}
              className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-tag-gold hover:text-white transition-colors px-2 py-1 rounded-btn hover:bg-white/10"
            >
              <Undo2 size={12} /> Undo
            </button>
            <button
              onClick={() => setToast(null)}
              aria-label="Dismiss"
              className="shrink-0 p-0.5 rounded-btn hover:bg-white/10 text-white/60 hover:text-white"
            >
              <XIcon size={13} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function FilterChip({ label, active, onClick, icon: Icon }: {
  label: string; active: boolean; onClick: () => void;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors capitalize ${
        active
          ? 'bg-tag-900 text-white'
          : 'bg-white border border-hairline text-tag-ink hover:bg-tag-50 dark:bg-white/5 dark:hover:bg-white/10'
      }`}
    >
      {Icon && <Icon size={11} />}
      {label}
    </button>
  );
}

function GoalTile({ label, goal, actual, target, detail, onDrill }: {
  label: string; goal: string; actual: number; target: number; detail: string; onDrill?: () => void;
}) {
  const pct = target === 0 ? 0 : Math.min(100, Math.round((actual / target) * 100));
  const met = actual >= target;
  const some = actual > 0 && !met;
  const [glowing, setGlowing] = useState(false);
  const wasMetRef = useRef(met);

  // Flash the glow ring on the rising edge (not met → met), but keep the green styling sticky after
  useEffect(() => {
    if (met && !wasMetRef.current) {
      setGlowing(true);
      const t = setTimeout(() => setGlowing(false), 2400);
      wasMetRef.current = true;
      return () => clearTimeout(t);
    }
    if (!met) wasMetRef.current = false;
  }, [met]);

  const border = met ? '2px solid #0F7B4A' : '2px solid transparent';

  return (
    <button
      onClick={onDrill}
      disabled={!onDrill || actual === 0}
      className={`text-left w-full rounded-lg p-3 -m-1 transition-all relative ${onDrill && actual > 0 ? 'hover:bg-tag-50 dark:hover:bg-white/5 cursor-pointer' : 'cursor-default'}`}
      style={{
        border,
        backgroundColor: met ? 'rgba(15,123,74,0.06)' : 'transparent',
        boxShadow: glowing ? '0 0 0 2px #C08A30, 0 0 24px rgba(192,138,48,0.4)' : 'none',
      }}
    >
      {met && (
        <span
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-tag-success text-white flex items-center justify-center shadow-md"
          aria-label="Goal reached"
        >
          <CheckCircle2 size={12} strokeWidth={2.5} />
        </span>
      )}
      <div className="text-[10px] font-semibold uppercase tracking-wider text-tag-cold mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-bold ${met ? 'text-tag-success' : some ? 'text-tag-gold-dark' : 'text-tag-ink'}`}>
          <FlashingNumber value={actual} />
        </span>
        <span className="text-[11px] text-tag-cold">/ goal {goal}</span>
      </div>
      <div className="h-1.5 rounded-full bg-tag-50 dark:bg-white/5 overflow-hidden mt-1.5">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            backgroundColor: met ? '#0F7B4A' : some ? '#C08A30' : '#8B97A0',
          }}
        />
      </div>
      <div className="text-[10px] text-tag-cold mt-1 leading-tight">{detail}</div>
    </button>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone, onClick }: {
  label: string; value: number; sub: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tone: 'gold' | 'teal' | 'error' | 'calm';
  onClick?: () => void;
}) {
  const iconBg = tone === 'gold' ? '#C08A30' : tone === 'teal' ? '#14595B' : tone === 'error' ? '#8B2A1F' : '#8B97A0';
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`card card-p text-left transition-all ${onClick ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-tag-cold">{label}</div>
        <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: iconBg }}>
          <Icon size={14} />
        </div>
      </div>
      <div className="text-2xl font-bold text-tag-ink"><FlashingNumber value={value} /></div>
      <div className="text-[11px] text-tag-cold mt-0.5">{sub}</div>
    </button>
  );
}

// ============================================================
// CHARTS
// ============================================================

const TRACK_COLORS: Record<string, string> = {
  agent: '#14595B',
  retailer: '#C08A30',
  ip_owner: '#0F7B4A',
  cpg: '#8B4A00',
  international: '#9C27B0',
  new_surfaced: '#6B7280',
  custom_collectibles: '#E8B95B',
  ambient: '#22D3EE',
  sports: '#EC4899',
  entertainment: '#A855F7',
  gaming: '#22D3EE',
  retail: '#F59E0B',
};

function FunnelChart({ steps }: { steps: { label: string; value: number; color: string }[] }) {
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <div className="card card-p">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-tag-cold mb-3">
        Funnel · target → pilot
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => {
          const widthPct = (s.value / max) * 100;
          const dropPct =
            i > 0 && steps[i - 1].value > 0
              ? Math.round((1 - s.value / steps[i - 1].value) * 100)
              : null;
          return (
            <div key={s.label} className="flex items-center gap-2">
              <div className="w-[42%] text-[11px] text-tag-ink truncate">{s.label}</div>
              <div className="flex-1 relative h-7 rounded-md bg-tag-50 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: s.color,
                  }}
                />
                <div className="absolute inset-0 flex items-center px-2 text-[11px] font-mono font-semibold text-tag-ink dark:text-white">
                  {s.value}
                  {dropPct !== null && dropPct > 0 && (
                    <span className="ml-2 text-[10px] text-tag-cold font-normal">
                      −{dropPct}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StageBarChart({ counts, total }: { counts: Record<string, number>; total: number }) {
  const stages: { key: string; label: string; color: string }[] = [
    { key: 'not_started', label: 'Not started', color: '#8B97A0' },
    { key: 't1_immediate_thanks', label: 'T1 · Thanks', color: '#14595B' },
    { key: 't2_value_add', label: 'T2 · Value', color: '#0F7B4A' },
    { key: 't3_proposal', label: 'T3 · Proposal', color: '#C08A30' },
  ];
  const max = Math.max(1, ...stages.map((s) => counts[s.key] ?? 0));
  return (
    <div className="card card-p">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-tag-cold mb-3">
        Stage distribution · {total} lead{total === 1 ? '' : 's'}
      </div>
      <div className="flex items-end gap-3 h-32">
        {stages.map((s) => {
          const v = counts[s.key] ?? 0;
          const heightPct = (v / max) * 100;
          return (
            <div key={s.key} className="flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0">
              <div className="text-[11px] font-mono font-semibold text-tag-ink">{v}</div>
              <div
                className="w-full rounded-t transition-all duration-700"
                style={{
                  height: `${Math.max(heightPct, v > 0 ? 4 : 0)}%`,
                  backgroundColor: s.color,
                  minHeight: v > 0 ? 4 : 0,
                }}
              />
              <div className="text-[10px] text-tag-cold w-full text-center truncate">
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrackDonut({
  tracks,
  onSelect,
  activeTrack,
}: {
  tracks: { track: Track; total: number; hot: number }[];
  onSelect: (t: Track) => void;
  activeTrack: Track | null;
}) {
  const total = tracks.reduce((sum, t) => sum + t.total, 0);
  if (total === 0) return null;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = tracks.map((t) => {
    const fraction = t.total / total;
    const dash = fraction * circumference;
    const seg = {
      track: t.track,
      total: t.total,
      hot: t.hot,
      color: TRACK_COLORS[t.track] ?? '#6B7280',
      dasharray: `${dash} ${circumference - dash}`,
      dashoffset: -offset,
    };
    offset += dash;
    return seg;
  });
  return (
    <div className="card card-p">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-tag-cold mb-3">
        Lead distribution by track · tap to filter
      </div>
      <div className="flex flex-col md:flex-row items-center gap-5">
        <svg width="140" height="140" viewBox="0 0 140 140" className="shrink-0">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="20" />
          {segments.map((s) => (
            <circle
              key={s.track}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth="20"
              strokeDasharray={s.dasharray}
              strokeDashoffset={s.dashoffset}
              transform="rotate(-90 70 70)"
              style={{
                opacity: activeTrack && activeTrack !== s.track ? 0.25 : 1,
                transition: 'opacity 200ms',
              }}
            />
          ))}
          <text x="70" y="65" textAnchor="middle" fontSize="20" fontWeight="700" fill="currentColor">
            {total}
          </text>
          <text x="70" y="83" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.6">
            LEADS
          </text>
        </svg>
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {segments.map((s) => (
            <button
              key={s.track}
              type="button"
              onClick={() => onSelect(s.track)}
              className={`flex items-center justify-between gap-2 rounded-btn px-2.5 py-1.5 text-[11px] transition-colors ${
                activeTrack === s.track
                  ? 'bg-tag-gold/10 ring-1 ring-tag-gold'
                  : 'hover:bg-tag-50 dark:hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                <span className="truncate capitalize">{s.track.replace(/_/g, ' ')}</span>
              </span>
              <span className="font-mono shrink-0">
                {s.total}
                {s.hot > 0 && <span className="text-tag-gold-dark"> · {s.hot}🔥</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
