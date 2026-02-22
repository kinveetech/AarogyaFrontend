import { describe, it, expect } from 'vitest'
import { tokens, semanticTokens, progressGradient, pageGradient } from './tokens'

describe('tokens', () => {
  describe('color palettes', () => {
    it.each(['brand', 'sage', 'coral', 'amber', 'neutral'] as const)(
      'defines %s color palette with full scale',
      (palette) => {
        const colors = tokens.colors![palette]
        expect(colors).toBeDefined()
        for (const stop of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
          expect(colors[stop]).toHaveProperty('value')
        }
      },
    )

    it('maps brand.500 to teal-mid (#0E6B66)', () => {
      expect(tokens.colors!.brand[500].value).toBe('#0E6B66')
    })

    it('maps sage.400 to sage (#7FB285)', () => {
      expect(tokens.colors!.sage[400].value).toBe('#7FB285')
    })

    it('maps coral.400 to coral (#FF6B6B)', () => {
      expect(tokens.colors!.coral[400].value).toBe('#FF6B6B')
    })

    it('maps amber.300 to amber (#FFB347)', () => {
      expect(tokens.colors!.amber[300].value).toBe('#FFB347')
    })
  })

  describe('fonts', () => {
    it('defines heading, body, and mono font stacks', () => {
      expect(tokens.fonts!.heading.value).toContain('DM Serif Display')
      expect(tokens.fonts!.body.value).toContain('Outfit')
      expect(tokens.fonts!.mono.value).toContain('DM Mono')
    })
  })

  describe('radii', () => {
    it('includes full radius for pill-shaped buttons', () => {
      expect(tokens.radii!.full.value).toBe('9999px')
    })
  })
})

describe('semanticTokens', () => {
  const colors = semanticTokens.colors!

  describe('backgrounds', () => {
    it.each(['bg.canvas', 'bg.surface', 'bg.card', 'bg.glass', 'bg.overlay'])(
      'defines %s with light and dark values',
      (token) => {
        const val = colors[token].value as { base: string; _dark: string }
        expect(val.base).toBeTruthy()
        expect(val._dark).toBeTruthy()
      },
    )
  })

  describe('text', () => {
    it.each(['text.primary', 'text.secondary', 'text.muted', 'text.inverse'])(
      'defines %s with light and dark values',
      (token) => {
        const val = colors[token].value as { base: string; _dark: string }
        expect(val.base).toBeTruthy()
        expect(val._dark).toBeTruthy()
      },
    )
  })

  describe('borders', () => {
    it.each(['border.subtle', 'border.default', 'border.strong'])(
      'defines %s with light and dark values',
      (token) => {
        const val = colors[token].value as { base: string; _dark: string }
        expect(val.base).toBeTruthy()
        expect(val._dark).toBeTruthy()
      },
    )
  })

  describe('action', () => {
    it.each(['action.primary', 'action.primary.hover', 'action.primary.text'])(
      'defines %s with light and dark values',
      (token) => {
        const val = colors[token].value as { base: string; _dark: string }
        expect(val.base).toBeTruthy()
        expect(val._dark).toBeTruthy()
      },
    )
  })

  describe('orbs', () => {
    it.each(['orb.primary', 'orb.secondary', 'orb.tertiary'])(
      'defines %s with light and dark values',
      (token) => {
        const val = colors[token].value as { base: string; _dark: string }
        expect(val.base).toBeTruthy()
        expect(val._dark).toBeTruthy()
      },
    )
  })

  describe('status', () => {
    it.each(['status.success', 'status.warning', 'status.error', 'status.info'])(
      'defines %s with light and dark values',
      (token) => {
        const val = colors[token].value as { base: string; _dark: string }
        expect(val.base).toBeTruthy()
        expect(val._dark).toBeTruthy()
      },
    )
  })
})

describe('gradients', () => {
  it('progressGradient flows teal to sage to amber', () => {
    expect(progressGradient).toContain('#0E6B66')
    expect(progressGradient).toContain('#7FB285')
    expect(progressGradient).toContain('#FFB347')
  })

  it('pageGradient has light and dark variants', () => {
    expect(pageGradient.light).toContain('165deg')
    expect(pageGradient.dark).toContain('165deg')
    expect(pageGradient.light).toContain('#FFF8F0')
    expect(pageGradient.dark).toContain('#0B1A1A')
  })
})
