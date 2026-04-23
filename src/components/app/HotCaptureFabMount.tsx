'use client';

import { usePathname } from 'next/navigation';
import { HotCaptureFab } from './HotCaptureFab';

export function HotCaptureFabMount() {
  const pathname = usePathname();
  return <HotCaptureFab pathname={pathname ?? '/'} />;
}
