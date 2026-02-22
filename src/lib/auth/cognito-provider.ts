import type { OIDCConfig } from 'next-auth/providers'
import type { UserRole } from './types'

interface CognitoProfile {
  sub: string
  name?: string
  email?: string
  'custom:role'?: string
}

export default function CognitoPKCE(): OIDCConfig<CognitoProfile> {
  const cognitoDomain = process.env.COGNITO_DOMAIN!
  const apiUrl = process.env.API_URL!

  return {
    id: 'cognito-pkce',
    name: 'Cognito PKCE',
    type: 'oidc',
    issuer: process.env.COGNITO_ISSUER,
    clientId: process.env.COGNITO_CLIENT_ID!,
    clientSecret: process.env.COGNITO_CLIENT_SECRET!,
    authorization: {
      url: `${cognitoDomain}/oauth2/authorize`,
      params: { scope: 'openid email profile' },
    },
    token: {
      url: `${apiUrl}/auth/pkce/token`,
    },
    userinfo: {
      url: `${cognitoDomain}/oauth2/userInfo`,
    },
    checks: ['pkce', 'state'],
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
