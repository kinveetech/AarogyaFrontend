/**
 * Serene Bloom Design Tokens (Chakra UI v3)
 * Derived from the Serene Bloom loading screen concept.
 *
 * Fonts (load in layout.tsx via next/font/google):
 *   - DM Serif Display  — headings, brand name
 *   - Outfit            — body, UI labels, captions
 *   - DM Mono           — data, code
 */

import { defineTokens, defineSemanticTokens } from '@chakra-ui/react'

export const tokens = defineTokens({
  colors: {
    brand: {
      50:  { value: '#E6F5F4' },
      100: { value: '#C0E6E4' },
      200: { value: '#8ACECB' },
      300: { value: '#4FB4B0' },
      400: { value: '#1A9E97' }, // teal-light
      500: { value: '#0E6B66' }, // teal-mid  — primary action color
      600: { value: '#0A4D4A' }, // teal-deep — primary text on light
      700: { value: '#083B38' },
      800: { value: '#052826' },
      900: { value: '#021614' },
      950: { value: '#010D0C' },
    },

    sage: {
      50:  { value: '#F2F8F3' },
      100: { value: '#DCEDDe' },
      200: { value: '#BDD9C0' },
      300: { value: '#9DC5A1' },
      400: { value: '#7FB285' }, // sage — accent / success
      500: { value: '#619065' },
      600: { value: '#4A6E4D' },
      700: { value: '#334D35' },
      800: { value: '#1D2E1E' },
      900: { value: '#0A100A' },
      950: { value: '#050805' },
    },

    coral: {
      50:  { value: '#FFF0F0' },
      100: { value: '#FFD6D6' },
      200: { value: '#FFA8A8' },
      300: { value: '#FF8A8A' }, // coral-soft
      400: { value: '#FF6B6B' }, // coral — error / destructive
      500: { value: '#E54B4B' },
      600: { value: '#CC2B2B' },
      700: { value: '#991414' },
      800: { value: '#660A0A' },
      900: { value: '#330505' },
      950: { value: '#1A0202' },
    },

    amber: {
      50:  { value: '#FFF8E6' },
      100: { value: '#FFEDC2' },
      200: { value: '#FFD693' }, // amber-glow
      300: { value: '#FFB347' }, // amber — warning
      400: { value: '#E8960A' },
      500: { value: '#C27A08' },
      600: { value: '#9B6006' },
      700: { value: '#754704' },
      800: { value: '#4E3002' },
      900: { value: '#271801' },
      950: { value: '#140C00' },
    },

    // Base neutrals tinted with teal for cohesion
    neutral: {
      50:  { value: '#F5FAF9' },
      100: { value: '#E6F0EF' },
      200: { value: '#C8DCDB' },
      300: { value: '#A4C4C2' },
      400: { value: '#7FA8A6' },
      500: { value: '#5A8C8A' },
      600: { value: '#3F6B69' },
      700: { value: '#2A4A48' },
      800: { value: '#182C2B' },
      900: { value: '#0A1716' },
      950: { value: '#050B0B' },
    },
  },

  fonts: {
    heading: { value: "'DM Serif Display', Georgia, 'Times New Roman', serif" },
    body:    { value: "'Outfit', system-ui, -apple-system, sans-serif" },
    mono:    { value: "'DM Mono', 'Menlo', 'Monaco', monospace" },
  },

  fontSizes: {
    '2xs': { value: '0.625rem' },  // 10px
    xs:    { value: '0.75rem' },   // 12px
    sm:    { value: '0.875rem' },  // 14px
    md:    { value: '1rem' },      // 16px
    lg:    { value: '1.125rem' },  // 18px
    xl:    { value: '1.25rem' },   // 20px
    '2xl': { value: '1.5rem' },    // 24px
    '3xl': { value: '1.875rem' },  // 30px
    '4xl': { value: '2.25rem' },   // 36px
    '5xl': { value: '3rem' },      // 48px
    '6xl': { value: '3.75rem' },   // 60px
    '7xl': { value: '4.5rem' },    // 72px
  },

  fontWeights: {
    light:    { value: '300' },
    normal:   { value: '400' },
    medium:   { value: '500' },
    semibold: { value: '600' },
    bold:     { value: '700' },
  },

  radii: {
    sm:   { value: '6px' },
    md:   { value: '12px' },
    lg:   { value: '20px' },
    xl:   { value: '28px' },
    '2xl': { value: '36px' },
    full: { value: '9999px' },
  },

  shadows: {
    sm:    { value: '0 1px 3px rgba(10, 77, 74, 0.08), 0 1px 2px rgba(10, 77, 74, 0.06)' },
    md:    { value: '0 4px 16px rgba(10, 77, 74, 0.08), 0 2px 6px rgba(10, 77, 74, 0.06)' },
    lg:    { value: '0 8px 32px rgba(10, 77, 74, 0.10), 0 4px 12px rgba(10, 77, 74, 0.07)' },
    xl:    { value: '0 20px 60px rgba(10, 77, 74, 0.12), 0 8px 24px rgba(10, 77, 74, 0.08)' },
    glass: { value: '0 8px 32px rgba(10, 77, 74, 0.08), 0 2px 8px rgba(10, 77, 74, 0.04), inset 0 1px 0 rgba(255,255,255,0.6)' },
  },
})

