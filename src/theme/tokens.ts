/**
 * Serene Bloom Design Tokens
 * Derived from the Serene Bloom loading screen concept.
 *
 * Fonts (load in layout.tsx via next/font or <link>):
 *   - DM Serif Display  — headings, brand name
 *   - Outfit            — body, UI labels, captions
 */

export const colors = {
  brand: {
    50:  '#E6F5F4',
    100: '#C0E6E4',
    200: '#8ACECB',
    300: '#4FB4B0',
    400: '#1A9E97', // teal-light
    500: '#0E6B66', // teal-mid  ← primary action color
    600: '#0A4D4A', // teal-deep ← primary text on light
    700: '#083B38',
    800: '#052826',
    900: '#021614',
  },

  sage: {
    50:  '#F2F8F3',
    100: '#DCEDDe',
    200: '#BDD9C0',
    300: '#9DC5A1',
    400: '#7FB285', // sage        ← accent / success
    500: '#619065',
    600: '#4A6E4D',
    700: '#334D35',
    800: '#1D2E1E',
    900: '#0A100A',
  },

  coral: {
    50:  '#FFF0F0',
    100: '#FFD6D6',
    200: '#FFA8A8',
    300: '#FF8A8A', // coral-soft
    400: '#FF6B6B', // coral       ← error / destructive
    500: '#E54B4B',
    600: '#CC2B2B',
    700: '#991414',
    800: '#660A0A',
    900: '#330505',
  },

  amber: {
    50:  '#FFF8E6',
    100: '#FFEDC2',
    200: '#FFD693', // amber-glow
    300: '#FFB347', // amber       ← warning
    400: '#E8960A',
    500: '#C27A08',
    600: '#9B6006',
    700: '#754704',
    800: '#4E3002',
    900: '#271801',
  },

  // Base neutrals tinted with teal for cohesion
  neutral: {
    50:  '#F5FAF9',
    100: '#E6F0EF',
    200: '#C8DCDB',
    300: '#A4C4C2',
    400: '#7FA8A6',
    500: '#5A8C8A',
    600: '#3F6B69',
    700: '#2A4A48',
    800: '#182C2B',
    900: '#0A1716',
  },
}

/**
 * Semantic tokens — map to light/dark via Chakra's _dark syntax.
 * Use these throughout the app, never raw color values.
 */
export const semanticTokens = {
  colors: {
    // ── Backgrounds ──────────────────────────────────────────
    'bg.canvas': {
      default: '#FFF8F0',     // warm cream
      _dark:   '#0B1A1A',     // dark-bg
    },
    'bg.surface': {
      default: '#F0FAF0',     // light sage wash
      _dark:   '#112626',     // dark-surface
    },
    'bg.card': {
      default: 'rgba(255, 255, 255, 0.75)',
      _dark:   '#1A3535',     // dark-card
    },
    'bg.glass': {
      default: 'rgba(255, 255, 255, 0.45)',
      _dark:   'rgba(26, 53, 53, 0.55)',
    },
    'bg.overlay': {
      default: 'rgba(10, 77, 74, 0.06)',
      _dark:   'rgba(168, 213, 174, 0.06)',
    },

    // ── Text ─────────────────────────────────────────────────
    'text.primary': {
      default: 'brand.600',   // #0A4D4A
      _dark:   '#E8F5F0',
    },
    'text.secondary': {
      default: 'brand.500',   // #0E6B66
      _dark:   'sage.300',
    },
    'text.muted': {
      default: 'sage.500',
      _dark:   'sage.400',
    },
    'text.inverse': {
      default: '#FFFFFF',
      _dark:   'brand.600',
    },

    // ── Borders ───────────────────────────────────────────────
    'border.subtle': {
      default: 'rgba(10, 77, 74, 0.10)',
      _dark:   'rgba(168, 213, 174, 0.10)',
    },
    'border.default': {
      default: 'rgba(10, 77, 74, 0.18)',
      _dark:   'rgba(168, 213, 174, 0.18)',
    },
    'border.strong': {
      default: 'brand.500',
      _dark:   'brand.400',
    },

    // ── Brand / Action ────────────────────────────────────────
    'action.primary': {
      default: 'brand.500',   // #0E6B66
      _dark:   'brand.400',   // #1A9E97
    },
    'action.primary.hover': {
      default: 'brand.600',
      _dark:   'brand.300',
    },
    'action.primary.text': {
      default: '#FFFFFF',
      _dark:   '#FFFFFF',
    },

    // ── Ambient orbs (background decoration) ─────────────────
    'orb.primary': {
      default: '#A8D5AE',     // sage-light
      _dark:   'rgba(10, 77, 74, 0.7)',
    },
    'orb.secondary': {
      default: '#FFD693',     // amber-glow
      _dark:   'rgba(26, 158, 151, 0.4)',
    },
    'orb.tertiary': {
      default: '#FF8A8A',     // coral-soft
      _dark:   'rgba(255, 107, 107, 0.15)',
    },

    // ── Status ────────────────────────────────────────────────
    'status.success':  { default: 'sage.500',   _dark: 'sage.300'   },
    'status.warning':  { default: 'amber.400',  _dark: 'amber.300'  },
    'status.error':    { default: 'coral.400',  _dark: 'coral.300'  },
    'status.info':     { default: 'brand.500',  _dark: 'brand.400'  },
  },
}

