'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

/**
 * Wraps a textarea/input with a mic button that dictates text via Web Speech API.
 * Appends (not replaces) so users can edit during dictation.
 *
 * Browser support: Chrome, Edge, Safari 14+, Android WebView. Firefox is currently unsupported.
 * On unsupported browsers the button is hidden entirely.
 */

// Minimal types for the experimental Web Speech API — not in lib.dom.d.ts
interface SpeechRecognitionAlternative { transcript: string; confidence: number }
interface SpeechRecognitionResult { 0: SpeechRecognitionAlternative; isFinal: boolean; length: number }
interface SpeechRecognitionResultList { length: number; item(i: number): SpeechRecognitionResult; [i: number]: SpeechRecognitionResult }
interface SpeechRecognitionEvent extends Event { resultIndex: number; results: SpeechRecognitionResultList }
interface SpeechRecognitionErrorEvent extends Event { error: string }
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: ((e: Event) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
}
interface SpeechRecognitionCtor { new (): SpeechRecognition }

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceButton({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (next: string) => void;
  compact?: boolean;
}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const baseTextRef = useRef<string>('');
  const interimRef = useRef<string>('');

  useEffect(() => {
    setSupported(getRecognitionCtor() !== null);
  }, []);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    setError(null);
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    baseTextRef.current = value;
    interimRef.current = '';

    rec.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }
      if (finalTranscript) {
        // Append finalized segment to base (leaving a space if base has content)
        const sep = baseTextRef.current && !baseTextRef.current.endsWith(' ') && !baseTextRef.current.endsWith('\n') ? ' ' : '';
        baseTextRef.current = `${baseTextRef.current}${sep}${finalTranscript.trim()}`;
      }
      interimRef.current = interim;
      // Show base + live interim
      const sep = baseTextRef.current && interim && !baseTextRef.current.endsWith(' ') ? ' ' : '';
      onChange(`${baseTextRef.current}${sep}${interim}`);
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'no-speech') return; // benign — browser just didn't hear anything
      if (e.error === 'aborted') return;
      if (e.error === 'not-allowed') {
        setError('Microphone permission denied.');
      } else if (e.error === 'network') {
        setError('Voice needs network connection.');
      } else {
        setError(`Voice error: ${e.error}`);
      }
      setListening(false);
    };

    rec.onend = () => {
      // Commit final state (strip any lingering interim)
      onChange(baseTextRef.current);
      setListening(false);
    };

    try {
      rec.start();
      recognitionRef.current = rec;
      setListening(true);
    } catch {
      setError('Could not start mic.');
    }
  }, [value, onChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const rec = recognitionRef.current;
      if (rec) {
        try { rec.abort(); } catch { /* ignore */ }
      }
    };
  }, []);

  if (!supported) return null;

  if (error) {
    return (
      <button
        type="button"
        onClick={() => setError(null)}
        className={`inline-flex items-center gap-1 text-[10px] text-tag-error ${compact ? '' : 'px-2 py-1'}`}
        aria-label="Voice error — tap to dismiss"
      >
        <AlertCircle size={12} /> {error}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={listening ? stop : start}
      aria-label={listening ? 'Stop dictation' : 'Start voice dictation'}
      className={`inline-flex items-center gap-1 rounded-full transition-colors ${
        compact ? 'w-7 h-7 justify-center' : 'px-2.5 py-1 text-[11px] font-medium'
      } ${
        listening
          ? 'bg-tag-error text-white'
          : 'bg-tag-50 text-tag-700 hover:bg-tag-100 dark:bg-white/5 dark:hover:bg-white/10'
      }`}
      style={listening ? { animation: 'pulse 1.4s ease-in-out infinite' } : undefined}
    >
      {listening ? <MicOff size={compact ? 14 : 12} /> : <Mic size={compact ? 14 : 12} />}
      {!compact && (listening ? 'Stop' : 'Dictate')}
    </button>
  );
}

/**
 * Drop-in replacement for a labeled textarea with a voice button in the label row.
 */
export function VoiceTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="block text-xs font-medium text-tag-700 uppercase tracking-wider">
          {label}
        </label>
        <VoiceButton value={value} onChange={onChange} />
      </div>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full"
      />
      {hint && <p className="text-[11px] text-tag-cold mt-1">{hint}</p>}
    </div>
  );
}
