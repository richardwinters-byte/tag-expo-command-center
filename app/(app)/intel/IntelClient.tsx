'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, X, Tag, Building2 } from 'lucide-react';
import { UserAvatar, trackColor } from '@/components/app/Pills';
import { VoiceButton } from '@/components/app/VoiceInput';
import { fmt } from '@/lib/utils';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { Intel, IntelSubject, IntelType, Significance, User } from '@/lib/types';

type TargetSlim = { id: string; company_name: string; tier: string; track: string };
type IntelWithTarget = Intel & { target?: TargetSlim | null };

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

export function IntelClient({
  intel: initialIntel,
  users,
  targets,
  currentUserId,
}: {
  intel: IntelWithTarget[];
  users: User[];
  targets: TargetSlim[];
  currentUserId: string;
}) {
  const searchParams = useSearchParams();
  const [logOpen, setLogOpen] = useState(searchParams.get('log') === '1');
  const [intel, setIntel] = useState(initialIntel);

  const [filterKind, setFilterKind] = useState<'all' | 'target' | 'tag' | 'subject'>('all');
  const [filterValue, setFilterValue] = useState<string>('');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel('intel-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'intel' }, async () => {
        const { data } = await supabase
          .from('intel')
          .select('*, target:target_id(id, company_name, tier, track)')
          .order('date_observed', { ascending: false });
        if (data) setIntel(data as IntelWithTarget[]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const usedTags = useMemo(() => {
    const s = new Set<string>();
    for (const i of intel) if (i.tag) s.add(i.tag);
    return Array.from(s).sort();
  }, [intel]);

  const filtered = useMemo(() => {
    if (filterKind === 'all') return intel;
    if (filterKind === 'target') return intel.filter((i) => i.target_id === filterValue);
    if (filterKind === 'tag') return intel.filter((i) => i.tag === filterValue);
    if (filterKind === 'subject') return intel.filter((i) => i.subject === filterValue);
    return intel;
  }, [intel, filterKind, filterValue]);

  const filterLabel = useMemo(() => {
    if (filterKind === 'all') return null;
    if (filterKind === 'target') return targets.find((t) => t.id === filterValue)?.company_name ?? 'Target';
    if (filterKind === 'tag') return filterValue;
    if (filterKind === 'subject') return SUBJECTS.find((s) => s.value === filterValue)?.label ?? filterValue;
    return null;
  }, [filterKind, filterValue, targets]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-5 md:py-8">
      <div className="space-y-2 mb-4">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <FilterChip active={filterKind === 'all'} onClick={() => { setFilterKind('all'); setFilterValue(''); }}>All</FilterChip>
          <FilterChip active={filterKind === 'target'} onClick={() => { setFilterKind('target'); setFilterValue(targets[0]?.id ?? ''); }}>By target</FilterChip>
          <FilterChip active={filterKind === 'tag'} onClick={() => { setFilterKind('tag'); setFilterValue(usedTags[0] ?? ''); }} disabled={usedTags.length === 0}>By tag</FilterChip>
          <FilterChip active={filterKind === 'subject'} onClick={() => { setFilterKind('subject'); setFilterValue('cgc'); }}>Competitor</FilterChip>
        </div>

        {filterKind === 'target' && (
          <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="w-full text-sm">
            {targets.map((t) => <option key={t.id} value={t.id}>{t.company_name}</option>)}
          </select>
        )}
        {filterKind === 'tag' && usedTags.length > 0 && (
          <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} className="w-full text-sm">
            {usedTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        {filterKind === 'subject' && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {SUBJECTS.map((s) => (
              <FilterChip key={s.value} active={filterValue === s.value} onClick={() => setFilterValue(s.value)}>
                {s.label}
              </FilterChip>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-tag-cold">
          {filtered.length} item{filtered.length !== 1 ? 's' : ''}
          {filterLabel && <> · <span className="font-medium text-tag-ink">{filterLabel}</span></>}
        </div>
        <button onClick={() => setLogOpen(true)} className="btn-accent btn-sm">
          <Plus size={14} /> Log intel
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card card-p text-sm text-tag-cold text-center py-12">
          No intel{filterLabel ? ` for ${filterLabel}` : ''} yet.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((i) => {
            const user = i.captured_by_id ? usersById.get(i.captured_by_id) : null;
            const isHot = i.significance === 'high';
            return (
              <div key={i.id} className={`card card-p ${isHot ? 'border-l-4 !border-l-tag-gold' : ''}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {i.target ? (
                      <Link
                        href={`/targets/${i.target.id}`}
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-semibold hover:underline"
                        style={{ color: trackColor(i.target.track) }}
                      >
                        <Building2 size={10} />
                        {i.target.company_name}
                      </Link>
                    ) : i.tag ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-tag-cold font-semibold">
                        <Tag size={10} />
                        {i.tag}
                      </span>
                    ) : i.subject ? (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-tag-gold-dark font-semibold">
                        {i.subject.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-tag-cold italic">General observation</span>
                    )}
                    <span className="pill bg-tag-50 text-tag-700 text-[10px]">{i.type.replace('_', ' ')}</span>
                    {isHot && <span className="pill bg-tag-gold text-white text-[10px]">HIGH</span>}
                  </div>
                  <div className="text-[11px] font-mono text-tag-cold shrink-0">{fmt(i.date_observed, 'MMM d')}</div>
                </div>
                <div className="font-medium text-sm leading-tight mt-1">{i.headline}</div>
                {i.details && <div className="text-xs text-tag-ink/80 mt-2 leading-relaxed">{i.details}</div>}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-hairline">
                  <div className="flex items-center gap-1.5">
                    {user && <UserAvatar name={user.name} color={user.color} />}
                    <span className="text-[11px] text-tag-cold">{user?.name ?? 'System'}</span>
                  </div>
                  {i.source && <span className="text-[11px] text-tag-cold italic">{i.source}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {logOpen && <LogIntelDrawer onClose={() => setLogOpen(false)} currentUserId={currentUserId} targets={targets} />}
    </div>
  );
}

function FilterChip({ active, onClick, disabled, children }: { active: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
        active ? 'bg-tag-900 text-white' : 'bg-white border border-hairline text-tag-ink'
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function LogIntelDrawer({ onClose, currentUserId, targets }: { onClose: () => void; currentUserId: string; targets: TargetSlim[] }) {
  const [aboutKind, setAboutKind] = useState<'target' | 'tag' | 'subject'>('target');
  const [targetId, setTargetId] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [subject, setSubject] = useState<IntelSubject>('cgc');
  const [type, setType] = useState<IntelType>('booth_observation');
  const [significance, setSignificance] = useState<Significance>('medium');
  const [headline, setHeadline] = useState('');
  const [details, setDetails] = useState('');
  const [source, setSource] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!headline.trim()) return;
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.from('intel').insert({
      target_id: aboutKind === 'target' && targetId ? targetId : null,
      tag: aboutKind === 'tag' && tag.trim() ? tag.trim() : null,
      subject: aboutKind === 'subject' ? subject : null,
      type,
      significance,
      headline: headline.trim(),
      details: details.trim() || null,
      source: source.trim() || null,
      captured_by_id: currentUserId,
      date_observed: new Date().toISOString().slice(0, 10),
    });
    setSaving(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 64px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full md:max-w-md md:rounded-card rounded-t-2xl flex flex-col max-h-full md:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0 border-b border-hairline">
          <h2 className="text-lg font-semibold">Log Intel</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-tag-cold p-2 -m-2 rounded-btn hover:bg-tag-50"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-3 px-5 py-4 overflow-y-auto flex-1 min-h-0">
          <div>
            <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider mb-1">About</label>
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
          </div>

          {aboutKind === 'target' && (
            <div>
              <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider mb-1">Target company</label>
              <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="w-full">
                <option value="">— Select a target —</option>
                {targets.map((t) => <option key={t.id} value={t.id}>{t.company_name}</option>)}
              </select>
            </div>
          )}
          {aboutKind === 'tag' && (
            <div>
              <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider mb-1">Tag</label>
              <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder='e.g. "ubisoft", "industry"' className="w-full" />
              <div className="text-[10px] text-tag-cold mt-1">Use for off-list companies or general observations.</div>
            </div>
          )}
          {aboutKind === 'subject' && (
            <div>
              <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider mb-1">Competitor</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value as IntelSubject)} className="w-full">
                {SUBJECTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as IntelType)} className="w-full">
                <option value="booth_observation">Booth observation</option>
                <option value="overheard">Overheard</option>
                <option value="announced_deal">Announced deal</option>
                <option value="pricing">Pricing</option>
                <option value="tech_demo">Tech demo</option>
                <option value="rumor">Rumor</option>
                <option value="personnel">Personnel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider mb-1">Significance</label>
              <select value={significance} onChange={(e) => setSignificance(e.target.value as Significance)} className="w-full">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider">Headline</label>
              <VoiceButton value={headline} onChange={setHeadline} />
            </div>
            <input autoFocus value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="One line — the finding" className="w-full" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider">Details</label>
              <VoiceButton value={details} onChange={setDetails} />
            </div>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider mb-1">Source</label>
            <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Booth, conversation, overheard…" className="w-full" />
          </div>
          <button
            onClick={submit}
            disabled={saving || !headline.trim() || (aboutKind === 'target' && !targetId) || (aboutKind === 'tag' && !tag.trim())}
            className="btn-primary w-full"
          >
            {saving ? 'Logging…' : 'Log intel'}
          </button>
        </div>
      </div>
    </div>
  );
}
