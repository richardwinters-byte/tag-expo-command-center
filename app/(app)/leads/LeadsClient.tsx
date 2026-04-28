'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Download, X, Search } from 'lucide-react';
import { TemperaturePill, UserAvatar } from '@/components/app/Pills';
import { downloadCSV, fmt } from '@/lib/utils';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { Lead, User } from '@/lib/types';

function localDateYYYYMMDD() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function LeadsClient({
  currentUserId,
  isAdmin,
  leads: initialLeads,
  users,
  targets,
}: {
  currentUserId: string;
  isAdmin: boolean;
  leads: Lead[];
  users: User[];
  targets: { id: string; company_name: string; tier: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState(initialLeads);

  // Filters from URL
  const owner = searchParams.get('owner') ?? 'all';
  const temp = searchParams.get('temperature') ?? 'all';
  const stage = searchParams.get('stage') ?? 'all';
  const search = searchParams.get('q') ?? '';
  const due = searchParams.get('due');

  // Realtime
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel('leads-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, async () => {
        const { data } = await supabase.from('leads').select('*').order('updated_at', { ascending: false });
        if (data) setLeads(data as Lead[]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (owner !== 'all' && l.owner_id !== owner && !(owner === 'me' && l.owner_id === currentUserId)) return false;
      if (temp !== 'all' && l.temperature !== temp) return false;
      if (stage !== 'all' && l.follow_up_stage !== stage) return false;
      if (search && !(`${l.full_name} ${l.company} ${l.title ?? ''} ${l.email ?? ''}`.toLowerCase().includes(search.toLowerCase()))) return false;
      if (due === 'today') {
        // Use local calendar date (not UTC) so "today" matches the user's day boundary.
        const today = localDateYYYYMMDD();
        if (!l.deadline || l.deadline > today) return false;
      }
      return true;
    });
  }, [leads, owner, temp, stage, search, due, currentUserId]);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(Array.from(searchParams.entries()));
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    router.replace(`/leads?${next.toString()}`, { scroll: false });
  }

  function clearFilters() {
    router.replace('/leads', { scroll: false });
  }

  function exportCSV() {
    const rows = filtered.map((l) => ({
      name: l.full_name,
      company: l.company,
      title: l.title ?? '',
      email: l.email ?? '',
      phone: l.phone ?? '',
      linkedin: l.linkedin_url ?? '',
      met_by: usersById.get(l.met_by_id ?? '')?.name ?? '',
      owner: usersById.get(l.owner_id ?? '')?.name ?? '',
      temperature: l.temperature,
      stage: l.follow_up_stage,
      next_action: l.next_action ?? '',
      deadline: l.deadline ?? '',
      notes: l.notes ?? '',
      created_at: l.created_at,
    }));
    downloadCSV(rows, `tag-leads-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  const hasFilters = owner !== 'all' || temp !== 'all' || stage !== 'all' || search || due;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-5 md:py-8">
      {/* Filter bar */}
      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tag-cold" />
          <input
            type="search"
            placeholder="Search name, company, email…"
            value={search}
            onChange={(e) => setParam('q', e.target.value || null)}
            className="w-full pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <select value={owner} onChange={(e) => setParam('owner', e.target.value)} className="shrink-0">
            <option value="all">All owners</option>
            <option value="me">Me</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select value={temp} onChange={(e) => setParam('temperature', e.target.value)} className="shrink-0">
            <option value="all">All temps</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
          <select value={stage} onChange={(e) => setParam('stage', e.target.value)} className="shrink-0">
            <option value="all">All stages</option>
            <option value="not_started">Not started</option>
            <option value="t1_immediate_thanks">T1</option>
            <option value="t2_value_add">T2</option>
            <option value="t3_proposal">T3</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-outline btn-sm shrink-0">
              <X size={12} /> Clear
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-tag-cold">{filtered.length} of {leads.length}</div>
          <div className="flex gap-2">
            {isAdmin && filtered.length > 0 && (
              <button onClick={exportCSV} className="btn-outline btn-sm">
                <Download size={12} /> CSV
              </button>
            )}
            <Link href="/leads/new" className="btn-accent btn-sm">
              <Plus size={14} /> Add Lead
            </Link>
          </div>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card card-p text-sm text-tag-cold text-center py-12">
          {leads.length === 0 ? 'No leads captured yet. Tap + Add Lead.' : 'No leads match current filters.'}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-tag-50 text-[11px] uppercase tracking-wider text-tag-700">
                <tr>
                  <th className="text-left px-3 py-2.5">Name / Company</th>
                  <th className="text-left px-3 py-2.5">Temp</th>
                  <th className="text-left px-3 py-2.5">Owner</th>
                  <th className="text-left px-3 py-2.5">Next action</th>
                  <th className="text-left px-3 py-2.5">Due</th>
                  <th className="text-left px-3 py-2.5">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline motion-list">
                {filtered.map((l) => (
                  <LeadTableRow key={l.id} lead={l} usersById={usersById} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2 motion-list">
            {filtered.map((l) => (
              <LeadMobileCard key={l.id} lead={l} usersById={usersById} />
            ))}
          </div>
        </>
      )}

    </div>
  );
}

function LeadTableRow({ lead, usersById }: { lead: Lead; usersById: Map<string, User> }) {
  const owner = lead.owner_id ? usersById.get(lead.owner_id) : null;
  const tempClass = lead.temperature === 'hot' ? 'lead-hot' : lead.temperature === 'warm' ? 'lead-warm' : '';
  return (
    <tr className={`hover:bg-tag-50 ${tempClass}`}>
      <td className="px-3 py-3">
        <Link href={`/leads/${lead.id}`} className="block">
          <div className="font-medium text-sm">{lead.full_name}</div>
          <div className="text-xs text-tag-cold">{lead.company}{lead.title ? ` · ${lead.title}` : ''}</div>
        </Link>
      </td>
      <td className="px-3 py-3"><TemperaturePill temp={lead.temperature} /></td>
      <td className="px-3 py-3">{owner ? <div className="flex items-center gap-1.5"><UserAvatar name={owner.name} color={owner.color} /><span className="text-xs">{owner.name}</span></div> : <span className="text-xs text-tag-cold">—</span>}</td>
      <td className="px-3 py-3 text-xs max-w-xs truncate">{lead.next_action ?? '—'}</td>
      <td className="px-3 py-3 text-xs font-mono">{lead.deadline ? fmt(lead.deadline, 'MMM d') : '—'}</td>
      <td className="px-3 py-3 text-xs"><span className="pill bg-tag-50 text-tag-700">{lead.follow_up_stage.replace('_', ' ')}</span></td>
    </tr>
  );
}

function LeadMobileCard({ lead, usersById }: { lead: Lead; usersById: Map<string, User> }) {
  const owner = lead.owner_id ? usersById.get(lead.owner_id) : null;
  const tempClass = lead.temperature === 'hot' ? 'lead-hot' : lead.temperature === 'warm' ? 'lead-warm' : '';
  return (
    <Link href={`/leads/${lead.id}`} className={`card card-p ${tempClass} block hover:shadow-float transition-shadow`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm">{lead.full_name}</div>
          <div className="text-xs text-tag-cold truncate">{lead.company}</div>
          {lead.title && <div className="text-[11px] text-tag-cold truncate">{lead.title}</div>}
        </div>
        <TemperaturePill temp={lead.temperature} />
      </div>
      {lead.next_action && <div className="text-xs text-tag-ink mt-2 line-clamp-2">{lead.next_action}</div>}
      <div className="flex items-center justify-between mt-2">
        {owner ? <div className="flex items-center gap-1.5"><UserAvatar name={owner.name} color={owner.color} /><span className="text-[11px] text-tag-cold">{owner.name}</span></div> : <span className="text-[11px] text-tag-cold">Unassigned</span>}
        {lead.deadline && <span className="text-[11px] font-mono text-tag-cold">due {fmt(lead.deadline, 'MMM d')}</span>}
      </div>
    </Link>
  );
}
