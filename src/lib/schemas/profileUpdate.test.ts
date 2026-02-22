import { describe, expect, it } from 'vitest'

import { profileUpdateSchema } from './profileUpdate'

const validData = {
  name: 'Amit Patel',
  email: 'amit@example.com',
  phone: '9876543210',
  dateOfBirth: '1990-05-15',
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
      dateOfBirth: future.toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid date string', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      dateOfBirth: 'not-a-date',
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

  it('accepts ISO date string', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      dateOfBirth: '1990-05-15T00:00:00Z',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid blood group', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      bloodGroup: 'B+',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid blood group', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      bloodGroup: 'X+',
    })
    expect(result.success).toBe(false)
  })

  it('accepts null blood group', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      bloodGroup: null,
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid gender', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      gender: 'female',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid gender', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      gender: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid city', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      city: 'Bengaluru',
    })
    expect(result.success).toBe(true)
  })

  it('rejects city exceeding 100 characters', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      city: 'a'.repeat(101),
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional fields omitted', () => {
    const result = profileUpdateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
