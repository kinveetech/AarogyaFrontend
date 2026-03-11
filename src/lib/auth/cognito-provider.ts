import type { OIDCConfig } from 'next-auth/providers'
import type { UserRole } from './types'

interface CognitoProfile {
  sub: string
  name?: string
  email?: string
  'custom:role'?: string
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export default function CognitoPKCE(): OIDCConfig<CognitoProfile> {
  const cognitoDomain = requireEnv('COGNITO_DOMAIN')

  return {
    id: 'cognito-pkce',
    name: 'Cognito PKCE',
    type: 'oidc',
    issuer: process.env.COGNITO_ISSUER,
    clientId: requireEnv('COGNITO_CLIENT_ID'),
    authorization: {
      url: `${cognitoDomain}/oauth2/authorize`,
      params: { scope: 'openid email profile' },
    },
    token: {
      url: `${cognitoDomain}/oauth2/token`,
    },
    userinfo: {
      url: `${cognitoDomain}/oauth2/userInfo`,
    },
    client: {
      token_endpoint_auth_method: 'none',
    },
    checks: ['pkce', 'state', 'nonce'],
    profile(profile, _tokens) {
      return {
        id: profile.sub,
        name: profile.name ?? null,
        email: profile.email ?? null,
        role: (profile['custom:role'] as UserRole) ?? 'patient',
      }
    },
  }
}
