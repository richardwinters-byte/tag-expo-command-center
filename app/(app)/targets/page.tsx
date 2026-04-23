import { createSupabaseServerClient } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { DataFetchError } from '@/components/app/DataFetchError';
import { TargetsClient } from './TargetsClient';
import type { Target } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function TargetsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: targets, error: targetsError } = await supabase
    .from('targets')
    .select('*')
    .order('priority', { ascending: true });

  if (targetsError) {
    // eslint-disable-next-line no-console
    console.error('[targets] fetch error', targetsError);
  }

  const list = (targets ?? []) as Target[];

  return (
    <>
      <TopBar title="Targets" subtitle={`${list.length} companies · strategic target list`} />
      {targetsError && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4">
          <DataFetchError />
        </div>
      )}
      <TargetsClient targets={list} />
    </>
  );
}
