import { describe, it, expect } from 'vitest'
import { MAX_CONTACTS, RELATIONSHIP_LABELS, getInitials, formatPhone } from './emergency-constants'

describe('MAX_CONTACTS', () => {
  it('is 3', () => {
    expect(MAX_CONTACTS).toBe(3)
  })
})

describe('RELATIONSHIP_LABELS', () => {
  it('has labels for all relationship types', () => {
    expect(RELATIONSHIP_LABELS).toEqual({
      spouse: 'Spouse',
      parent: 'Parent',
      sibling: 'Sibling',
      child: 'Child',
      friend: 'Friend',
      other: 'Other',
    })
  })
})

describe('getInitials', () => {
  it('extracts initials from two-word name', () => {
    expect(getInitials('Priya Sharma')).toBe('PS')
  })

  it('extracts initials from three-word name and limits to 2', () => {
    expect(getInitials('Arun Kumar Mehta')).toBe('AK')
  })

  it('handles single word', () => {
    expect(getInitials('Priya')).toBe('P')
  })

  it('handles empty string', () => {
    expect(getInitials('')).toBe('')
  })

  it('uppercases initials', () => {
    expect(getInitials('priya sharma')).toBe('PS')
  })

  it('trims extra whitespace', () => {
    expect(getInitials('  Arun   Kumar  ')).toBe('AK')
  })
})

describe('formatPhone', () => {
  it('formats 10-digit Indian number with +91 prefix', () => {
    expect(formatPhone('9876543210')).toBe('+91 98765 43210')
  })

  it('returns non-10-digit numbers as-is', () => {
    expect(formatPhone('12345')).toBe('12345')
  })

  it('returns longer numbers as-is', () => {
    expect(formatPhone('919876543210')).toBe('919876543210')
  })
})
