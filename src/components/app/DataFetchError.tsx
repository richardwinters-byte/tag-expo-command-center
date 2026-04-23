import { AlertCircle } from 'lucide-react';

/**
 * Inline banner shown when one or more data fetches on a page failed but
 * other parts loaded. Non-blocking — the user can still act on what loaded.
 */
export function DataFetchError({ message }: { message?: string }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-btn bg-tag-error/10 border border-tag-error/25 text-tag-error text-xs">
      <AlertCircle size={14} className="shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="font-semibold leading-tight">Couldn&apos;t load some data</div>
        <div className="text-tag-error/80 leading-tight mt-0.5">
          {message ?? 'Network hiccup — pull to refresh or try again in a moment.'}
        </div>
      </div>
    </div>
  );
}
