'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function RegenerateButton({ date }: { date: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function regenerate() {
    setLoading(true);
    const res = await fetch('/api/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date }) });
    setLoading(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert('Error: ' + (err.error ?? res.statusText));
      return;
    }
    router.refresh();
  }

  return (
    <button onClick={regenerate} disabled={loading} className="btn-outline btn-sm">
      {loading ? 'Compiling…' : 'Regenerate brief'}
    </button>
  );
}
