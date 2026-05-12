/**
 * OMC · Poster Arcade — Design tokens.
 * Direction D3 "Sticker Confidence." Loud, confident, hard-shadow stickers on a yellow canvas.
 * Source of truth — do not redefine these elsewhere.
 */

export const tokens = {
  color: {
    canvas: '#FFE94D',
    ink:    '#15120D',
    pop:    '#FF4D6B',
    cool:   '#4DFFE0',
    paper:  '#FFFFFF',
  },
  shadow: {
    card:   '5px 5px 0 #15120D',
    cardLg: '6px 6px 0 #15120D',
    cta:    '4px 4px 0 #15120D',
    small:  '2px 2px 0 #15120D',
  },
  radius: { card: 14, pill: 999 },
  border: '2.5px solid #15120D',
  type: {
    display: { weight: 900, tracking: '-0.03em' },
    body:    { weight: 600 },
    mono:    { weight: 800 },
  },
  motion: {
    cardTapDuration: 100,
    confettiDuration: 250,
    priceUpDuration: 200,
  },
} as const;

export type Tokens = typeof tokens;
