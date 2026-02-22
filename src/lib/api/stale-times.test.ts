import { describe, it, expect } from 'vitest'
import { staleTimes } from './stale-times'

describe('staleTimes', () => {
  it('reports stale time is 2 minutes', () => {
    expect(staleTimes.reports).toBe(120_000)
  })

  it('profile stale time is 10 minutes', () => {
    expect(staleTimes.profile).toBe(600_000)
  })

  it('accessGrants stale time is 1 minute', () => {
    expect(staleTimes.accessGrants).toBe(60_000)
  })

  it('consents stale time is 30 seconds', () => {
    expect(staleTimes.consents).toBe(30_000)
  })
})
