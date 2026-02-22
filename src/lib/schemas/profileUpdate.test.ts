import { describe, expect, it } from 'vitest'

import { profileUpdateSchema } from './profileUpdate'

const validData = {
  name: 'Amit Patel',
  email: 'amit@example.com',
  phone: '9876543210',
  dateOfBirth: new Date('1990-05-15'),
}

describe('profileUpdateSchema', () => {
  it('accepts valid profile update', () => {
    expect(profileUpdateSchema.safeParse(validData).success).toBe(true)
  })

  it('rejects future date of birth', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    const result = profileUpdateSchema.safeParse({
      ...validData,
      dateOfBirth: future,
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid phone', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      phone: '1234567890',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty name', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      name: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects name exceeding 100 characters', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      name: 'a'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it('coerces date string to Date', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      dateOfBirth: '1990-05-15',
    })
    expect(result.success).toBe(true)
  })
})
