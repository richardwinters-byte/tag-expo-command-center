'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Tag, Building2 } from 'lucide-react';
import { UserAvatar, trackColor } from '@/components/app/Pills';
import { fmt } from '@/lib/utils';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { Intel, IntelSubject, User } from '@/lib/types';

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
        <Link href="/intel/new" className="btn-accent btn-sm">
          <Plus size={14} /> Log intel
        </Link>
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
