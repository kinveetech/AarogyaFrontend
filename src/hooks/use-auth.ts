'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import type { UserRole } from '@/lib/auth'

interface AuthUser {
  id: string
  name: string | null | undefined
  email: string | null | undefined
  role: UserRole
}

interface UseAuthReturn {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession()

  const user: AuthUser | null =
    session?.user
      ? {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        }
      : null

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    login: () => void signIn('cognito-pkce', { callbackUrl: '/reports' }),
    logout: () => void signOut({ callbackUrl: '/login' }),
  }
}
