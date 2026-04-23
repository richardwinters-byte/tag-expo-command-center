import Link from 'next/link';
import { getCurrentUser } from '@/lib/supabase-server';
import { TopBar } from '@/components/app/TopBar';
import { Zap, FileEdit, Sun, FileText, Settings, MapPin, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MorePage() {
  const me = await getCurrentUser();
  const items = [
    { href: '/intel', icon: Zap, label: 'Intel', desc: 'Competitive intel log' },
    { href: '/debrief', icon: FileEdit, label: 'Debrief', desc: 'Daily debrief submission' },
    { href: '/map', icon: MapPin, label: 'Booth Map', desc: 'Today\'s walking route' },
    { href: '/morning', icon: Sun, label: 'Morning Brief', desc: 'Today\'s compiled brief' },
    { href: '/pipeline', icon: TrendingUp, label: 'Pipeline', desc: 'Post-show momentum' },
    ...(me?.role === 'admin' ? [{ href: '/report', icon: FileText, label: 'Trip Report', desc: 'Executive trip report' }] : []),
    { href: '/settings', icon: Settings, label: 'Settings', desc: 'Profile & team' },
  ];

  return (
    <>
      <TopBar title="More" />
      <div className="max-w-3xl mx-auto px-4 py-5 space-y-2">
        {items.map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href} className="card card-p flex items-center gap-3 hover:bg-tag-50">
            <div className="w-9 h-9 rounded-btn bg-tag-50 flex items-center justify-center">
              <Icon size={18} className="text-tag-700" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs text-tag-cold">{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
