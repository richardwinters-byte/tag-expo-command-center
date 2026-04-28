import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { NewLeadForm } from './NewLeadForm';

export const dynamic = 'force-dynamic';

export default async function NewLeadPage() {
  const me = await getCurrentUser();
  if (!me) return null;
  const supabase = await createSupabaseServerClient();
  const { data: targets } = await supabase
    .from('targets')
    .select('id, company_name, tier')
    .order('company_name');
  return (
    <>
      <TopBar title="New Lead" showBack />
      <NewLeadForm currentUser={me} targets={targets ?? []} />
    </>
  );
}
