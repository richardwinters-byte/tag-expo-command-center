import { createSupabaseServerClient, getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { BoothMap } from '@/components/app/BoothMap';
import { todayInVegas } from '@/lib/utils';
import Link from 'next/link';
import type { Meeting, Tier } from '@/lib/types';

export const dynamic = 'force-dynamic';

const DAYS = [
  { iso: '2026-05-19', label: 'Tue' },
  { iso: '2026-05-20', label: 'Wed' },
  { iso: '2026-05-21', label: 'Thu' },
];

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; booth?: string; target?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) return null;
  const supabase = await createSupabaseServerClient();
  const params = await searchParams;
  const today = todayInVegas();
  // Default to today if it's within the show window; otherwise first show day
  const windowDays = DAYS.map((d) => d.iso);
  const date = params.date ?? (windowDays.includes(today) ? today : DAYS[0].iso);
  const focusBooth = params.booth?.trim() || undefined;
  const focusTarget = params.target?.trim() || undefined;

  const { data: meetings } = await supabase
    .from('meetings')
    .select('*, target:target_id(company_name, tier)')
    .or(`owner_id.eq.${me.id},attendee_ids.cs.{${me.id}}`)
    .gte('start_at', '2026-05-18T00:00:00-07:00')
    .lte('start_at', '2026-05-21T23:59:59-07:00')
    .order('start_at');

  return (
    <>
      <TopBar title="Booth Map" subtitle="Mandalay Bay Expo Hall" />
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-5 md:py-8">
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar scroll-fade-r -mx-4 px-4 md:mx-0 md:px-0">
          {DAYS.map((d) => (
            <Link
              key={d.iso}
              href={`/map?date=${d.iso}${focusBooth ? `&booth=${encodeURIComponent(focusBooth)}` : ''}${focusTarget ? `&target=${encodeURIComponent(focusTarget)}` : ''}`}
              className={`shrink-0 px-4 py-2 rounded-btn text-sm font-medium border ${
                d.iso === date ? 'bg-tag-900 text-white border-tag-900' : 'bg-white border-hairline text-tag-ink'
              }`}
            >
              {d.label} · {new Date(d.iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Link>
          ))}
        </div>
        <BoothMap
          meetings={(meetings ?? []) as (Meeting & { target?: { company_name: string; tier: Tier } | null })[]}
          date={date}
          focusBooth={focusBooth}
          focusTarget={focusTarget}
        />
      </div>
    </>
  );
}
