'use client';

import { useEffect } from 'react';
import { X, Users as UsersIcon, Sparkles, Target as TargetIcon } from 'lucide-react';
import type { Target } from '@/lib/types';

export function CheatSheetOverlay({
  target,
  meetingTitle,
  meetingTime,
  onClose,
}: {
  target: Target;
  meetingTitle?: string;
  meetingTime?: string;
  onClose: () => void;
}) {
  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-tag-50 dark:bg-[#0A1415] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-tag-50/95 dark:bg-[#0A1415]/95 backdrop-blur-md border-b border-hairline px-4 py-3 flex items-center gap-3 min-h-[56px]">
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 flex items-center justify-center rounded-btn hover:bg-tag-100 dark:hover:bg-white/5 -ml-2"
        >
          <X size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-tag-gold-dark">
            Pre-meeting cheat sheet
          </div>
          <h1 className="text-base font-semibold leading-tight truncate">{target.company_name}</h1>
          {meetingTime && <p className="text-xs text-tag-cold truncate font-mono">{meetingTime}{meetingTitle ? ` · ${meetingTitle}` : ''}</p>}
        </div>
      </div>

      {/* Content — large type, scan-friendly */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-5 py-6 space-y-6">
        {/* Opener — biggest, most prominent */}
        {target.opener && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-tag-gold" />
              <div className="text-[11px] font-semibold uppercase tracking-wider text-tag-gold-dark">Opener</div>
            </div>
            <div
              className="rounded-xl p-5 md:p-6"
              style={{ backgroundColor: '#0B2F31' }}
            >
              <p className="text-[18px] md:text-[20px] leading-snug italic text-white font-medium" style={{ fontFamily: 'Georgia, serif' }}>
                &ldquo;{target.opener}&rdquo;
              </p>
            </div>
          </section>
        )}

        {/* Proof point */}
        {target.proof_point && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-tag-700">Proof point</div>
            </div>
            <div className="card card-p">
              <p className="text-[15px] leading-relaxed">{target.proof_point}</p>
            </div>
          </section>
        )}

        {/* Pitch angle */}
        {target.pitch_angle && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <TargetIcon size={14} className="text-tag-700" />
              <div className="text-[11px] font-semibold uppercase tracking-wider text-tag-700">Pitch angle</div>
            </div>
            <div className="card card-p">
              <p className="text-[15px] leading-relaxed">{target.pitch_angle}</p>
            </div>
          </section>
        )}

        {/* Key contacts */}
        {target.key_contacts && target.key_contacts.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <UsersIcon size={14} className="text-tag-700" />
              <div className="text-[11px] font-semibold uppercase tracking-wider text-tag-700">Key contacts</div>
            </div>
            <div className="card">
              <ul className="divide-y divide-hairline">
                {target.key_contacts.map((c, i) => (
                  <li key={i} className="p-3">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-tag-cold">{c.title}</div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Notes — compact, de-emphasized, but included */}
        {target.notes && (
          <section>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-tag-cold mb-2">Notes</div>
            <div className="card card-p">
              <p className="text-[13px] leading-relaxed text-tag-cold">{target.notes}</p>
            </div>
          </section>
        )}

        {/* Booth reference */}
        {target.booth_number && (
          <div className="text-center text-xs text-tag-cold pt-2 pb-6">
            Booth <span className="font-mono font-semibold text-tag-ink dark:text-tag-50">{target.booth_number}</span>
          </div>
        )}
      </div>
    </div>
  );
}
