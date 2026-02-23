import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

beforeEach(() => {
  mockFetch.mockReset()
  consoleSpy.mockClear()
  vi.stubEnv('API_URL', 'https://api.example.com')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('revokeToken', () => {
  it('calls POST /api/auth/social/token/revoke with refresh token', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 200 }))

    const { revokeToken } = await import('./revoke-token')
    await revokeToken('rt-abc-123')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/api/auth/social/token/revoke',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: 'rt-abc-123' }),
      },
    )
  })

  it('swallows HTTP errors (fire-and-forget)', async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 400, statusText: 'Bad Request' }))

    const { revokeToken } = await import('./revoke-token')
    await expect(revokeToken('bad-token')).resolves.toBeUndefined()

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Token revocation failed: 400'),
    )
  })

  it('swallows network failures', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))

    const { revokeToken } = await import('./revoke-token')
    await expect(revokeToken('rt-abc')).resolves.toBeUndefined()

    expect(consoleSpy).toHaveBeenCalledWith(
      'Token revocation error:',
      expect.any(TypeError),
    )
  })

  it('throws when API_URL is missing', async () => {
    vi.stubEnv('API_URL', '')
    // Need fresh import to pick up env change — but since the module is already cached,
    // we test by directly calling with empty env
    const { revokeToken } = await import('./revoke-token')

    // API_URL is empty string which is falsy
    await expect(revokeToken('rt-abc')).rejects.toThrow(
      'Missing required environment variable: API_URL',
    )
  })
})
