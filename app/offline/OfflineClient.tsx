'use client';

export function OfflineClient() {
  return (
    <div className="max-w-md w-full bg-white rounded-lg border border-hairline p-6 text-center motion-scale-in">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-tag-gold/20 text-tag-gold-dark flex items-center justify-center text-2xl animate-pulse">
        ⚡
      </div>
      <h1 className="text-lg font-semibold text-tag-ink mb-2">You&apos;re offline</h1>
      <p className="text-xs text-tag-cold mb-5 leading-relaxed">
        Reconnect to load this page. Captures you make while offline are queued
        and sent the next time you have a connection.
      </p>
      <div className="flex items-center gap-2 justify-center flex-wrap">
        <a href="/today" className="px-3 py-1.5 rounded-btn bg-tag-900 text-white text-xs font-medium">Today</a>
        <a href="/schedule" className="px-3 py-1.5 rounded-btn border border-hairline text-tag-ink text-xs font-medium">Schedule</a>
        <a href="/leads" className="px-3 py-1.5 rounded-btn border border-hairline text-tag-ink text-xs font-medium">Leads</a>
        <a href="/intel" className="px-3 py-1.5 rounded-btn border border-hairline text-tag-ink text-xs font-medium">Intel</a>
        <a href="/debrief" className="px-3 py-1.5 rounded-btn border border-hairline text-tag-ink text-xs font-medium">Debrief</a>
        <a href="/morning" className="px-3 py-1.5 rounded-btn border border-hairline text-tag-ink text-xs font-medium">Morning</a>
      </div>
      <button className="btn-outline btn-sm mt-4" onClick={() => window.location.reload()}>
        Retry connection
      </button>
    </div>
  );
}
