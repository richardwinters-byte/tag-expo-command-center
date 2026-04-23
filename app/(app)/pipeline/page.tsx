import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { PipelineClient, type LeadFull } from '@/components/app/PipelineClient';
import type { User, Tier, Track } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PipelinePage() {
  const me = await getCurrentUser();
  if (!me) return null;
  const supabase = await createSupabaseServerClient();

  const [leadsRes, targetsRes, usersRes] = await Promise.all([
    supabase.from('leads').select('*, target:target_id(company_name, tier, track)').order('created_at', { ascending: false }),
    supabase.from('targets').select('id, company_name, tier, track'),
    supabase.from('users').select('*'),
  ]);

  const usersById = new Map((usersRes.data ?? []).map((u) => [u.id, u]));
  const leads = ((leadsRes.data ?? []) as LeadFull[]).map((l) => {
    const o = l.owner_id ? usersById.get(l.owner_id) : null;
    return { ...l, owner: o ? { name: o.name, color: o.color ?? '#14595B' } : null };
  });

  return (
    <>
      <TopBar title="Pipeline" subtitle="Post-show momentum" />
      <PipelineClient
        initialLeads={leads}
        targets={(targetsRes.data ?? []) as { id: string; company_name: string; tier: Tier; track: Track }[]}
        users={(usersRes.data ?? []) as User[]}
      />
    </>
  );
}
