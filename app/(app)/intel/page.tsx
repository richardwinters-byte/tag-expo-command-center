import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { DataFetchError } from '@/components/app/DataFetchError';
import { IntelClient } from './IntelClient';

export const dynamic = 'force-dynamic';

export default async function IntelPage() {
  const me = await getCurrentUser();
  if (!me) return null;
  const supabase = await createSupabaseServerClient();
  const [intelRes, usersRes, targetsRes] = await Promise.all([
    supabase.from('intel').select('*, target:target_id(id, company_name, tier, track)').order('date_observed', { ascending: false }),
    supabase.from('users').select('*'),
    supabase.from('targets').select('id, company_name, tier, track').order('company_name'),
  ]);
  const anyError = intelRes.error || usersRes.error || targetsRes.error;
  if (anyError) {
    // eslint-disable-next-line no-console
    console.error('[intel] fetch error', { intel: intelRes.error, users: usersRes.error, targets: targetsRes.error });
  }
  return (
    <>
      <TopBar title="Intel" subtitle="Targets + competitor observations" showBack />
      {anyError && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4">
          <DataFetchError />
        </div>
      )}
      <IntelClient intel={intelRes.data ?? []} users={usersRes.data ?? []} targets={targetsRes.data ?? []} currentUserId={me.id} />
    </>
  );
}
