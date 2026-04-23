export const metadata = {
  title: 'Offline · TAG Expo Command Center',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-tag-50">
      <div className="max-w-md w-full bg-white rounded-lg border border-hairline p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-tag-gold/20 text-tag-gold-dark flex items-center justify-center text-2xl">
          ⚡
        </div>
        <h1 className="text-lg font-semibold text-tag-ink mb-2">You&apos;re offline</h1>
        <p className="text-xs text-tag-cold mb-5 leading-relaxed">
          This page hasn&apos;t been cached yet. Try Today, Schedule, Leads, Intel,
          Debrief, or Morning — those work offline once you&apos;ve visited them with a connection.
        </p>
        <div className="flex items-center gap-2 justify-center flex-wrap">
          <a href="/today" className="px-3 py-1.5 rounded-btn bg-tag-900 text-white text-xs font-medium">Today</a>
          <a href="/schedule" className="px-3 py-1.5 rounded-btn border border-hairline text-tag-ink text-xs font-medium">Schedule</a>
          <a href="/leads" className="px-3 py-1.5 rounded-btn border border-hairline text-tag-ink text-xs font-medium">Leads</a>
          <a href="/intel" className="px-3 py-1.5 rounded-btn border border-hairline text-tag-ink text-xs font-medium">Intel</a>
          <a href="/debrief" className="px-3 py-1.5 rounded-btn border border-hairline text-tag-ink text-xs font-medium">Debrief</a>
          <a href="/morning" className="px-3 py-1.5 rounded-btn border border-hairline text-tag-ink text-xs font-medium">Morning</a>
        </div>
        <p className="mt-5 text-[10px] text-tag-cold/70">
          Captures queued while offline will sync when the connection returns.
        </p>
      </div>
    </div>
  );
}
