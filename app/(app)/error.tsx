'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Route-level error boundary for the authenticated app segment.
 * Next.js App Router routes any unhandled error in a server/client component
 * under (app)/ through this boundary. Keeps Richard from seeing a blank page
 * on the booth floor when Vegas Wi-Fi misbehaves.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log so it shows up in Vercel logs if this ever fires in prod.
    // eslint-disable-next-line no-console
    console.error('[app error boundary]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full bg-white dark:bg-[#132022] rounded-lg border border-hairline p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-tag-error/15 text-tag-error flex items-center justify-center">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-base font-semibold text-tag-ink mb-2">Something went wrong</h2>
        <p className="text-xs text-tag-cold mb-4 leading-relaxed">
          The page couldn&apos;t load. Usually this is a flaky connection on the floor.
          Tap retry first; if it keeps failing, try again in a minute.
        </p>
        {error.digest && (
          <p className="text-[10px] text-tag-cold/70 font-mono mb-4 truncate">
            ref {error.digest}
          </p>
        )}
        <div className="flex items-center gap-2 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-btn bg-tag-900 text-white text-sm font-medium hover:bg-tag-700 transition-colors"
          >
            <RefreshCw size={14} />
            Retry
          </button>
          <a
            href="/today"
            className="inline-flex items-center px-4 py-2 rounded-btn border border-hairline text-sm font-medium text-tag-ink hover:bg-tag-50 transition-colors"
          >
            Go to Today
          </a>
        </div>
      </div>
    </div>
  );
}
