import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { NewIntelForm } from './NewIntelForm';

export const dynamic = 'force-dynamic';

export default async function NewIntelPage({ searchParams }: { searchParams: Promise<{ target?: string }> }) {
  const me = await getCurrentUser();
  if (!me) return null;
  const supabase = await createSupabaseServerClient();
  const params = await searchParams;
  const { data: targets } = await supabase
    .from('targets')
    .select('id, company_name, tier')
    .order('company_name');
  return (
    <>
      <TopBar title="Log Intel" showBack />
      <NewIntelForm
        currentUser={me}
        targets={targets ?? []}
        defaultTargetId={params.target}
      />
    </>
  );
}