export const semanticTokens = defineSemanticTokens({
  colors: {
    // ── Backgrounds ──────────────────────────────────────────
    'bg.canvas': {
      value: { base: '#FFF8F0', _dark: '#0B1A1A' },
    },
    'bg.surface': {
      value: { base: '#F0FAF0', _dark: '#112626' },
    },
    'bg.card': {
      value: { base: 'rgba(255, 255, 255, 0.75)', _dark: '#1A3535' },
    },
    'bg.glass': {
      value: { base: 'rgba(255, 255, 255, 0.45)', _dark: 'rgba(26, 53, 53, 0.55)' },
    },
    'bg.overlay': {
      value: { base: 'rgba(10, 77, 74, 0.06)', _dark: 'rgba(168, 213, 174, 0.06)' },
    },

    // ── Text ─────────────────────────────────────────────────
    'text.primary': {
      value: { base: '{colors.brand.600}', _dark: '#E8F5F0' },
    },
    'text.secondary': {
      value: { base: '{colors.brand.500}', _dark: '{colors.sage.300}' },
    },
    'text.muted': {
      value: { base: '{colors.sage.500}', _dark: '{colors.sage.400}' },
    },
    'text.inverse': {
      value: { base: '#FFFFFF', _dark: '{colors.brand.600}' },
    },

    // ── Borders ───────────────────────────────────────────────
    'border.subtle': {
      value: { base: 'rgba(10, 77, 74, 0.10)', _dark: 'rgba(168, 213, 174, 0.10)' },
    },
    'border.default': {
      value: { base: 'rgba(10, 77, 74, 0.18)', _dark: 'rgba(168, 213, 174, 0.18)' },
    },
    'border.strong': {
      value: { base: '{colors.brand.500}', _dark: '{colors.brand.400}' },
    },

    // ── Brand / Action ────────────────────────────────────────
    'action.primary': {
      value: { base: '{colors.brand.500}', _dark: '{colors.brand.400}' },
    },
    'action.primary.hover': {
      value: { base: '{colors.brand.600}', _dark: '{colors.brand.300}' },
    },
    'action.primary.text': {
      value: { base: '#FFFFFF', _dark: '#FFFFFF' },
    },

    // ── Ambient orbs (background decoration) ─────────────────
    'orb.primary': {
      value: { base: '#A8D5AE', _dark: 'rgba(10, 77, 74, 0.7)' },
    },
    'orb.secondary': {
      value: { base: '#FFD693', _dark: 'rgba(26, 158, 151, 0.4)' },
    },
    'orb.tertiary': {
      value: { base: '#FF8A8A', _dark: 'rgba(255, 107, 107, 0.15)' },
    },

    // ── Status ────────────────────────────────────────────────
    'status.success': {
      value: { base: '{colors.sage.500}', _dark: '{colors.sage.300}' },
    },
    'status.warning': {
      value: { base: '{colors.amber.400}', _dark: '{colors.amber.300}' },
    },
    'status.error': {
      value: { base: '{colors.coral.400}', _dark: '{colors.coral.300}' },
    },
    'status.info': {
      value: { base: '{colors.brand.500}', _dark: '{colors.brand.400}' },
    },
  },
})

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
