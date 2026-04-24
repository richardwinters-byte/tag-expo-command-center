'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { AnimatedBackground } from '@/components/app/AnimatedBackground';

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/today';
  const errorMsg = searchParams.get('error');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-tag-900 relative overflow-hidden">
      <AnimatedBackground />
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-black mb-6">
            <span className="text-white font-bold text-xl tracking-tight">TAG</span>
          </div>
          <h1 className="text-white text-2xl font-semibold tracking-tight">Expo Command Center</h1>
          <p className="text-tag-100 text-sm mt-2">Licensing Expo 2026 · May 19–21</p>
        </div>

        <div className="card card-p bg-white">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-tag-success font-medium mb-2">✓ Check your email</div>
              <p className="text-sm text-tag-cold">
                We sent a magic link to <span className="font-medium text-tag-ink">{email}</span>. Tap it to sign in.
              </p>
              <button
                type="button"
                onClick={() => { setSent(false); setEmail(''); }}
                className="mt-6 text-xs text-tag-700 underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              {(error || errorMsg) && (
                <div className="text-sm text-tag-error">
                  {error || errorMsg}
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
              <p className="text-[11px] text-tag-cold text-center pt-2">
                Team-only access · magic link sign-in
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-tag-900" />}>
      <LoginForm />
    </Suspense>
  );
}
