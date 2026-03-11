import { describe, it, expect } from 'vitest'
import { computeSha256, checksumsMatch } from './checksum'

describe('computeSha256', () => {
  it('computes correct SHA-256 hash for known input', async () => {
    const input = new TextEncoder().encode('hello world')
    const blob = new Blob([input])
    const hash = await computeSha256(blob)

    // SHA-256 of "hello world" is a well-known value
    expect(hash).toBe(
      'B94D27B9934D3E08A52E52D7DA7DABFAC484EFE37A5380EE9088F7ACE2EFCDE9',
    )
  })

  it('computes correct hash for empty input', async () => {
    const blob = new Blob([])
    const hash = await computeSha256(blob)

    // SHA-256 of empty string
    expect(hash).toBe(
      'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
    )
  })

  it('returns uppercase hex string', async () => {
    const blob = new Blob([new Uint8Array([0, 1, 2, 3])])
    const hash = await computeSha256(blob)

    expect(hash).toBe(hash.toUpperCase())
    expect(hash).toMatch(/^[0-9A-F]{64}$/)
  })

  it('produces different hashes for different inputs', async () => {
    const blob1 = new Blob([new TextEncoder().encode('file content 1')])
    const blob2 = new Blob([new TextEncoder().encode('file content 2')])

    const hash1 = await computeSha256(blob1)
    const hash2 = await computeSha256(blob2)

    expect(hash1).not.toBe(hash2)
  })
})

describe('checksumsMatch', () => {
  it('returns true for identical checksums', () => {
    const checksum = 'B94D27B9934D3E08A52E52D7DA7DABFAC484EFE37A5380EE9088F7ACE2EFCDE9'
    expect(checksumsMatch(checksum, checksum)).toBe(true)
  })

  it('returns true for case-insensitive match', () => {
    const upper = 'B94D27B9934D3E08A52E52D7DA7DABFAC484EFE37A5380EE9088F7ACE2EFCDE9'
    const lower = 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
    expect(checksumsMatch(upper, lower)).toBe(true)
  })

  it('returns false for different checksums', () => {
    const a = 'B94D27B9934D3E08A52E52D7DA7DABFAC484EFE37A5380EE9088F7ACE2EFCDE9'
    const b = 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855'
    expect(checksumsMatch(a, b)).toBe(false)
  })

  it('returns true for mixed-case comparison', () => {
    const a = 'AbCd1234EF567890AbCd1234EF567890AbCd1234EF567890AbCd1234EF567890'
    const b = 'abcd1234ef567890abcd1234ef567890abcd1234ef567890abcd1234ef567890'
    expect(checksumsMatch(a, b)).toBe(true)
  })
})
