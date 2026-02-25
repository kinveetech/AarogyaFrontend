import { describe, expect, it } from 'vitest'

import { aadhaarVerificationSchema } from './aadhaarVerification'

const validData = {
  aadhaarNumber: '234567890123',
  firstName: 'Arjun',
  lastName: 'Kumar',
  dateOfBirth: '1990-05-15',
}

describe('aadhaarVerificationSchema', () => {
  it('accepts valid data', () => {
    expect(aadhaarVerificationSchema.safeParse(validData).success).toBe(true)
  })

  it('accepts aadhaar starting with 9', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      aadhaarNumber: '999999999999',
    })
    expect(result.success).toBe(true)
  })

  it('rejects aadhaar starting with 0', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      aadhaarNumber: '012345678901',
    })
    expect(result.success).toBe(false)
  })

  it('rejects aadhaar starting with 1', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      aadhaarNumber: '123456789012',
    })
    expect(result.success).toBe(false)
  })

  it('rejects aadhaar with fewer than 12 digits', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      aadhaarNumber: '23456789012',
    })
    expect(result.success).toBe(false)
  })

  it('rejects aadhaar with more than 12 digits', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      aadhaarNumber: '2345678901234',
    })
    expect(result.success).toBe(false)
  })

  it('rejects aadhaar with letters', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      aadhaarNumber: '23456789012a',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty aadhaar', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      aadhaarNumber: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty first name', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      firstName: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects whitespace-only first name', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      firstName: '   ',
    })
    expect(result.success).toBe(false)
  })

  it('rejects first name exceeding 120 characters', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      firstName: 'a'.repeat(121),
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty last name', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      lastName: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects last name exceeding 120 characters', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      lastName: 'a'.repeat(121),
    })
    expect(result.success).toBe(false)
  })

  it('rejects future date of birth', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      dateOfBirth: future.toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid date string', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      dateOfBirth: 'not-a-date',
    })
    expect(result.success).toBe(false)
  })

  it('accepts ISO date string', () => {
    const result = aadhaarVerificationSchema.safeParse({
      ...validData,
      dateOfBirth: '1990-05-15T00:00:00Z',
    })
    expect(result.success).toBe(true)
  })
})
