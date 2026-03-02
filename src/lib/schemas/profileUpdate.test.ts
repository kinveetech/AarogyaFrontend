import { describe, expect, it } from 'vitest'

import { profileUpdateSchema } from './profileUpdate'

const validData = {
  firstName: 'Amit',
  lastName: 'Patel',
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

  it('rejects empty first name', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      firstName: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects first name exceeding 120 characters', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      firstName: 'a'.repeat(121),
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty last name', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      lastName: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects last name exceeding 120 characters', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      lastName: 'a'.repeat(121),
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

  it('accepts valid address', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      address: 'Bengaluru',
    })
    expect(result.success).toBe(true)
  })

  it('rejects address exceeding 500 characters', () => {
    const result = profileUpdateSchema.safeParse({
      ...validData,
      address: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('accepts optional fields omitted', () => {
    const result = profileUpdateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})
