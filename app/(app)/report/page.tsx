import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { DataFetchError } from '@/components/app/DataFetchError';
import { TripReportClient } from './TripReportClient';

export const dynamic = 'force-dynamic';

export default async function TripReport() {
  const me = await getCurrentUser();
  if (!me) return null;
  if (me.role !== 'admin') {
    return <div className="p-8 text-center text-tag-cold">Admins only.</div>;
  }
  const supabase = await createSupabaseServerClient();

  const [targets, leads, meetings, intel, users, debriefs, attachments] = await Promise.all([
    supabase.from('targets').select('*'),
    supabase.from('leads').select('*, owner:owner_id(name)'),
    supabase.from('meetings').select('*, target:target_id(company_name, tier), owner:owner_id(name)').gte('start_at', '2026-05-18').lte('start_at', '2026-05-22'),
    supabase.from('intel').select('*, target:target_id(company_name)'),
    supabase.from('users').select('*'),
    supabase.from('debriefs').select('*, users(name)'),
    supabase.from('attachments').select('id'),
  ]);

  const anyError =
    targets.error || leads.error || meetings.error || intel.error ||
    users.error || debriefs.error || attachments.error;
  if (anyError) {
    // eslint-disable-next-line no-console
    console.error('[report] fetch error', {
      targets: targets.error, leads: leads.error, meetings: meetings.error,
      intel: intel.error, users: users.error, debriefs: debriefs.error,
      attachments: attachments.error,
    });
  }

  return (
    <>
      <TopBar title="Trip Report" subtitle="Exec summary + PDF export" />
      {anyError && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 pt-4">
          <DataFetchError />
        </div>
      )}
      <TripReportClient
        targets={targets.data ?? []}
        leads={leads.data ?? []}
        meetings={meetings.data ?? []}
        intel={intel.data ?? []}
        users={users.data ?? []}
        debriefs={debriefs.data ?? []}
        attachmentCount={attachments.data?.length ?? 0}
      />
    </>
  );
}
