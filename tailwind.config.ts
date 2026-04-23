import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tag: {
          // Primary dark teal - headers, primary buttons, nav
          900: '#0B2F31',
          800: '#0E3B3C',
          700: '#14595B',
          // Accent gold - CTAs, status highlights, Hot tag
          gold: '#C08A30',
          'gold-dark': '#A0721F',
          'gold-light': '#E5B867',
          // Ink
          ink: '#14171A',
          // Light backgrounds
          50: '#F2F6F6',
          100: '#E3ECEC',
          // Status
          cold: '#6B7280',
          warm: '#C08A30',
          hot: '#B3381C',
          // Feedback
          success: '#2F7D5B',
          warning: '#B8860B',
          error: '#8B2A1F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        btn: '6px',
        card: '10px',
      },
      boxShadow: {
        float: '0 4px 12px rgba(11, 47, 49, 0.08)',
        lift: '0 8px 24px rgba(11, 47, 49, 0.12)',
      },
      borderColor: {
        DEFAULT: 'rgba(11, 47, 49, 0.08)',
        hairline: 'rgba(11, 47, 49, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
