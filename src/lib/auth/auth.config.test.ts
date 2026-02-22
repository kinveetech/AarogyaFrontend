import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authConfig } from './auth.config'
import type { JWT } from 'next-auth/jwt'
import type { Session, Account, User } from 'next-auth'
import './types'

vi.mock('./refresh-token', () => ({
  refreshAccessToken: vi.fn().mockResolvedValue({
    accessToken: 'refreshed-access',
    refreshToken: 'refreshed-refresh',
    expiresAt: 9999999999,
    userId: 'user-1',
    role: 'patient',
    sub: 'user-1',
  }),
}))

const { refreshAccessToken } = await import('./refresh-token')

beforeEach(() => {
  vi.clearAllMocks()
})

describe('jwt callback', () => {
  const jwtCallback = authConfig.callbacks!.jwt! as (params: {
    token: JWT
    account: Account | null
    user: User
  }) => Promise<JWT>

  it('stores tokens on initial sign-in', async () => {
    const token = { sub: 'user-1' } as JWT
    const account = {
      access_token: 'at-123',
      refresh_token: 'rt-456',
      expires_at: 9999999999,
      provider: 'cognito-pkce',
      type: 'oidc' as const,
      providerAccountId: 'user-1',
    }
    const user = { id: 'user-1', role: 'doctor' as const }

    const result = await jwtCallback({ token, account, user })

    expect(result.accessToken).toBe('at-123')
    expect(result.refreshToken).toBe('rt-456')
    expect(result.expiresAt).toBe(9999999999)
    expect(result.userId).toBe('user-1')
    expect(result.role).toBe('doctor')
  })

  it('returns token unchanged when not expired', async () => {
    const futureExpiry = Math.floor(Date.now() / 1000) + 600
    const token = {
      accessToken: 'valid-at',
      refreshToken: 'valid-rt',
      expiresAt: futureExpiry,
      userId: 'user-1',
      role: 'patient' as const,
      sub: 'user-1',
    } as JWT

    const result = await jwtCallback({
      token,
      account: null,
      user: {} as User,
    })

    expect(result.accessToken).toBe('valid-at')
    expect(refreshAccessToken).not.toHaveBeenCalled()
  })

  it('refreshes token when expired', async () => {
    const pastExpiry = Math.floor(Date.now() / 1000) - 100
    const token = {
      accessToken: 'expired-at',
      refreshToken: 'expired-rt',
      expiresAt: pastExpiry,
      userId: 'user-1',
      role: 'patient' as const,
      sub: 'user-1',
    } as JWT

    const result = await jwtCallback({
      token,
      account: null,
      user: {} as User,
    })

    expect(refreshAccessToken).toHaveBeenCalledWith(token)
    expect(result.accessToken).toBe('refreshed-access')
  })
})

describe('session callback', () => {
  const sessionCallback = authConfig.callbacks!.session! as (params: {
    session: Session
    token: JWT
  }) => Session

  it('copies userId and role to session.user, excludes tokens', () => {
    const session = {
      user: { id: '', name: 'Test', email: 'test@example.com', role: 'patient' as const },
      expires: new Date().toISOString(),
    }
    const token = {
      userId: 'user-42',
      role: 'doctor' as const,
      accessToken: 'secret-at',
      refreshToken: 'secret-rt',
      expiresAt: 9999999999,
      sub: 'user-42',
    } as JWT

    const result = sessionCallback({ session, token })

    expect(result.user.id).toBe('user-42')
    expect(result.user.role).toBe('doctor')
    expect(result).not.toHaveProperty('accessToken')
    expect(result).not.toHaveProperty('refreshToken')
  })
})

describe('authorized callback', () => {
  const authorizedCallback = authConfig.callbacks!.authorized! as (params: {
    auth: { user: User } | null
    request: { nextUrl: URL }
  }) => boolean | Response

  it('redirects unauthenticated users from protected routes to login', () => {
    const result = authorizedCallback({
      auth: null,
      request: { nextUrl: new URL('https://app.test/reports') },
    })

    expect(result).toBeInstanceOf(Response)
    const location = (result as Response).headers.get('location')
    expect(location).toContain('/login')
    expect(location).toContain('callbackUrl=%2Freports')
  })

  it('redirects authenticated users from /login to /reports', () => {
    const result = authorizedCallback({
      auth: { user: { id: 'user-1' } },
      request: { nextUrl: new URL('https://app.test/login') },
    })

    expect(result).toBeInstanceOf(Response)
    const location = (result as Response).headers.get('location')
    expect(location).toContain('/reports')
  })

  it('allows authenticated users on protected routes', () => {
    const result = authorizedCallback({
      auth: { user: { id: 'user-1' } },
      request: { nextUrl: new URL('https://app.test/reports/123') },
    })

    expect(result).toBe(true)
  })

  it('allows unauthenticated users on public routes', () => {
    const result = authorizedCallback({
      auth: null,
      request: { nextUrl: new URL('https://app.test/about') },
    })

    expect(result).toBe(true)
  })
})
