import { describe, expect, it } from 'vitest'

import { emergencyAccessRequestSchema } from './emergencyAccess'

const validData = {
  patientSub: 'patient-sub-123',
  emergencyContactPhone: '9876543210',
  doctorSub: 'doctor-sub-456',
  reason: 'Patient unconscious, need medical history',
}

describe('emergencyAccessRequestSchema', () => {
  it('accepts valid emergency access request', () => {
    expect(emergencyAccessRequestSchema.safeParse(validData).success).toBe(true)
  })

  it('accepts request with durationHours', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      durationHours: 48,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.durationHours).toBe(48)
    }
  })

  it('accepts request with null durationHours', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      durationHours: null,
    })
    expect(result.success).toBe(true)
  })

  it('accepts request without durationHours', () => {
    const result = emergencyAccessRequestSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.durationHours).toBeUndefined()
    }
  })

  it('rejects empty patientSub', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      patientSub: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty doctorSub', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      doctorSub: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty reason', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      reason: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects reason exceeding 500 characters', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      reason: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid phone number', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      emergencyContactPhone: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('rejects phone number starting with invalid digit', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      emergencyContactPhone: '5234567890',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid Indian phone number', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      emergencyContactPhone: '7890123456',
    })
    expect(result.success).toBe(true)
  })

  it('rejects durationHours less than 1', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      durationHours: 0,
    })
    expect(result.success).toBe(false)
  })

  it('rejects durationHours greater than 72', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      durationHours: 73,
    })
    expect(result.success).toBe(false)
  })

  it('rejects non-integer durationHours', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      durationHours: 2.5,
    })
    expect(result.success).toBe(false)
  })

  it('accepts durationHours of 1', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      durationHours: 1,
    })
    expect(result.success).toBe(true)
  })

  it('accepts durationHours of 72', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      durationHours: 72,
    })
    expect(result.success).toBe(true)
  })

  it('trims whitespace-only patientSub to empty and rejects', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      patientSub: '   ',
    })
    expect(result.success).toBe(false)
  })

  it('trims whitespace-only reason to empty and rejects', () => {
    const result = emergencyAccessRequestSchema.safeParse({
      ...validData,
      reason: '   ',
    })
    expect(result.success).toBe(false)
  })
})
