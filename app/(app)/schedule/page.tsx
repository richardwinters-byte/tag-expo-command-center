import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { DataFetchError } from '@/components/app/DataFetchError';
import { ScheduleClient } from './ScheduleClient';

export const dynamic = 'force-dynamic';

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createSupabaseServerClient();

  const params = await searchParams;
  const viewDate = params.date ?? '2026-05-19';

  const [meetingsRes, usersRes, targetsRes] = await Promise.all([
    supabase.from('meetings').select('*').gte('start_at', '2026-05-18T00:00:00-07:00').lte('start_at', '2026-05-21T23:59:59-07:00').order('start_at'),
    supabase.from('users').select('*'),
    supabase.from('targets').select('id, company_name, tier'),
  ]);

  const anyError = meetingsRes.error || usersRes.error || targetsRes.error;
  if (anyError) {
    // eslint-disable-next-line no-console
    console.error('[schedule] fetch error', { meetings: meetingsRes.error, users: usersRes.error, targets: targetsRes.error });
  }

  return (
    <>
      <TopBar title="Schedule" subtitle="May 18 – 21 · Mandalay Bay" />
      {anyError && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4">
          <DataFetchError />
        </div>
      )}
      <ScheduleClient
        currentUserId={user.id}
        initialDate={viewDate}
        meetings={meetingsRes.data ?? []}
        users={usersRes.data ?? []}
        targets={targetsRes.data ?? []}
      />
    </>
  );
}
