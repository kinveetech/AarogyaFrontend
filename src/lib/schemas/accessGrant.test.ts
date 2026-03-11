import { describe, expect, it } from 'vitest'

import { accessGrantSchema } from './accessGrant'

const validData = {
  doctorId: '550e8400-e29b-41d4-a716-446655440000',
  doctorName: 'Dr. Sharma',
  allReports: false,
  reportIds: ['550e8400-e29b-41d4-a716-446655440001'],
  purpose: 'Follow-up consultation',
  expiresAt: new Date(Date.now() + 86_400_000), // tomorrow
}

describe('accessGrantSchema', () => {
  it('accepts valid access grant with specific reports', () => {
    expect(accessGrantSchema.safeParse(validData).success).toBe(true)
  })

  it('accepts valid access grant with allReports', () => {
    const result = accessGrantSchema.safeParse({
      ...validData,
      allReports: true,
      reportIds: [],
    })
    expect(result.success).toBe(true)
  })

  it('accepts multiple report IDs', () => {
    const result = accessGrantSchema.safeParse({
      ...validData,
      reportIds: [
        '550e8400-e29b-41d4-a716-446655440001',
        '550e8400-e29b-41d4-a716-446655440002',
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty reportIds when allReports is false', () => {
    const result = accessGrantSchema.safeParse({
      ...validData,
      allReports: false,
      reportIds: [],
    })
    expect(result.success).toBe(false)
  })

  it('accepts empty reportIds when allReports is true', () => {
    const result = accessGrantSchema.safeParse({
      ...validData,
      allReports: true,
      reportIds: [],
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid UUID for doctorId', () => {
    const result = accessGrantSchema.safeParse({
      ...validData,
      doctorId: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid UUID in reportIds', () => {
    const result = accessGrantSchema.safeParse({
      ...validData,
      reportIds: ['not-a-uuid'],
    })
    expect(result.success).toBe(false)
  })

  it('rejects past expiry date', () => {
    const result = accessGrantSchema.safeParse({
      ...validData,
      expiresAt: new Date(Date.now() - 86_400_000), // yesterday
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty doctor name', () => {
    const result = accessGrantSchema.safeParse({
      ...validData,
      doctorName: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty purpose', () => {
    const result = accessGrantSchema.safeParse({
      ...validData,
      purpose: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects purpose over 500 characters', () => {
    const result = accessGrantSchema.safeParse({
      ...validData,
      purpose: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('accepts purpose at exactly 500 characters', () => {
    const result = accessGrantSchema.safeParse({
      ...validData,
      purpose: 'a'.repeat(500),
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing allReports field', () => {
    const { allReports: _, ...withoutAllReports } = validData
    const result = accessGrantSchema.safeParse(withoutAllReports)
    expect(result.success).toBe(false)
  })
})
