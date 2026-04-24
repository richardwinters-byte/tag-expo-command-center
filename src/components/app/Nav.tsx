'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, Target, Zap, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/today', label: 'Today', icon: Home },
  { href: '/schedule', label: 'Schedule', icon: Calendar },
  { href: '/leads', label: 'Leads', icon: Users },
  { href: '/targets', label: 'Targets', icon: Target },
  { href: '/more', label: 'More', icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#132022] border-t border-hairline z-30 safe-bottom">
      <div className="flex">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 nav-link',
                active ? 'nav-link-active' : 'nav-link-inactive'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
              <span>{label}</span>
              {active && <span className="h-0.5 w-6 bg-tag-gold rounded-full mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const desktopLinks = [
  { href: '/today', label: 'Today' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/map', label: 'Booth Map' },
  { href: '/targets', label: 'Targets' },
  { href: '/leads', label: 'Leads' },
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/intel', label: 'Intel' },
  { href: '/debrief', label: 'Debrief' },
  { href: '/morning', label: 'Morning Brief' },
  { href: '/report', label: 'Trip Report' },
  { href: '/settings', label: 'Settings' },
];

export function SideNav({ user }: { user: { name: string; role: string } }) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-60 lg:w-64 fixed left-0 top-0 bottom-0 bg-tag-900 text-white flex-col">
      <Link href="/today" className="w-full p-5 border-b border-white/10 hover:bg-white/5 transition-colors block">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center shadow-sm ring-1 ring-white/15">
            <span className="font-bold text-white text-sm tracking-wider">TAG</span>
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight text-white">Expo Command Center</div>
            <div className="text-[11px] text-tag-100/80">Licensing Expo 2026</div>
          </div>
        </div>
      </Link>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {desktopLinks.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'block px-3 py-2 rounded-btn text-sm transition-colors',
                active
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 text-xs">
        <div className="font-medium">{user.name}</div>
        <div className="text-white/60 capitalize">{user.role}</div>
      </div>
    </aside>
  );
}
