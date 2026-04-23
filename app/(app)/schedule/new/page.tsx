import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { NewMeetingForm } from './NewMeetingForm';

export const dynamic = 'force-dynamic';

export default async function NewMeetingPage({ searchParams }: { searchParams: Promise<{ date?: string; target?: string; start?: string; end?: string }> }) {
  const me = await getCurrentUser();
  if (!me) return null;
  const supabase = await createSupabaseServerClient();
  const params = await searchParams;
  const [users, targets] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('targets').select('id, company_name, tier'),
  ]);
  return (
    <>
      <TopBar title="New Meeting" showBack />
      <NewMeetingForm
        defaultDate={params.date ?? '2026-05-19'}
        defaultTargetId={params.target ?? ''}
        defaultStart={params.start ?? '10:00'}
        defaultEnd={params.end ?? '10:30'}
        users={users.data ?? []}
        targets={targets.data ?? []}
        currentUser={me}
      />
    </>
  );
}
