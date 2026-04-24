import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase-server';
import { BottomNav, SideNav } from '@/components/app/Nav';
import { HotCaptureFabMount } from '@/components/app/HotCaptureFabMount';
import { NextUpBanner } from '@/components/app/NextUpBanner';
import { CommandPalette } from '@/components/app/CommandPalette';
import { AmbientBackground } from '@/components/app/AmbientBackground';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-tag-50 relative">
      <AmbientBackground />
      <SideNav user={{ name: user.name, role: user.role }} />
      <div className="md:pl-60 lg:pl-64 min-h-screen pb-[calc(env(safe-area-inset-bottom)+5.5rem)] md:pb-0 relative">
        {/* Desktop-only banner — mobile gets it via TopBar's bottom row */}
        <div className="hidden md:block sticky top-0 z-30">
          <NextUpBanner />
        </div>
        <div className="page-enter">
          {children}
        </div>
      </div>
      <BottomNav />
      <HotCaptureFabMount />
      <CommandPalette />
    </div>
  );
}
