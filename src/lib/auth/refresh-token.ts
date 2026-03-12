import type { JWT } from 'next-auth/jwt'

interface RefreshResponse {
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
}

export async function refreshAccessToken(token: JWT): Promise<JWT> {
  const apiUrl = process.env.API_URL
  if (!apiUrl) {
    throw new Error('Missing required environment variable: API_URL')
  }

  const response = await fetch(`${apiUrl}/auth/social/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: token.refreshToken }),
  })

  if (!response.ok) {
    return { ...token, error: 'RefreshTokenError' }
  }

  const data: RefreshResponse = await response.json()

  return {
    ...token,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + data.expiresInSeconds,
    error: undefined,
  }
}
