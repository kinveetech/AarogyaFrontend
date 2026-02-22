export async function revokeToken(refreshToken: string): Promise<void> {
  const apiUrl = process.env.API_URL
  if (!apiUrl) {
    throw new Error('Missing required environment variable: API_URL')
  }

  try {
    const response = await fetch(`${apiUrl}/auth/token/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      console.error(`Token revocation failed: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error('Token revocation error:', error)
  }
}
