'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Send } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { UserAvatar } from '@/components/app/Pills';
import type { User } from '@/lib/types';
import { getErrorMessage } from '@/lib/utils';

type Allowlist = { email: string; name: string; role: string; color: string };

export function SettingsClient({
  me,
  allowlist,
  users,
}: {
  me: User;
  allowlist: Allowlist[];
  users: User[];
}) {
  const router = useRouter();
  const [name, setName] = useState(me.name);
  const [color, setColor] = useState(me.color ?? '#14595B');
  const [phone, setPhone] = useState(me.phone ?? '');
  const [signature, setSignature] = useState(me.signature ?? '');
  const [savingProfile, setSavingProfile] = useState(false);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('users').update({ name, color, phone, signature }).eq('id', me.id);
      if (error) {
        alert(getErrorMessage(error, 'Failed to save profile.'));
        return;
      }
      router.refresh();
    } finally {
      setSavingProfile(false);
    }
  }

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    const reg = await navigator.serviceWorker?.ready;
    reg?.active?.postMessage({ type: 'CLEAR_AUTH_CACHE' });
    window.location.href = '/login';
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-5 md:py-8 space-y-6">
      {/* Profile */}
      <section>
        <div className="section-header">Your profile</div>
        <div className="card card-p space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <UserAvatar name={name} color={color} size="md" />
            <div>
              <div className="text-sm font-medium">{me.email}</div>
              <div className="text-[11px] text-tag-cold capitalize">{me.role}</div>
            </div>
          </div>
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
          </Field>
          <Field label="Accent color (calendar tint)">
            <div className="flex gap-2 flex-wrap">
              {['#0B2F31', '#14595B', '#C08A30', '#2F7D5B', '#8B2A1F', '#6B7280'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-tag-ink' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </Field>
          <Field label="Phone">
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full" />
          </Field>
          <Field label="Email signature (used in follow-up drafts)">
            <textarea value={signature} onChange={(e) => setSignature(e.target.value)} rows={3} className="w-full" placeholder="Richard Winterstern&#10;Lead of Growth & Partnerships, TAG Grading&#10;richard@taggrading.com · (555) 000-0000" />
          </Field>
          <button onClick={saveProfile} disabled={savingProfile} className="btn-primary w-full">
            {savingProfile ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </section>

      {/* Team members */}
      <section>
        <div className="section-header">Team members</div>
        <div className="card">
          <ul className="divide-y divide-hairline">
            {users.map((u) => (
              <li key={u.id} className="p-3 flex items-center gap-3">
                <UserAvatar name={u.name} color={u.color} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{u.name}</div>
                  <div className="text-xs text-tag-cold truncate">{u.email}</div>
                </div>
                <span className="pill bg-tag-50 text-tag-700 capitalize">{u.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Admin: allowlist + invite */}
      {me.role === 'admin' && (
        <AllowlistAdmin allowlist={allowlist} users={users} />
      )}

      {/* Sign out */}
      <button onClick={signOut} className="btn-ghost text-tag-error">
        <LogOut size={14} /> Sign out
      </button>
    </div>
  );
}

function AllowlistAdmin({ allowlist, users }: { allowlist: Allowlist[]; users: User[] }) {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [inviting, setInviting] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function sendMagicLink(email: string) {
    setInviting(email);
    const supabase = createSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    });
    setInviting(null);
    alert(error ? getErrorMessage(error, 'Failed to send magic link.') : `Magic link sent to ${email}`);
  }

  async function addAllowlistEntry() {
    if (!newEmail.trim() || !newName.trim()) return;
    setAdding(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('allowlist').insert({
        email: newEmail.trim().toLowerCase(),
        name: newName.trim(),
        role: 'member',
      });
      if (error) {
        alert(getErrorMessage(error, 'Failed to add allowlist entry.'));
        return;
      }
      setNewEmail('');
      setNewName('');
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  const signedIn = new Set(users.map((u) => u.email.toLowerCase()));

  return (
    <section>
      <div className="section-header">Allowlist · Invite team</div>
      <div className="card card-p space-y-3 mb-3">
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1"
          />
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1"
          />
        </div>
        <button onClick={addAllowlistEntry} disabled={adding} className="btn-primary">
          {adding ? 'Adding…' : 'Add to allowlist'}
        </button>
      </div>
      <div className="card">
        <ul className="divide-y divide-hairline">
          {allowlist.map((a) => {
            const hasSignedIn = signedIn.has(a.email.toLowerCase());
            return (
              <li key={a.email} className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{a.name}</div>
                  <div className="text-xs text-tag-cold truncate">{a.email}</div>
                </div>
                {hasSignedIn ? (
                  <span className="pill bg-tag-success/15 text-tag-success">✓ Signed in</span>
                ) : (
                  <button
                    onClick={() => sendMagicLink(a.email)}
                    disabled={inviting === a.email}
                    className="btn-outline btn-sm"
                  >
                    <Send size={12} />
                    {inviting === a.email ? 'Sending…' : 'Send link'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-tag-700 uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  );
}
