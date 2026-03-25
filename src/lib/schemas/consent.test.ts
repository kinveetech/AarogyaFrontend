import { describe, expect, it } from 'vitest'

import { consentSchema } from './consent'

const validData = {
  purpose: 'analytics' as const,
  isGranted: true,
}

describe('consentSchema', () => {
  it('accepts valid consent', () => {
    expect(consentSchema.safeParse(validData).success).toBe(true)
  })

  it('accepts isGranted as false', () => {
    const result = consentSchema.safeParse({
      ...validData,
      isGranted: false,
    })
    expect(result.success).toBe(true)
  })

  it.each(['analytics', 'marketing', 'data-sharing', 'research'] as const)(
    'accepts purpose: %s',
    (purpose) => {
      const result = consentSchema.safeParse({ ...validData, purpose })
      expect(result.success).toBe(true)
    },
  )

  it('rejects invalid purpose', () => {
    const result = consentSchema.safeParse({
      ...validData,
      purpose: 'advertising',
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-boolean isGranted', () => {
    const result = consentSchema.safeParse({
      ...validData,
      isGranted: 'yes',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing fields', () => {
    expect(consentSchema.safeParse({}).success).toBe(false)
  })
})
