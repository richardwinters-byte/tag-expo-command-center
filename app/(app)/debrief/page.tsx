import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { DataFetchError } from '@/components/app/DataFetchError';
import { DebriefClient } from './DebriefClient';
import { todayInVegas } from '@/lib/utils';
import { buildDebriefDraft } from '@/lib/debrief-draft';

export const dynamic = 'force-dynamic';

export default async function DebriefPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const me = await getCurrentUser();
  if (!me) return null;
  const supabase = await createSupabaseServerClient();
  const params = await searchParams;
  const date = params.date ?? todayInVegas();

  const dayStart = `${date}T00:00:00-07:00`;
  const dayEnd = `${date}T23:59:59-07:00`;

  const [mine, team, users, myMeetings, myLeads, myIntel] = await Promise.all([
    supabase.from('debriefs').select('*').eq('user_id', me.id).eq('debrief_date', date).maybeSingle(),
    supabase.from('debriefs').select('*, users(name, color)').eq('debrief_date', date),
    supabase.from('users').select('*'),
    supabase.from('meetings').select('*, target:target_id(company_name, tier)')
      .gte('start_at', dayStart).lte('start_at', dayEnd)
      .or(`owner_id.eq.${me.id},attendee_ids.cs.{${me.id}}`).order('start_at'),
    supabase.from('leads').select('*, target:target_id(company_name)').eq('owner_id', me.id)
      .gte('created_at', dayStart).lte('created_at', dayEnd),
    supabase.from('intel').select('*, target:target_id(company_name)').eq('captured_by_id', me.id)
      .eq('date_observed', date),
  ]);

  const anyError = mine.error || team.error || users.error || myMeetings.error || myLeads.error || myIntel.error;
  if (anyError) {
    // eslint-disable-next-line no-console
    console.error('[debrief] fetch error', {
      mine: mine.error, team: team.error, users: users.error,
      myMeetings: myMeetings.error, myLeads: myLeads.error, myIntel: myIntel.error,
    });
  }

  // Only compute a prefill if no existing debrief yet
  const prefill = mine.data ? null : buildDebriefDraft({
    meetings: myMeetings.data ?? [],
    leads: myLeads.data ?? [],
    intel: myIntel.data ?? [],
  });

  return (
    <>
      <TopBar title="Daily Debrief" subtitle={date} />
      {anyError && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4">
          <DataFetchError />
        </div>
      )}
      <DebriefClient
        date={date}
        existing={mine.data ?? null}
        teamDebriefs={team.data ?? []}
        users={users.data ?? []}
        currentUser={me}
        prefill={prefill}
      />
    </>
  );
}
