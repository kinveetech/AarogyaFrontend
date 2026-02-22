import { describe, it, expect } from 'vitest'
import { tokens, semanticTokens, progressGradient, pageGradient } from './tokens'

describe('tokens', () => {
  describe('color palettes', () => {
    it('defines brand color palette with full scale', () => {
      const { brand } = tokens.colors!
      expect(brand[50].value).toBeTruthy()
      expect(brand[100].value).toBeTruthy()
      expect(brand[200].value).toBeTruthy()
      expect(brand[300].value).toBeTruthy()
      expect(brand[400].value).toBeTruthy()
      expect(brand[500].value).toBe('#0E6B66')
      expect(brand[600].value).toBe('#0A4D4A')
      expect(brand[700].value).toBeTruthy()
      expect(brand[800].value).toBeTruthy()
      expect(brand[900].value).toBeTruthy()
      expect(brand[950].value).toBeTruthy()
    })

    it('defines sage color palette', () => {
      expect(tokens.colors!.sage[400].value).toBe('#7FB285')
    })

    it('defines coral color palette', () => {
      expect(tokens.colors!.coral[400].value).toBe('#FF6B6B')
    })

    it('defines amber color palette', () => {
      expect(tokens.colors!.amber[300].value).toBe('#FFB347')
      expect(tokens.colors!.amber[200].value).toBe('#FFD693')
    })

    it('defines neutral color palette', () => {
      expect(tokens.colors!.neutral[50].value).toBeTruthy()
      expect(tokens.colors!.neutral[950].value).toBeTruthy()
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
    it('defines bg.canvas with light and dark values', () => {
      expect(colors['bg.canvas'].value).toEqual({ base: '#FFF8F0', _dark: '#0B1A1A' })
    })

    it('defines bg.surface with light and dark values', () => {
      expect(colors['bg.surface'].value.base).toBeTruthy()
      expect(colors['bg.surface'].value._dark).toBeTruthy()
    })

    it('defines bg.card with light and dark values', () => {
      expect(colors['bg.card'].value.base).toBeTruthy()
      expect(colors['bg.card'].value._dark).toBeTruthy()
    })

    it('defines bg.glass with light and dark values', () => {
      expect(colors['bg.glass'].value.base).toBeTruthy()
      expect(colors['bg.glass'].value._dark).toBeTruthy()
    })

    it('defines bg.overlay with light and dark values', () => {
      expect(colors['bg.overlay'].value.base).toBeTruthy()
      expect(colors['bg.overlay'].value._dark).toBeTruthy()
    })
  })

  describe('text', () => {
    it('defines text.primary with light and dark values', () => {
      expect(colors['text.primary'].value.base).toBeTruthy()
      expect(colors['text.primary'].value._dark).toBeTruthy()
    })

    it('defines text.secondary with light and dark values', () => {
      expect(colors['text.secondary'].value.base).toBeTruthy()
      expect(colors['text.secondary'].value._dark).toBeTruthy()
    })

    it('defines text.muted with light and dark values', () => {
      expect(colors['text.muted'].value.base).toBeTruthy()
      expect(colors['text.muted'].value._dark).toBeTruthy()
    })

    it('defines text.inverse with light and dark values', () => {
      expect(colors['text.inverse'].value.base).toBeTruthy()
      expect(colors['text.inverse'].value._dark).toBeTruthy()
    })
  })

  describe('borders', () => {
    it('defines border.subtle with light and dark values', () => {
      expect(colors['border.subtle'].value.base).toBeTruthy()
      expect(colors['border.subtle'].value._dark).toBeTruthy()
    })

    it('defines border.default with light and dark values', () => {
      expect(colors['border.default'].value.base).toBeTruthy()
      expect(colors['border.default'].value._dark).toBeTruthy()
    })

    it('defines border.strong with light and dark values', () => {
      expect(colors['border.strong'].value.base).toBeTruthy()
      expect(colors['border.strong'].value._dark).toBeTruthy()
    })
  })

  describe('action', () => {
    it('defines action.primary with light and dark values', () => {
      expect(colors['action.primary'].value.base).toBeTruthy()
      expect(colors['action.primary'].value._dark).toBeTruthy()
    })

    it('defines action.primary.hover with light and dark values', () => {
      expect(colors['action.primary.hover'].value.base).toBeTruthy()
      expect(colors['action.primary.hover'].value._dark).toBeTruthy()
    })

    it('defines action.primary.text with light and dark values', () => {
      expect(colors['action.primary.text'].value.base).toBe('#FFFFFF')
      expect(colors['action.primary.text'].value._dark).toBe('#FFFFFF')
    })
  })

  describe('orbs', () => {
    it('defines orb.primary with light and dark values', () => {
      expect(colors['orb.primary'].value.base).toBe('#A8D5AE')
      expect(colors['orb.primary'].value._dark).toBeTruthy()
    })

    it('defines orb.secondary with light and dark values', () => {
      expect(colors['orb.secondary'].value.base).toBe('#FFD693')
      expect(colors['orb.secondary'].value._dark).toBeTruthy()
    })

    it('defines orb.tertiary with light and dark values', () => {
      expect(colors['orb.tertiary'].value.base).toBe('#FF8A8A')
      expect(colors['orb.tertiary'].value._dark).toBeTruthy()
    })
  })

  describe('status', () => {
    it('defines status.success with light and dark values', () => {
      expect(colors['status.success'].value.base).toBeTruthy()
      expect(colors['status.success'].value._dark).toBeTruthy()
    })

    it('defines status.warning with light and dark values', () => {
      expect(colors['status.warning'].value.base).toBeTruthy()
      expect(colors['status.warning'].value._dark).toBeTruthy()
    })

    it('defines status.error with light and dark values', () => {
      expect(colors['status.error'].value.base).toBeTruthy()
      expect(colors['status.error'].value._dark).toBeTruthy()
    })

    it('defines status.info with light and dark values', () => {
      expect(colors['status.info'].value.base).toBeTruthy()
      expect(colors['status.info'].value._dark).toBeTruthy()
    })
  })
})

describe('gradients', () => {
  it('progressGradient flows teal to sage to amber', () => {
    expect(progressGradient).toContain('#0E6B66')
    expect(progressGradient).toContain('#7FB285')
    expect(progressGradient).toContain('#FFB347')
  })

  it('pageGradient has light and dark variants at 165deg', () => {
    expect(pageGradient.light).toContain('165deg')
    expect(pageGradient.dark).toContain('165deg')
    expect(pageGradient.light).toContain('#FFF8F0')
    expect(pageGradient.dark).toContain('#0B1A1A')
  })
})
