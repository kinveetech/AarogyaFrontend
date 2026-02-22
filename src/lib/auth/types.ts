import type { DefaultSession } from 'next-auth'

export type UserRole = 'patient' | 'doctor'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    role?: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    refreshToken: string
    expiresAt: number
    userId: string
    role: UserRole
    error?: 'RefreshTokenError'
  }
}
