import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { TierBadge, PriorityBadge, StatusPill, trackColor } from '@/components/app/Pills';
import { coverageLabel, trackLabel } from '@/lib/utils';
import type { Target, Lead, Meeting, Intel } from '@/lib/types';
import { TargetStatusForm } from './TargetStatusForm';

export const dynamic = 'force-dynamic';

export default async function TargetDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: target } = await supabase.from('targets').select('*').eq('id', id).single();
  if (!target) notFound();

  const [{ data: leads }, { data: meetings }, { data: intel }, { data: allUsers }] = await Promise.all([
    supabase.from('leads').select('*').eq('target_id', id),
    supabase.from('meetings').select('*').eq('target_id', id).order('start_at'),
    supabase.from('intel').select('*').eq('target_id', id).order('date_observed', { ascending: false }).limit(10),
    supabase.from('users').select('id, name, color'),
  ]);
  const usersById = new Map((allUsers ?? []).map((u) => [u.id, u]));

  const t = target as Target;
  const tColor = trackColor(t.track);

  return (
    <>
      <TopBar title={t.company_name} subtitle={trackLabel(t.track)} showBack />
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-5 md:py-8 space-y-5">
        {/* Header with track-color top stripe */}
        <div className="bg-white rounded-xl border border-hairline p-4 border-t-4" style={{ borderTopColor: tColor }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: tColor }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tColor }} />
                {trackLabel(t.track)}
              </div>
              <h1 className="text-xl font-semibold">{t.company_name}</h1>
            </div>
            <TierBadge tier={t.tier} />
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <PriorityBadge priority={t.priority} />
            <StatusPill status={t.status} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-tag-cold uppercase tracking-wider">Coverage</div>
              <div className="font-medium">{coverageLabel(t.coverage_unit)}</div>
            </div>
            <div>
              <div className="text-tag-cold uppercase tracking-wider">Booth</div>
              <div className="font-mono text-sm">{t.booth_number ?? '—'}</div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/schedule/new?target=${t.id}`} className="btn-primary">Book meeting</Link>
          <Link href={`/leads/new?target=${t.id}&company=${encodeURIComponent(t.company_name)}`} className="btn-outline">Add lead</Link>
        </div>

        {/* Opener */}
        {t.opener && (
          <section>
            <div className="section-header">Opener</div>
            <div className="card card-p bg-tag-900 text-white">
              <div className="text-sm italic leading-relaxed">"{t.opener}"</div>
            </div>
          </section>
        )}

        {/* Proof point */}
        {t.proof_point && (
          <section>
            <div className="section-header">Proof point</div>
            <div className="card card-p">
              <p className="text-sm leading-relaxed">{t.proof_point}</p>
            </div>
          </section>
        )}

        {/* Pitch angle */}
        {t.pitch_angle && (
          <section>
            <div className="section-header">Pitch angle</div>
            <div className="card card-p">
              <p className="text-sm leading-relaxed">{t.pitch_angle}</p>
            </div>
          </section>
        )}

        {/* Key contacts */}
        {t.key_contacts && t.key_contacts.length > 0 && (
          <section>
            <div className="section-header">Key contacts</div>
            <div className="card">
              <ul className="divide-y divide-hairline">
                {t.key_contacts.map((c, i) => (
                  <li key={i} className="p-4">
                    <div className="font-medium text-sm">{c.name}</div>
                    <div className="text-xs text-tag-cold mt-0.5">{c.title}</div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Meetings for this target */}
        {meetings && meetings.length > 0 && (
          <section>
            <div className="section-header">Scheduled meetings</div>
            <div className="card">
              <ul className="divide-y divide-hairline">
                {meetings.map((m: Meeting) => {
                  const creator = m.created_by ? usersById.get(m.created_by) : null;
                  return (
                    <li key={m.id}>
                      <Link href={`/schedule/${m.id}`} className="p-3 flex items-start gap-2 hover:bg-tag-50">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{m.title}</div>
                          <div className="text-xs text-tag-cold mt-0.5 font-mono">
                            {new Date(m.start_at).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                        {creator && (
                          <span
                            className="inline-flex items-center justify-center rounded-full text-[9px] font-bold text-white shrink-0 mt-0.5 leading-none"
                            style={{ backgroundColor: creator.color ?? '#0B2F31', width: 16, height: 16 }}
                            title={`Created by ${creator.name}`}
                          >
                            {creator.name.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        )}

        {/* Leads for this target */}
        {leads && leads.length > 0 && (
          <section>
            <div className="section-header">Leads captured</div>
            <div className="card">
              <ul className="divide-y divide-hairline">
                {(leads as Lead[]).map((l) => (
                  <li key={l.id}>
                    <Link href={`/leads/${l.id}`} className="p-3 block hover:bg-tag-50">
                      <div className="text-sm font-medium">{l.full_name}</div>
                      <div className="text-xs text-tag-cold mt-0.5">{l.title ?? '—'}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Intel about this company */}
        {intel && intel.length > 0 && (
          <section>
            <div className="section-header flex items-center justify-between">
              <span>Intel about {t.company_name}</span>
              <Link href={`/intel`} className="text-[11px] text-tag-700 normal-case tracking-normal">
                All intel →
              </Link>
            </div>
            <div className="space-y-2">
              {(intel as Intel[]).map((i) => {
                const isHot = i.significance === 'high';
                return (
                  <div key={i.id} className={`card card-p ${isHot ? 'border-l-4 !border-l-tag-gold' : ''}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="pill bg-tag-50 text-tag-700 text-[10px]">{i.type.replace('_', ' ')}</span>
                        {isHot && <span className="pill bg-tag-gold text-white text-[10px]">HIGH</span>}
                      </div>
                      <div className="text-[11px] font-mono text-tag-cold">{new Date(i.date_observed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div className="text-sm font-medium leading-tight">{i.headline}</div>
                    {i.details && <div className="text-xs text-tag-ink/80 mt-1.5 leading-relaxed">{i.details}</div>}
                  </div>
                );
              })}
            </div>
            <Link href={`/intel?log=1`} className="inline-flex items-center gap-1.5 mt-2 text-xs text-tag-700 hover:underline">
              + Log intel about {t.company_name}
            </Link>
          </section>
        )}

        {/* Empty-state CTA if no intel yet */}
        {(!intel || intel.length === 0) && (
          <section>
            <div className="section-header">Intel</div>
            <Link href={`/intel?log=1`} className="card card-p block text-sm text-tag-cold text-center py-4 hover:bg-tag-50">
              + Log intel about {t.company_name}
            </Link>
          </section>
        )}

        {/* Status / notes form */}
        <TargetStatusForm target={t} />

        {/* Notes */}
        {t.notes && (
          <section>
            <div className="section-header">Notes</div>
            <div className="card card-p">
              <p className="text-sm leading-relaxed whitespace-pre-line">{t.notes}</p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
