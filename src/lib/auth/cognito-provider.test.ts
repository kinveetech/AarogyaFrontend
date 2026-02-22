import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { TokenSet } from '@auth/core/types'
import CognitoPKCE from './cognito-provider'

const mockTokens = {} as TokenSet

beforeEach(() => {
  vi.stubEnv('COGNITO_DOMAIN', 'https://auth.example.com')
  vi.stubEnv('COGNITO_ISSUER', 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_abc')
  vi.stubEnv('COGNITO_CLIENT_ID', 'test-client-id')
  vi.stubEnv('COGNITO_CLIENT_SECRET', 'test-client-secret')
  vi.stubEnv('API_URL', 'https://api.example.com')
})

describe('CognitoPKCE provider', () => {
  it('has correct id and type', () => {
    const provider = CognitoPKCE()
    expect(provider.id).toBe('cognito-pkce')
    expect(provider.type).toBe('oidc')
  })

  it('uses Cognito authorize endpoint', () => {
    const provider = CognitoPKCE()
    expect(provider.authorization).toEqual({
      url: 'https://auth.example.com/oauth2/authorize',
      params: { scope: 'openid email profile' },
    })
  })

  it('uses backend token endpoint', () => {
    const provider = CognitoPKCE()
    expect(provider.token).toEqual({
      url: 'https://api.example.com/auth/pkce/token',
    })
  })

  it('uses Cognito userinfo endpoint', () => {
    const provider = CognitoPKCE()
    expect(provider.userinfo).toEqual({
      url: 'https://auth.example.com/oauth2/userInfo',
    })
  })

  it('enables PKCE and state checks', () => {
    const provider = CognitoPKCE()
    expect(provider.checks).toEqual(['pkce', 'state'])
  })

  it('maps profile correctly', () => {
    const provider = CognitoPKCE()
    const result = provider.profile!({
      sub: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      'custom:role': 'doctor',
    }, mockTokens)

    expect(result).toEqual({
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'doctor',
    })
  })

  it('throws when required env vars are missing', () => {
    vi.stubEnv('COGNITO_DOMAIN', '')
    expect(() => CognitoPKCE()).toThrow('Missing required environment variable: COGNITO_DOMAIN')
  })

  it('defaults role to patient when custom:role is absent', () => {
    const provider = CognitoPKCE()
    const result = provider.profile!({
      sub: 'user-456',
    }, mockTokens)

    expect(result).toEqual({
      id: 'user-456',
      name: null,
      email: null,
      role: 'patient',
    })
  })
})
