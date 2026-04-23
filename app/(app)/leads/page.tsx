import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { DataFetchError } from '@/components/app/DataFetchError';
import { LeadsClient } from './LeadsClient';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createSupabaseServerClient();

  const [leadsRes, usersRes, targetsRes] = await Promise.all([
    supabase.from('leads').select('*').order('updated_at', { ascending: false }),
    supabase.from('users').select('*'),
    supabase.from('targets').select('id, company_name, tier'),
  ]);

  const anyError = leadsRes.error || usersRes.error || targetsRes.error;
  if (anyError) {
    // eslint-disable-next-line no-console
    console.error('[leads] fetch error', { leads: leadsRes.error, users: usersRes.error, targets: targetsRes.error });
  }

  return (
    <>
      <TopBar title="Leads" subtitle="Master lead tracker" />
      {anyError && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4">
          <DataFetchError />
        </div>
      )}
      <LeadsClient
        currentUserId={user.id}
        isAdmin={user.role === 'admin'}
        leads={leadsRes.data ?? []}
        users={usersRes.data ?? []}
        targets={targetsRes.data ?? []}
      />
    </>
  );
}
