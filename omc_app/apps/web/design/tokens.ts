/**
 * OMC · Poster Arcade — Design Tokens
 * Import in components: import { tokens } from '@/design/tokens'
 */

export const tokens = {
  color: {
    canvas:  '#FFE94D',
    ink:     '#15120D',
    pop:     '#FF4D6B',
    cool:    '#4DFFE0',
    paper:   '#FFFFFF',

    // semantic
    gain:    '#4DFFE0',
    loss:    '#FF4D6B',
    warn:    '#FFE94D',
    neutral: '#15120D',
    muted:   'rgba(21,18,13,0.65)',

    // category chips
    cat: {
      sport:  '#FF4D6B',
      crypto: '#4DFFE0',
      cinema: '#FFFFFF',
      ai:     '#FFE94D',
      food:   '#FFFFFF',
      life:   '#FFFFFF',
      music:  '#FF4D6B',
      founder:'#4DFFE0',
    },
  },

  font: {
    display: '"Inter Tight", system-ui, sans-serif',
    body:    '"Inter Tight", system-ui, sans-serif',
    mono:    '"JetBrains Mono", ui-monospace, monospace',
  },

  size: {
    display: '64px',
    h1:      '42px',
    h2:      '22px',
    body:    '14px',
    caption: '11px',
    mono:    '14px',
  },

  weight: {
    display:  900,
    section:  800,
    body:     600,
    caption:  800,
    mono:     800,
  },

  tracking: {
    display: '-0.04em',
    h1:      '-0.03em',
    h2:      '-0.02em',
    caption: '0.18em',
  },

  radius: {
    sm:    '8px',
    md:    '12px',
    lg:    '14px',
    pill:  '999px',
  },

  border: {
    card:  '2.5px solid #15120D',
    chip:  '2px solid #15120D',
    input: '2px solid #15120D',
  },

  shadow: {
    card:   '4px 4px 0 #15120D',
    float:  '5px 5px 0 #15120D',
    cta:    '4px 4px 0 #FF4D6B',
    hover:  '6px 6px 0 #15120D',
    press:  '2px 2px 0 #15120D',
  },

  tilt: {
    sm: '-1.5deg',
    md: '-2deg',
    lg: '-3deg',
    counter_sm: '1.5deg',
    counter_md: '2deg',
    counter_lg: '3deg',
  },

  spacing: {
    pagePadX: '26px',
    pagePadY: '22px',
    cardGap:  '14px',
    mobilePadX: '16px',
  },

  motion: {
    pop:       'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth:    'cubic-bezier(0.4, 0, 0.2, 1)',
    duration: {
      fast:   '120ms',
      base:   '250ms',
      slow:   '400ms',
    },
  },
} as const;

export type Tokens = typeof tokens;
