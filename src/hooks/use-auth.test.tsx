import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import { useAuth } from './use-auth'

vi.mock('next-auth/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-auth/react')>()
  return {
    ...actual,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }
})

const { signIn, signOut } = await import('next-auth/react')

function wrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider session={null}>{children}</SessionProvider>
}

function authenticatedWrapper({ children }: { children: React.ReactNode }) {
  const session = {
    user: {
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'patient' as const,
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  }
  return <SessionProvider session={session}>{children}</SessionProvider>
}

describe('useAuth', () => {
  it('returns null user when unauthenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('returns user data when authenticated', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: authenticatedWrapper,
    })

    expect(result.current.user).toEqual({
      id: 'user-1',
      name: 'Alice',
      email: 'alice@example.com',
      role: 'patient',
    })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('login calls signIn with cognito-pkce', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    result.current.login()

    expect(signIn).toHaveBeenCalledWith('cognito-pkce', {
      callbackUrl: '/reports',
    })
  })

  it('logout calls signOut with /login redirect', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    result.current.logout()

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/login' })
  })
})
