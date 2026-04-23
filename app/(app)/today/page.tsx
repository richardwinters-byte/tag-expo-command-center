import Link from 'next/link';
import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { DataFetchError } from '@/components/app/DataFetchError';
import { fmt, fmtTime, todayInVegas } from '@/lib/utils';
import { Plus, UserPlus, Zap, FileEdit, ArrowRight, Calendar, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createSupabaseServerClient();
  const today = todayInVegas();
  const dayStart = `${today}T00:00:00-07:00`;
  const dayEnd = `${today}T23:59:59-07:00`;

  // Today's meetings for this user
  const { data: myMeetings, error: meetingsErr } = await supabase
    .from('meetings')
    .select('*, target:target_id(company_name, tier)')
    .gte('start_at', dayStart)
    .lte('start_at', dayEnd)
    .or(`owner_id.eq.${user.id},attendee_ids.cs.{${user.id}}`)
    .order('start_at');

  // Users for creator lookup
  const { data: allUsers, error: usersErr } = await supabase.from('users').select('id, name, color');
  const usersById = new Map((allUsers ?? []).map((u) => [u.id, u]));

  // Open follow-ups for me
  const { count: followUpCount, error: followUpErr } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)
    .lte('deadline', today)
    .in('follow_up_stage', ['not_started', 't1_immediate_thanks', 't2_value_add']);

  // High-significance intel last 24h
  const { data: hotIntel, error: intelErr } = await supabase
    .from('intel')
    .select('*')
    .eq('significance', 'high')
    .order('date_observed', { ascending: false })
    .limit(3);

  // Latest morning brief
  const { data: brief, error: briefErr } = await supabase
    .from('morning_briefs')
    .select('*')
    .eq('published', true)
    .order('brief_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const anyError = meetingsErr || usersErr || followUpErr || intelErr || briefErr;
  if (anyError) {
    // eslint-disable-next-line no-console
    console.error('[today] fetch error', { meetingsErr, usersErr, followUpErr, intelErr, briefErr });
  }

  const firstName = user.name.split(' ')[0];
  const hour = Number(fmt(new Date(), 'H'));
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const meetingCount = myMeetings?.length ?? 0;
  const fuCount = followUpCount ?? 0;
  const intelCount = hotIntel?.length ?? 0;

  // Show-day context banner
  const showDay = today === '2026-05-19' ? 'Day 1 · Live'
                : today === '2026-05-20' ? 'Day 2 · Live'
                : today === '2026-05-21' ? 'Day 3 · Live'
                : today === '2026-05-18' ? 'Travel Day'
                : null;

  return (
    <>
      <TopBar title="Today" subtitle={fmt(new Date(), 'EEEE, MMMM d')} />
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-5 md:py-8 space-y-6">
        {anyError && <DataFetchError />}
        {/* Gradient hero */}
        <div
          className="relative overflow-hidden rounded-2xl p-5 md:p-7 text-white shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0B2F31 0%, #14595B 55%, #0E3B3C 100%)' }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" style={{ backgroundColor: 'rgba(192, 138, 48, 0.25)' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" style={{ backgroundColor: 'rgba(192, 138, 48, 0.15)' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {showDay && (
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-white px-2.5 py-1 rounded-full shadow-sm" style={{ backgroundColor: '#C08A30' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {showDay}
                </span>
              )}
              <span className="text-[10px] uppercase tracking-wider text-white/70 font-medium">
                {fmt(new Date(), 'MMMM d, yyyy')} · Las Vegas
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{greeting}, {firstName}</h1>
            <p className="text-sm text-white/80 mt-1.5">
              {meetingCount > 0 ? `${meetingCount} meeting${meetingCount !== 1 ? 's' : ''} today` : 'No meetings today — floor is yours'}
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} style={{ color: '#C08A30' }} />
                <span className="text-white/90 font-medium">{meetingCount} meeting{meetingCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-1.5">
                <Users size={14} style={{ color: '#C08A30' }} />
                <span className="text-white/90 font-medium">{fuCount} follow-up{fuCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="h-3 w-px bg-white/20" />
              <div className="flex items-center gap-1.5">
                <Zap size={14} style={{ color: '#C08A30' }} />
                <span className="text-white/90 font-medium">{intelCount} hot intel</span>
              </div>
            </div>
          </div>
        </div>

        {/* Colored quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <QuickAction href="/leads/new" icon={<UserPlus size={16} />} label="Add Lead" fg="#DC2626" bg="#FEE2E2" />
          <QuickAction href="/schedule/new" icon={<Plus size={16} />} label="Add Meeting" fg="#0E7490" bg="#CFFAFE" />
          <QuickAction href="/intel/new" icon={<Zap size={16} />} label="Log Intel" fg="#A0721F" bg="#FEF3C7" />
          <QuickAction href="/debrief" icon={<FileEdit size={16} />} label="Debrief" fg="#059669" bg="#D1FAE5" />
        </div>

        {/* Tinted stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Meetings today" value={meetingCount} href="/schedule" tone="teal" Icon={Calendar} />
          <StatCard label="Open follow-ups" value={fuCount} href={`/leads?owner=${user.id}&due=today`} tone={fuCount > 0 ? 'amber' : 'neutral'} Icon={Users} />
          <StatCard label="High-sig intel · 24h" value={intelCount} href="/intel" tone="gold" Icon={Zap} />
        </div>

        {/* Morning brief excerpt */}
        {brief && (
          <section>
            <div className="section-header flex items-center justify-between">
              <span>Morning Brief</span>
              <Link href="/morning" className="text-[11px] text-tag-700 normal-case tracking-normal">
                Full brief <ArrowRight size={11} className="inline" />
              </Link>
            </div>
            <div className="card card-p">
              <div className="text-xs text-tag-cold mb-2">{fmt(brief.brief_date, 'EEEE, MMMM d')}</div>
              <div className="text-sm whitespace-pre-line line-clamp-6">
                {brief.content_markdown.replace(/^#+ /gm, '').replace(/\*\*/g, '').slice(0, 600)}…
              </div>
            </div>
          </section>
        )}

        {/* My meetings today */}
        <section>
          <div className="section-header flex items-center justify-between">
            <span>Your meetings today</span>
            <Link href="/schedule" className="text-[11px] text-tag-700 normal-case tracking-normal">
              Full schedule <ArrowRight size={11} className="inline" />
            </Link>
          </div>
          {!myMeetings || myMeetings.length === 0 ? (
            <div className="card card-p text-sm text-tag-cold text-center py-8">
              No meetings scheduled for today.
            </div>
          ) : (
            <div className="space-y-2">
              {myMeetings.map((m: any) => {
                const creator = m.created_by ? usersById.get(m.created_by) : null;
                return (
                  <Link key={m.id} href={`/schedule/${m.id}`} className="card card-p block hover:shadow-float transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="text-xs font-mono font-semibold text-tag-900 pt-0.5 w-16 shrink-0">
                        {fmtTime(m.start_at)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-tight">{m.title}</div>
                        {m.target && (
                          <div className="text-xs text-tag-cold mt-0.5">{m.target.company_name}</div>
                        )}
                        {m.location && (
                          <div className="text-[11px] text-tag-cold mt-1 font-mono">{m.location}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {m.type === 'keynote' && <span className="pill bg-tag-gold/10 text-tag-gold-dark text-[10px]">KEYNOTE</span>}
                        {m.type === 'party' && <span className="pill bg-tag-gold text-white text-[10px]">ONP</span>}
                        {creator && (
                          <span
                            className="inline-flex items-center justify-center rounded-full text-[9px] font-bold text-white leading-none"
                            style={{ backgroundColor: creator.color ?? '#0B2F31', width: 16, height: 16 }}
                            title={`Created by ${creator.name}`}
                          >
                            {creator.name.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Hot intel — gold wash */}
        {hotIntel && hotIntel.length > 0 && (
          <section>
            <div className="section-header">Hot intel</div>
            <div className="space-y-2">
              {hotIntel.map((i) => (
                <Link
                  key={i.id}
                  href="/intel"
                  className="hot-intel-card rounded-xl border border-l-4 p-4 block hover:shadow-float transition-all"
                  style={{
                    borderColor: 'rgba(192, 138, 48, 0.25)',
                    borderLeftColor: '#C08A30',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(192, 138, 48, 0.15)' }}>
                      <Zap size={12} style={{ color: '#A0721F' }} />
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: '#A0721F' }}>
                      {i.subject}
                    </div>
                  </div>
                  <div className="text-sm font-medium mt-1 leading-tight">{i.headline}</div>
                  <div className="text-xs text-tag-cold mt-1">{fmt(i.date_observed, 'MMM d')}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

function QuickAction({ href, icon, label, fg, bg }: { href: string; icon: React.ReactNode; label: string; fg: string; bg: string }) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-hairline flex items-center gap-2.5 py-3 px-3 hover:shadow-float hover:-translate-y-0.5 transition-all text-sm font-medium"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bg, color: fg }}>
        {icon}
      </div>
      <span className="text-left leading-tight">{label}</span>
    </Link>
  );
}

type StatTone = 'teal' | 'amber' | 'gold' | 'neutral';
function StatCard({ label, value, href, tone, Icon }: { label: string; value: number; href: string; tone: StatTone; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }) {
  const tones: Record<StatTone, { bg: string; border: string; value: string; label: string }> = {
    teal: { bg: 'linear-gradient(135deg, rgba(20, 89, 91, 0.08), rgba(14, 116, 144, 0.12))', border: 'rgba(20, 89, 91, 0.25)', value: '#0B2F31', label: '#14595B' },
    amber: { bg: 'linear-gradient(135deg, #FEF3C7, rgba(252, 211, 77, 0.35))', border: '#FCD34D', value: '#92400E', label: '#A0721F' },
    gold: { bg: 'linear-gradient(135deg, rgba(192, 138, 48, 0.12), rgba(192, 138, 48, 0.22))', border: 'rgba(192, 138, 48, 0.45)', value: '#A0721F', label: '#A0721F' },
    neutral: { bg: 'var(--card)', border: 'rgba(11, 47, 49, 0.08)', value: 'var(--foreground)', label: '#6B7280' },
  };
  const t = tones[tone];
  return (
    <Link
      href={href}
      className="rounded-xl border p-4 block hover:shadow-float hover:-translate-y-0.5 transition-all"
      style={{ background: t.bg, borderColor: t.border }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: t.label }}>{label}</div>
        <Icon size={14} style={{ color: t.label }} />
      </div>
      <div className="text-2xl font-bold font-mono" style={{ color: t.value }}>{value}</div>
    </Link>
  );
}
