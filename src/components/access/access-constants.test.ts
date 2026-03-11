import { describe, it, expect } from 'vitest'
import {
  getGrantStatus,
  deriveAccessGrantStatus,
  formatExpiryText,
  getInitials,
} from './access-constants'

describe('getGrantStatus', () => {
  it('returns active for grants expiring in more than 7 days', () => {
    const future = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    const result = getGrantStatus(future)
    expect(result.status).toBe('active')
    expect(result.label).toBe('Active')
    expect(result.badgeVariant).toBe('success')
    expect(result.daysRemaining).toBeGreaterThan(7)
  })

  it('returns expiring for grants expiring in 1-7 days', () => {
    const future = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    const result = getGrantStatus(future)
    expect(result.status).toBe('expiring')
    expect(result.label).toBe('Expiring Soon')
    expect(result.badgeVariant).toBe('warning')
    expect(result.daysRemaining).toBeGreaterThan(0)
    expect(result.daysRemaining).toBeLessThanOrEqual(7)
  })

  it('returns expired for grants that have already expired', () => {
    const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    const result = getGrantStatus(past)
    expect(result.status).toBe('expired')
    expect(result.label).toBe('Expired')
    expect(result.badgeVariant).toBe('pending')
    expect(result.daysRemaining).toBeLessThanOrEqual(0)
  })

  it('returns expiring for grants expiring exactly 7 days from now', () => {
    const exactly7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const result = getGrantStatus(exactly7)
    expect(result.status).toBe('expiring')
    expect(result.badgeVariant).toBe('warning')
  })

  it('returns active for grants expiring in 8 days', () => {
    const future = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString()
    const result = getGrantStatus(future)
    expect(result.status).toBe('active')
  })

  it('returns revoked status when revoked is true', () => {
    const future = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    const result = getGrantStatus(future, true)
    expect(result.status).toBe('revoked')
    expect(result.label).toBe('Revoked')
    expect(result.badgeVariant).toBe('error')
    expect(result.daysRemaining).toBe(0)
  })

  it('returns revoked even when grant would otherwise be active', () => {
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const result = getGrantStatus(future, true)
    expect(result.status).toBe('revoked')
  })

  it('returns revoked even when grant is expired', () => {
    const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    const result = getGrantStatus(past, true)
    expect(result.status).toBe('revoked')
  })
})

describe('deriveAccessGrantStatus', () => {
  it('returns revoked when revoked is true', () => {
    const future = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    expect(deriveAccessGrantStatus(future, true)).toBe('revoked')
  })

  it('returns active for non-expired non-revoked grant', () => {
    const future = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    expect(deriveAccessGrantStatus(future, false)).toBe('active')
  })

  it('returns expired for past non-revoked grant', () => {
    const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    expect(deriveAccessGrantStatus(past, false)).toBe('expired')
  })
})

describe('formatExpiryText', () => {
  it('formats positive days remaining', () => {
    expect(formatExpiryText(12)).toBe('Expires in 12 days')
  })

  it('formats singular day', () => {
    expect(formatExpiryText(1)).toBe('Expires in 1 day')
  })

  it('formats expired days', () => {
    expect(formatExpiryText(-5)).toBe('Expired 5 days ago')
  })

  it('formats expired today', () => {
    expect(formatExpiryText(0)).toBe('Expired today')
  })

  it('formats singular expired day', () => {
    expect(formatExpiryText(-1)).toBe('Expired 1 day ago')
  })
})

describe('getInitials', () => {
  it('extracts initials from two-word name', () => {
    expect(getInitials('Dr. Priya')).toBe('DP')
  })

  it('extracts initials from three-word name', () => {
    expect(getInitials('Dr. Priya Sharma')).toBe('DP')
  })

  it('limits to 2 characters', () => {
    expect(getInitials('A B C D')).toBe('AB')
  })

  it('handles single word', () => {
    expect(getInitials('Priya')).toBe('P')
  })

  it('handles empty string', () => {
    expect(getInitials('')).toBe('')
  })
})
