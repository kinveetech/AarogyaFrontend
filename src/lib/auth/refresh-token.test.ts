import { describe, it, expect, beforeEach, vi } from 'vitest'
import { refreshAccessToken } from './refresh-token'
import type { JWT } from 'next-auth/jwt'
import './types'

const baseToken: JWT = {
  accessToken: 'old-access',
  refreshToken: 'old-refresh',
  expiresAt: 1000,
  userId: 'user-1',
  role: 'patient',
  sub: 'user-1',
}

beforeEach(() => {
  vi.stubEnv('API_URL', 'https://api.example.com')
  vi.restoreAllMocks()
})

describe('refreshAccessToken', () => {
  it('returns updated tokens on success', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: 'new-access',
          refresh_token: 'new-refresh',
          expires_in: 3600,
        }),
        { status: 200 },
      ),
    )

    const result = await refreshAccessToken(baseToken)

    expect(fetch).toHaveBeenCalledWith('https://api.example.com/auth/token/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: 'old-refresh' }),
    })

    expect(result.accessToken).toBe('new-access')
    expect(result.refreshToken).toBe('new-refresh')
    expect(result.expiresAt).toBeGreaterThan(0)
    expect(result.error).toBeUndefined()
  })

  it('rotates refresh token', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          access_token: 'rotated-access',
          refresh_token: 'rotated-refresh',
          expires_in: 1800,
        }),
        { status: 200 },
      ),
    )

    const result = await refreshAccessToken(baseToken)
    expect(result.refreshToken).toBe('rotated-refresh')
    expect(result.refreshToken).not.toBe(baseToken.refreshToken)
  })

  it('returns RefreshTokenError on HTTP error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Unauthorized', { status: 401 }),
    )

    const result = await refreshAccessToken(baseToken)

    expect(result.error).toBe('RefreshTokenError')
    expect(result.accessToken).toBe('old-access')
  })

  it('throws on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    await expect(refreshAccessToken(baseToken)).rejects.toThrow('Network error')
  })

  it('throws when API_URL is missing', async () => {
    vi.stubEnv('API_URL', '')

    await expect(refreshAccessToken(baseToken)).rejects.toThrow(
      'Missing required environment variable: API_URL',
    )
  })
})
