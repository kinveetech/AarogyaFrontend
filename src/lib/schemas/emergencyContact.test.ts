import { describe, expect, it } from 'vitest'

import { emergencyContactSchema } from './emergencyContact'

const validData = {
  name: 'Priya Sharma',
  phone: '9876543210',
  relationship: 'spouse' as const,
  isPrimary: false,
}

describe('emergencyContactSchema', () => {
  it('accepts valid emergency contact', () => {
    expect(emergencyContactSchema.safeParse(validData).success).toBe(true)
  })

  it.each(['spouse', 'parent', 'sibling', 'child', 'friend', 'other'] as const)(
    'accepts relationship: %s',
    (relationship) => {
      const result = emergencyContactSchema.safeParse({
        ...validData,
        relationship,
      })
      expect(result.success).toBe(true)
    },
  )

  it('rejects empty name', () => {
    const result = emergencyContactSchema.safeParse({
      ...validData,
      name: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects name exceeding 100 characters', () => {
    const result = emergencyContactSchema.safeParse({
      ...validData,
      name: 'a'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid phone number', () => {
    const result = emergencyContactSchema.safeParse({
      ...validData,
      phone: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid relationship', () => {
    const result = emergencyContactSchema.safeParse({
      ...validData,
      relationship: 'colleague',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing isPrimary', () => {
    const { isPrimary: _, ...withoutIsPrimary } = validData
    const result = emergencyContactSchema.safeParse(withoutIsPrimary)
    expect(result.success).toBe(false)
  })

  it('accepts isPrimary as true', () => {
    const result = emergencyContactSchema.safeParse({
      ...validData,
      isPrimary: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isPrimary).toBe(true)
    }
  })

  it('accepts isPrimary as false', () => {
    const result = emergencyContactSchema.safeParse({
      ...validData,
      isPrimary: false,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isPrimary).toBe(false)
    }
  })

  it('rejects non-boolean isPrimary', () => {
    const result = emergencyContactSchema.safeParse({
      ...validData,
      isPrimary: 'yes',
    })
    expect(result.success).toBe(false)
  })
})
