import { notFound } from 'next/navigation';
import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { MeetingDetailClient } from './MeetingDetailClient';

export const dynamic = 'force-dynamic';

export default async function MeetingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return null;
  const supabase = await createSupabaseServerClient();
  const [meeting, users, targets] = await Promise.all([
    supabase.from('meetings').select('*, target:target_id(id, company_name, tier)').eq('id', id).single(),
    supabase.from('users').select('*'),
    supabase.from('targets').select('id, company_name, tier'),
  ]);
  if (meeting.error || !meeting.data) notFound();
  return (
    <>
      <TopBar title={meeting.data.title} showBack />
      <MeetingDetailClient
        meeting={meeting.data}
        users={users.data ?? []}
        targets={targets.data ?? []}
        currentUser={me}
      />
    </>
  );
}
