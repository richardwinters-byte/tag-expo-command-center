import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { DataFetchError } from '@/components/app/DataFetchError';
import { SettingsClient } from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const me = await getCurrentUser();
  if (!me) return null;
  const supabase = await createSupabaseServerClient();
  const [allowlist, users] = await Promise.all([
    supabase.from('allowlist').select('*').order('name'),
    supabase.from('users').select('*').order('name'),
  ]);

  const anyError = allowlist.error || users.error;
  if (anyError) {
    // eslint-disable-next-line no-console
    console.error('[settings] fetch error', { allowlist: allowlist.error, users: users.error });
  }

  return (
    <>
      <TopBar title="Settings" />
      {anyError && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4">
          <DataFetchError />
        </div>
      )}
      <SettingsClient me={me} allowlist={allowlist.data ?? []} users={users.data ?? []} />
    </>
  );
}
