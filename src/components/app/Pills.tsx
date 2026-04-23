import { cn } from '@/lib/utils';

export const TRACK_COLORS: Record<string, string> = {
  entertainment_ip: '#7C3AED',
  sports: '#059669',
  cpg_backflip: '#EA580C',
  japanese_ip: '#DC2626',
  retail: '#2563EB',
  agent: '#475569',
  competitor: '#475569',
  new_surfaced: '#0891B2',
};

export const TRACK_LABELS: Record<string, string> = {
  entertainment_ip: 'Entertainment & IP',
  sports: 'Sports',
  cpg_backflip: 'CPG / Backflip',
  japanese_ip: 'Japanese IP',
  retail: 'Retail',
  agent: 'Licensing Agent',
  competitor: 'Competitor',
  new_surfaced: 'Newly Surfaced',
};

export function trackColor(track: string): string {
  return TRACK_COLORS[track] ?? '#14595B';
}

export function trackLabel(track: string): string {
  return TRACK_LABELS[track] ?? track;
}

export function TemperaturePill({ temp }: { temp: 'cold' | 'warm' | 'hot' }) {
  if (temp === 'hot') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-white shadow-sm"
        style={{ background: 'linear-gradient(90deg, #DC2626, #E11D48)' }}
      >
        <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
        hot
      </span>
    );
  }
  const cls = temp === 'warm' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-gray-100 text-gray-700';
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider', cls)}>
      {temp}
    </span>
  );
}

export function TierBadge({ tier }: { tier: string }) {
  return <span className={cn('tier-badge', `tier-${tier}`)}>{tier.replace(/_/g, ' ')}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const cls = priority === 'highest' ? 'bg-tag-gold text-white' :
    priority === 'high' ? 'bg-tag-gold/15 text-tag-gold-dark' :
    priority === 'moderate' ? 'bg-tag-100 text-tag-900' :
    'bg-tag-50 text-tag-cold';
  return <span className={cn('pill', cls)}>{priority}</span>;
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    not_contacted: 'bg-gray-100 text-gray-700',
    outreach_sent: 'bg-blue-50 text-blue-800',
    meeting_booked: 'bg-tag-gold/15 text-tag-gold-dark',
    met: 'bg-green-50 text-green-800',
    follow_up: 'bg-amber-50 text-amber-800',
    closed_won: 'bg-tag-success/15 text-tag-success',
    closed_lost: 'bg-red-50 text-red-800',
    dead: 'bg-gray-100 text-gray-500',
  };
  const label = status.replace(/_/g, ' ');
  return <span className={cn('pill capitalize', map[status] ?? 'bg-gray-100')}>{label}</span>;
}

export function UserAvatar({ name, color, size = 'sm' }: { name: string; color?: string | null; size?: 'sm' | 'md' }) {
  const parts = name.split(' ');
  const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  const sizeCls = size === 'md' ? 'w-8 h-8 text-xs' : 'w-6 h-6 text-[10px]';
  return (
    <div
      className={cn(sizeCls, 'rounded-full flex items-center justify-center text-white font-semibold shrink-0')}
      style={{ backgroundColor: color ?? '#14595B' }}
      title={name}
    >
      {initials.toUpperCase()}
    </div>
  );
}
