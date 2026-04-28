'use client';

import { useEffect, useRef, useState } from 'react';
import { Music, VolumeX } from 'lucide-react';

/**
 * VegasMusic — small toggle in the corner that plays a casino-jingle
 * synth loop via WebAudio. No audio file dependency. Uses a slot-machine
 * inspired major-pentatonic arpeggio over a sub bass thump on a 4-bar
 * loop. Volume capped low so it sits behind UI sounds.
 *
 * State persisted in localStorage so the user's choice rides across
 * sessions. Off by default (web autoplay policy + politeness).
 */

const NOTES = {
  // C major pentatonic-ish: C E G A C, plus B for casino sparkle
  C4: 261.63,
  E4: 329.63,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  E5: 659.25,
  G5: 783.99,
  A5: 880.0,
  C6: 1046.5,
  C2: 65.41,
  G2: 98.0,
  C3: 130.81,
};

// 16-step pattern, 250ms per step = 4-second loop
type Step = { note?: keyof typeof NOTES; bass?: keyof typeof NOTES; bell?: boolean };
const PATTERN: Step[] = [
  { note: 'C5', bass: 'C2', bell: true },
  { note: 'E5' },
  { note: 'G5' },
  { note: 'A5' },
  { note: 'C6', bass: 'G2' },
  { note: 'A5' },
  { note: 'G5' },
  { note: 'E5' },
  { note: 'A5', bass: 'C3', bell: true },
  { note: 'G5' },
  { note: 'E5' },
  { note: 'C5' },
  { note: 'B4', bass: 'G2' },
  { note: 'C5' },
  { note: 'E5' },
  { note: 'G5' },
];

const STEP_MS = 250;

export function VegasMusic() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const tickerRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  // Hydrate persisted preference
  useEffect(() => {
    try {
      if (localStorage.getItem('tag-vegas-music') === '1') setEnabled(true);
    } catch {}
  }, []);

  function playLead(freq: number, ctx: AudioContext, master: GainNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  function playBass(freq: number, ctx: AudioContext, master: GainNode) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  function playBell(ctx: AudioContext, master: GainNode) {
    const now = ctx.currentTime;
    [1318.5, 1975.5, 2637.0].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.05 - i * 0.015, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.connect(gain).connect(master);
      osc.start(now);
      osc.stop(now + 0.62);
    });
  }

  // Start / stop the loop when enabled flips
  useEffect(() => {
    if (!enabled) {
      if (tickerRef.current !== null) {
        clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
      try { ctxRef.current?.close(); } catch {}
      ctxRef.current = null;
      masterRef.current = null;
      return;
    }

    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0.4;
    master.connect(ctx.destination);
    ctxRef.current = ctx;
    masterRef.current = master;
    stepRef.current = 0;

    tickerRef.current = window.setInterval(() => {
      const i = stepRef.current % PATTERN.length;
      const step = PATTERN[i];
      const c = ctxRef.current;
      const m = masterRef.current;
      if (c && m) {
        if (step.note) playLead(NOTES[step.note], c, m);
        if (step.bass) playBass(NOTES[step.bass], c, m);
        if (step.bell) playBell(c, m);
      }
      stepRef.current = i + 1;
    }, STEP_MS);

    return () => {
      if (tickerRef.current !== null) {
        clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
      try { ctx.close(); } catch {}
    };
  }, [enabled]);

  function toggle() {
    setEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem('tag-vegas-music', next ? '1' : '0'); } catch {}
      return next;
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? 'Mute Vegas music' : 'Play Vegas music'}
      title={enabled ? 'Mute Vegas music' : 'Play Vegas music'}
      className="fixed left-4 z-40 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95"
      style={{
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
        backgroundColor: enabled ? '#C08A30' : 'rgba(11, 47, 49, 0.85)',
        color: '#FFFFFF',
        backdropFilter: 'blur(8px)',
      }}
    >
      {enabled ? <Music size={18} /> : <VolumeX size={18} />}
    </button>
  );
}
