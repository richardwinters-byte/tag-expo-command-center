import { notFound } from 'next/navigation';
import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { LeadDetailClient } from './LeadDetailClient';

export const dynamic = 'force-dynamic';

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) return null;
  const supabase = await createSupabaseServerClient();

  const [leadRes, users, followUps] = await Promise.all([
    supabase.from('leads').select('*, target:target_id(company_name, tier), meeting:meeting_id(title, start_at)').eq('id', id).single(),
    supabase.from('users').select('*'),
    supabase.from('follow_ups').select('*').eq('lead_id', id).order('touch'),
  ]);

  if (leadRes.error || !leadRes.data) notFound();

  return (
    <>
      <TopBar title={leadRes.data.full_name} subtitle={leadRes.data.company} showBack />
      <LeadDetailClient
        lead={leadRes.data}
        users={users.data ?? []}
        followUps={followUps.data ?? []}
        currentUser={me}
      />
    </>
  );
}
