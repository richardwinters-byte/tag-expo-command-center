'use client';

import { useEffect, useState } from 'react';
import { Download, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function PwaStatus() {
  const [online, setOnline] = useState(true);
  const [state, setState] = useState<'idle' | 'offline-ready' | 'syncing' | 'sync-complete'>('idle');
  const [deferredInstall, setDeferredInstall] = useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => {
      setOnline(true);
      setState('syncing');
      setTimeout(() => setState('sync-complete'), 1000);
      setTimeout(() => setState('idle'), 3000);
    };
    const onOffline = () => setOnline(false);
    const onSWMessage = (e: MessageEvent<{ type?: string }>) => {
      if (e.data?.type === 'offline-ready') {
        setState('offline-ready');
        setTimeout(() => setState('idle'), 2800);
      }
      if (e.data?.type === 'sync-complete') {
        setState('sync-complete');
        setTimeout(() => setState('idle'), 2000);
      }
    };
    const onInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstall(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    navigator.serviceWorker?.addEventListener('message', onSWMessage as EventListener);
    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      navigator.serviceWorker?.removeEventListener('message', onSWMessage as EventListener);
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
    };
  }, []);

  async function install() {
    if (!deferredInstall) return;
    await deferredInstall.prompt();
    await deferredInstall.userChoice;
    setDeferredInstall(null);
  }

  const showInstall = deferredInstall && !installDismissed;
  if (online && state === 'idle' && !showInstall) return null;

  const style =
    !online
      ? 'bg-tag-error text-white'
      : state === 'syncing'
        ? 'bg-tag-700 text-white'
        : 'bg-tag-success text-white';

  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-[calc(env(safe-area-inset-top)+10px)] z-40">
      {!showInstall ? (
        <div className={`rounded-full px-3 py-1.5 text-xs font-medium shadow-md inline-flex items-center gap-1.5 ${style}`}>
          {!online && <WifiOff size={13} />}
          {online && state === 'syncing' && <RefreshCw size={13} className="animate-spin" />}
          {online && state !== 'syncing' && <CheckCircle2 size={13} />}
          {!online ? 'Offline mode' : state === 'offline-ready' ? 'Available offline' : state === 'syncing' ? 'Syncing…' : 'Synced'}
        </div>
      ) : (
        <div className="rounded-full px-3 py-1.5 text-xs font-medium shadow-md inline-flex items-center gap-2 bg-tag-900 text-white">
          <Download size={13} />
          Install app
          <button className="underline" onClick={install}>Install</button>
          <button className="opacity-70" onClick={() => setInstallDismissed(true)}>Dismiss</button>
        </div>
      )}
    </div>
  );
}
