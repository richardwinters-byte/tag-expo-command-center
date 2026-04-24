'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { MapPin, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { Meeting, Tier } from '@/lib/types';
import { formatDistanceToNowStrict } from 'date-fns';
import { toZonedTime, format as tzFormat } from 'date-fns-tz';

type BoothMapProps = {
  meetings: (Meeting & { target?: { company_name: string; tier: Tier } | null })[];
  date: string;
};

const TZ = 'America/Los_Angeles';
function hmLA(iso: string) {
  return tzFormat(toZonedTime(iso, TZ), 'h:mm a', { timeZone: TZ });
}

type TierFilter = 'all' | 'tier_1' | 'tier_2' | 'tier_3' | 'nice_to_meet';

const TIER_LABEL: Record<TierFilter, string> = {
  all: 'All',
  tier_1: 'Tier 1',
  tier_2: 'Tier 2',
  tier_3: 'Tier 3',
  nice_to_meet: 'Nice to meet',
};

function tierColor(tier: Tier | undefined | null): string {
  if (tier === 'tier_1') return '#C08A30';
  if (tier === 'tier_2') return '#14595B';
  return '#6B7280';
}

export function BoothMap({ meetings, date }: BoothMapProps) {
  const [filter, setFilter] = useState<TierFilter>('all');

  const dayMeetings = useMemo(() => {
    return meetings
      .filter((m) => m.start_at.slice(0, 10) === date)
      .filter((m) => filter === 'all' || m.target?.tier === filter)
      .sort((a, b) => a.start_at.localeCompare(b.start_at));
  }, [meetings, date, filter]);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-hairline flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-tag-gold-dark">Booth Map</div>
          <h3 className="text-sm font-semibold leading-tight">
            Mandalay Bay · Bayside Halls A–D
            {dayMeetings.length > 0 && <> · {dayMeetings.length} meeting{dayMeetings.length === 1 ? '' : 's'}</>}
          </h3>
        </div>
        <div className="text-[10px] text-tag-cold flex items-center gap-1">
          <MapPin size={12} />
          <span>Tap & drag to pan · pinch to zoom</span>
        </div>
      </div>

      {/* Tier filter chips */}
      <div className="px-4 py-2 border-b border-hairline flex items-center gap-2 overflow-x-auto no-scrollbar">
        {(Object.keys(TIER_LABEL) as TierFilter[]).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
              filter === k
                ? 'bg-tag-900 text-white border border-tag-900'
                : 'bg-white border border-hairline text-tag-ink hover:bg-tag-50'
            }`}
          >
            {TIER_LABEL[k]}
          </button>
        ))}
      </div>

      {/* Zoomable floor plan */}
      <div className="bg-[#f6f7f8] relative" style={{ height: 440 }}>
        <TransformWrapper
          initialScale={1}
          minScale={0.7}
          maxScale={5}
          centerOnInit
          wheel={{ step: 0.12 }}
          doubleClick={{ mode: 'zoomIn', step: 0.6 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute right-3 top-3 z-10 flex flex-col gap-1">
                <button
                  onClick={() => zoomIn()}
                  aria-label="Zoom in"
                  className="w-8 h-8 rounded-btn bg-white border border-hairline shadow-float flex items-center justify-center hover:bg-tag-50"
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  onClick={() => zoomOut()}
                  aria-label="Zoom out"
                  className="w-8 h-8 rounded-btn bg-white border border-hairline shadow-float flex items-center justify-center hover:bg-tag-50"
                >
                  <ZoomOut size={15} />
                </button>
                <button
                  onClick={() => resetTransform()}
                  aria-label="Reset view"
                  className="w-8 h-8 rounded-btn bg-white border border-hairline shadow-float flex items-center justify-center hover:bg-tag-50"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{ width: '100%', height: '100%' }}
              >
                <Image
                  src="/floorplan.jpg"
                  alt="Licensing Expo 2026 floor plan · Mandalay Bay Bayside Halls A-D"
                  width={1522}
                  height={1297}
                  priority
                  className="select-none max-w-none"
                  draggable={false}
                />
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Walking route / meeting list */}
      <div className="border-t border-hairline divide-y divide-hairline">
        <div className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-tag-gold-dark">
          {filter === 'all' ? 'Your meetings this day' : `Filter: ${TIER_LABEL[filter]}`}
        </div>
        {dayMeetings.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-tag-cold">
            No meetings{filter !== 'all' ? ` matching ${TIER_LABEL[filter]}` : ''} on this day.
          </div>
        )}
        {dayMeetings.map((m, i) => {
          const color = tierColor(m.target?.tier);
          const now = Date.now();
          const start = new Date(m.start_at).getTime();
          const end = new Date(m.end_at).getTime();
          const live = now >= start && now <= end;
          const done = m.status === 'completed' || now > end;
          return (
            <Link
              key={m.id}
              href={`/schedule/${m.id}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-tag-50 dark:hover:bg-white/5 transition-colors"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                style={{ backgroundColor: color }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate leading-tight">{m.title}</div>
                <div className="text-[11px] text-tag-cold truncate">
                  {hmLA(m.start_at)}
                  {m.location && <> · {m.location}</>}
                  {m.target?.company_name && <> · {m.target.company_name}</>}
                </div>
              </div>
              {live && (
                <span
                  className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full text-white shrink-0 pulse-live"
                  style={{ backgroundColor: '#C08A30' }}
                >
                  ● LIVE
                </span>
              )}
              {done && !live && (
                <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full shrink-0 text-tag-cold border border-hairline">
                  DONE
                </span>
              )}
              {!live && !done && (
                <span className="text-[10px] text-tag-cold shrink-0">
                  {formatDistanceToNowStrict(new Date(m.start_at), { addSuffix: true })}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="px-4 py-2 border-t border-hairline text-[10px] text-tag-cold text-center">
        Floor plan · licensing26.mapyourshow.com · captured {new Date().toISOString().slice(0, 10)}
      </div>
    </div>
  );
}
