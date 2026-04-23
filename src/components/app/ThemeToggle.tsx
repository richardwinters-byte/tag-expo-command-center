'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

/**
 * Dark-mode toggle. Reads the user's preference from localStorage
 * on mount, falls back to `prefers-color-scheme`, and toggles the
 * `dark` class on <html>.
 */
export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (typeof window !== 'undefined'
      ? (localStorage.getItem('tag-theme') as Theme | null)
      : null);
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initial: Theme = stored ?? (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.classList.toggle('dark', initial === 'dark');
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('tag-theme', next);
    } catch {
      /* noop — private-mode Safari etc. */
    }
  };

  // Avoid flashing icons on first render before we know the stored value.
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={`${compact ? 'w-8 h-8' : 'w-9 h-9'} rounded-btn`}
        disabled
      />
    );
  }

  const Icon = theme === 'dark' ? Sun : Moon;
  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      className={`${compact ? 'w-8 h-8' : 'w-9 h-9'} flex items-center justify-center rounded-btn hover:bg-tag-100 dark:hover:bg-white/5 transition-colors`}
    >
      <Icon size={compact ? 16 : 18} className="text-tag-900 dark:text-white/90" />
    </button>
  );
}
