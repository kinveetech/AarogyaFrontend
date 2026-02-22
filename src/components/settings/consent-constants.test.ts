import { describe, it, expect } from 'vitest'
import { CONSENT_ITEMS } from './consent-constants'

describe('CONSENT_ITEMS', () => {
  it('has exactly 4 consent items', () => {
    expect(CONSENT_ITEMS).toHaveLength(4)
  })

  it('contains the correct purposes', () => {
    const purposes = CONSENT_ITEMS.map((item) => item.purpose)
    expect(purposes).toEqual(['analytics', 'marketing', 'data-sharing', 'research'])
  })

  it('has all required fields for each item', () => {
    for (const item of CONSENT_ITEMS) {
      expect(item).toHaveProperty('purpose')
      expect(item).toHaveProperty('label')
      expect(item).toHaveProperty('description')
      expect(item).toHaveProperty('tooltip')
      expect(typeof item.purpose).toBe('string')
      expect(typeof item.label).toBe('string')
      expect(typeof item.description).toBe('string')
      expect(typeof item.tooltip).toBe('string')
      expect(item.label.length).toBeGreaterThan(0)
      expect(item.description.length).toBeGreaterThan(0)
      expect(item.tooltip.length).toBeGreaterThan(0)
    }
  })
})
