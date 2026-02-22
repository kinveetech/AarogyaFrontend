import { describe, expect, it } from 'vitest'

import { email, futureDate, nonEmptyString, phoneNumber } from './validators'

describe('phoneNumber', () => {
  it.each(['9876543210', '6000000000', '7123456789', '8999999999'])(
    'accepts valid Indian mobile number %s',
    (value) => {
      expect(phoneNumber.safeParse(value).success).toBe(true)
    },
  )

  it.each([
    '5876543210', // starts with 5
    '12345', // too short
    '98765432101', // too long
    'abcdefghij', // letters
    '', // empty
    '09876543210', // leading zero
  ])('rejects invalid phone number %s', (value) => {
    expect(phoneNumber.safeParse(value).success).toBe(false)
  })
})

describe('email', () => {
  it('accepts valid email', () => {
    expect(email.safeParse('user@example.com').success).toBe(true)
  })

  it.each(['not-an-email', '@missing.com', 'missing@', ''])(
    'rejects invalid email %s',
    (value) => {
      expect(email.safeParse(value).success).toBe(false)
    },
  )
})

describe('nonEmptyString', () => {
  it('accepts non-empty string', () => {
    expect(nonEmptyString.safeParse('hello').success).toBe(true)
  })

  it('trims whitespace and rejects empty result', () => {
    expect(nonEmptyString.safeParse('   ').success).toBe(false)
  })

  it('rejects empty string', () => {
    expect(nonEmptyString.safeParse('').success).toBe(false)
  })
})

describe('futureDate', () => {
  it('accepts a future date', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(futureDate.safeParse(tomorrow).success).toBe(true)
  })

  it('rejects a past date', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(futureDate.safeParse(yesterday).success).toBe(false)
  })

  it('rejects the current date-time (now)', () => {
    // "now" is not strictly in the future
    const now = new Date()
    expect(futureDate.safeParse(now).success).toBe(false)
  })

  it('coerces a date string', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    expect(futureDate.safeParse(future.toISOString()).success).toBe(true)
  })
})
