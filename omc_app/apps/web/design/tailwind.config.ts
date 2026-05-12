import type { Config } from 'tailwindcss';

/**
 * OMC · Poster Arcade — Tailwind config
 * Merge into apps/web/tailwind.config.ts
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas:  '#FFE94D',
        ink:     '#15120D',
        pop:     '#FF4D6B',
        cool:    '#4DFFE0',
        paper:   '#FFFFFF',
        gain:    '#4DFFE0',
        loss:    '#FF4D6B',
        muted:   'rgba(21,18,13,0.65)',
      },
      fontFamily: {
        display: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        body:    ['"Inter Tight"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Sticker-confidence scale
        'display': ['64px', { lineHeight: '0.92', letterSpacing: '-0.04em', fontWeight: '900' }],
        'h1':      ['42px', { lineHeight: '0.95', letterSpacing: '-0.03em', fontWeight: '900' }],
        'h2':      ['22px', { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '800' }],
        'caption': ['11px', { lineHeight: '1.2',  letterSpacing: '0.18em',  fontWeight: '800' }],
      },
      borderRadius: {
        'pill': '999px',
      },
      borderWidth: {
        'card': '2.5px',
      },
      boxShadow: {
        // Hard offset shadows ONLY. No blur. No rgba.
        'card':    '4px 4px 0 #15120D',
        'float':   '5px 5px 0 #15120D',
        'cta':     '4px 4px 0 #FF4D6B',
        'cta-ink': '4px 4px 0 #15120D',
        'hover':   '6px 6px 0 #15120D',
        'press':   '2px 2px 0 #15120D',
        // Bigger emphasis variants
        'lg':      '6px 6px 0 #15120D',
        'xl':      '8px 8px 0 #FF4D6B',
      },
      transitionTimingFunction: {
        'pop':    'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'tilt-wobble': 'tilt-wobble 250ms ease-out',
        'pop-in':      'pop-in 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'flash-gain':  'flash-gain 300ms ease-out',
        'flash-loss':  'flash-loss 300ms ease-out',
      },
      keyframes: {
        'tilt-wobble': {
          '0%, 100%': { transform: 'rotate(-1.5deg)' },
          '25%':      { transform: 'rotate(1deg)'    },
          '50%':      { transform: 'rotate(-2deg)'   },
          '75%':      { transform: 'rotate(0.5deg)'  },
        },
        'pop-in': {
          '0%':   { transform: 'scale(0.95) rotate(-1deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(-1.5deg)',  opacity: '1' },
        },
        'flash-gain': {
          '0%':   { color: '#15120D', transform: 'scale(1)' },
          '50%':  { color: '#4DFFE0', transform: 'scale(1.08)' },
          '100%': { color: '#15120D', transform: 'scale(1)' },
        },
        'flash-loss': {
          '0%, 100%': { color: '#15120D', transform: 'translateX(0)' },
          '25%':      { color: '#FF4D6B', transform: 'translateX(-2px)' },
          '75%':      { color: '#FF4D6B', transform: 'translateX(2px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
