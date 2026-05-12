import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Poster Arcade tokens (D3 — Sticker Confidence)
        canvas: '#FFE94D',
        ink:    '#15120D',
        pop:    '#FF4D6B',
        cool:   '#4DFFE0',
        paper:  '#FFFFFF',
      },
      boxShadow: {
        sticker:        '5px 5px 0 #15120D',
        'sticker-lg':   '6px 6px 0 #15120D',
        cta:            '4px 4px 0 #15120D',
        'sticker-sm':   '2px 2px 0 #15120D',
        'sticker-press':'2px 2px 0 #15120D',
        'cta-pop':      '3px 3px 0 #FF4D6B',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Inter Tight', 'sans-serif'],
        body:    ['var(--font-display)', 'Inter Tight', 'sans-serif'],
        mono:    ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        sticker: '14px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "sticker-wobble": {
          "0%, 100%": { transform: "rotate(var(--tw-rotate, 0deg))" },
          "25%":      { transform: "rotate(calc(var(--tw-rotate, 0deg) - 2deg))" },
          "75%":      { transform: "rotate(calc(var(--tw-rotate, 0deg) + 2deg))" },
        },
        "price-flash": {
          "0%, 100%": { transform: "scale(1)" },
          "50%":      { transform: "scale(1.08)", color: "#FF4D6B" },
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "sticker-wobble":  "sticker-wobble 250ms ease-in-out",
        "price-flash":     "price-flash 200ms ease-in-out",
      },
    },
  },
  plugins: [],
} satisfies Config;