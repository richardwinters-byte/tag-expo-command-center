'use client';

import { useEffect, useRef, useState } from 'react';
import { Music, VolumeX } from 'lucide-react';

/**
 * VegasMusic — small toggle that plays an upbeat casino groove via
 * Web Audio (no audio file). 4-on-the-floor kick, snare on 2 & 4,
 * shimmering hi-hat, walking bass, and a major-pentatonic lead
 * arpeggio that flies. ~120 BPM, 16-step / 2-bar loop.
 *
 * Off by default (autoplay policy + politeness). Preference saved
 * to localStorage so the user's choice rides across sessions.
 */

// 16th notes at 120 BPM
const STEP_MS = 125;

// Major pentatonic in C
const N = {
  // Lead
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, G6: 1567.98, A6: 1760.0,
  // Bass
  C2: 65.41, E2: 82.41, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.0,
};

// Patterns are 16 steps each (one per beat-step at 16th-note grid).
// 1 = play, 0 = rest. Bass and lead use note arrays.
const KICK_PATTERN = [1,0,0,0, 1,0,0,1, 1,0,0,0, 1,0,1,0]; // 4-on-the-floor with sparkle
const SNARE_PATTERN = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1];
const HAT_PATTERN  = [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1];
const HAT_OPEN     = [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,1];

const BASS_NOTES: (keyof typeof N | null)[] = [
  'C2', null, 'C3', null,  'G2', null, null, 'C2',
  'A2', null, 'A2', null,  'G2', null, 'E2', 'D3',
];
const LEAD_NOTES: (keyof typeof N | null)[] = [
  'C5', 'E5', 'G5', 'A5',  'C6', 'A5', 'G5', 'E5',
  'A5', 'G5', 'E5', 'D5',  'G5', 'A5', 'C6', 'E6',
];

export function VegasMusic() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const tickerRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  useEffect(() => {
    try {
      if (localStorage.getItem('tag-vegas-music') === '1') setEnabled(true);
    } catch {}
  }, []);

  function kick(ctx: AudioContext, master: GainNode) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  function snare(ctx: AudioContext, master: GainNode) {
    const now = ctx.currentTime;
    // Noise burst
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1500;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    src.connect(filter).connect(gain).connect(master);
    src.start(now);
    // Tone for body
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 200;
    og.gain.setValueAtTime(0.18, now);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(og).connect(master);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  function hat(ctx: AudioContext, master: GainNode, open: boolean) {
    const now = ctx.currentTime;
    const buf = ctx.createBuffer(1, ctx.sampleRate * (open ? 0.18 : 0.05), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(open ? 0.16 : 0.10, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (open ? 0.18 : 0.05));
    src.connect(filter).connect(gain).connect(master);
    src.start(now);
  }

  function bass(freq: number, ctx: AudioContext, master: GainNode) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.18);
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(filter).connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  function lead(freq: number, ctx: AudioContext, master: GainNode) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.10, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain).connect(master);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  function bell(ctx: AudioContext, master: GainNode) {
    const now = ctx.currentTime;
    [1318.5, 1975.5, 2637.0].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06 - i * 0.018, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.connect(gain).connect(master);
      osc.start(now);
      osc.stop(now + 0.62);
    });
  }

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
    master.gain.value = 0.35;
    master.connect(ctx.destination);
    ctxRef.current = ctx;
    masterRef.current = master;
    stepRef.current = 0;

    tickerRef.current = window.setInterval(() => {
      const i = stepRef.current % 16;
      const c = ctxRef.current;
      const m = masterRef.current;
      if (c && m) {
        if (KICK_PATTERN[i]) kick(c, m);
        if (SNARE_PATTERN[i]) snare(c, m);
        if (HAT_PATTERN[i]) hat(c, m, !!HAT_OPEN[i]);
        const b = BASS_NOTES[i];
        if (b) bass(N[b], c, m);
        const l = LEAD_NOTES[i];
        if (l) lead(N[l], c, m);
        // Bell every 8 steps for casino sparkle
        if (i % 8 === 0) bell(c, m);
      }
      stepRef.current = (i + 1) % 16;
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
