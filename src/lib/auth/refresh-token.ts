import type { JWT } from 'next-auth/jwt'

interface RefreshResponse {
  access_token: string
  refresh_token: string
  expires_in: number
}

export async function refreshAccessToken(token: JWT): Promise<JWT> {
  const apiUrl = process.env.API_URL
  if (!apiUrl) {
    throw new Error('Missing required environment variable: API_URL')
  }

  const response = await fetch(`${apiUrl}/auth/token/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: token.refreshToken }),
  })

  if (!response.ok) {
    return { ...token, error: 'RefreshTokenError' }
  }

  const data: RefreshResponse = await response.json()

  return {
    ...token,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
    error: undefined,
  }
}