export const fonts = {
  heading: `'DM Serif Display', Georgia, 'Times New Roman', serif`,
  body:    `'Outfit', system-ui, -apple-system, sans-serif`,
  mono:    `'DM Mono', 'Menlo', 'Monaco', monospace`,
}

export const fontSizes = {
  '2xs': '0.625rem',   // 10px
  xs:    '0.75rem',    // 12px
  sm:    '0.875rem',   // 14px
  md:    '1rem',       // 16px
  lg:    '1.125rem',   // 18px
  xl:    '1.25rem',    // 20px
  '2xl': '1.5rem',     // 24px
  '3xl': '1.875rem',   // 30px
  '4xl': '2.25rem',    // 36px
  '5xl': '3rem',       // 48px
  '6xl': '3.75rem',    // 60px
  '7xl': '4.5rem',     // 72px
}

export const fontWeights = {
  light:    300,
  normal:   400,
  medium:   500,
  semibold: 600,
  bold:     700,
}

export const radii = {
  sm:   '6px',
  md:   '12px',
  lg:   '20px',
  xl:   '28px',
  '2xl':'36px',
  full: '9999px',
}

export const shadows = {
  // Light mode — teal-tinted shadows
  sm:  '0 1px 3px rgba(10, 77, 74, 0.08), 0 1px 2px rgba(10, 77, 74, 0.06)',
  md:  '0 4px 16px rgba(10, 77, 74, 0.08), 0 2px 6px rgba(10, 77, 74, 0.06)',
  lg:  '0 8px 32px rgba(10, 77, 74, 0.10), 0 4px 12px rgba(10, 77, 74, 0.07)',
  xl:  '0 20px 60px rgba(10, 77, 74, 0.12), 0 8px 24px rgba(10, 77, 74, 0.08)',
  glass: '0 8px 32px rgba(10, 77, 74, 0.08), 0 2px 8px rgba(10, 77, 74, 0.04), inset 0 1px 0 rgba(255,255,255,0.6)',
}

/** Progress bar gradient — teal → sage → amber (from loading screen) */
export const progressGradient =
  'linear-gradient(90deg, #0E6B66, #7FB285, #FFB347)'

/**
 * Background gradient for full-page surfaces.
 * Light: warm cream → cool sage wash (from v1-screen)
 * Dark:  derived from dark-bg with subtle teal mesh
 */
export const pageGradient = {
  light: 'linear-gradient(165deg, #FFF8F0 0%, #F0FAF0 40%, #E0F5F0 70%, #D5F0EA 100%)',
  dark:  'linear-gradient(165deg, #0B1A1A 0%, #0F2020 40%, #112626 70%, #142B2B 100%)',
}
