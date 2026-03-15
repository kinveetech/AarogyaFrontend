import type { DefaultSession } from 'next-auth'

export type UserRole = 'patient' | 'doctor' | 'lab_technician' | 'admin'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
    error?: 'RefreshTokenError'
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
