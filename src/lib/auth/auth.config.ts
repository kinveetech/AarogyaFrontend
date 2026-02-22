import type { NextAuthConfig } from 'next-auth'
import CognitoPKCE from './cognito-provider'
import { refreshAccessToken } from './refresh-token'
import './types'

const PROTECTED_ROUTES = ['/reports', '/access', '/emergency', '/settings']
const TOKEN_EXPIRY_BUFFER_SECONDS = 60

export const authConfig: NextAuthConfig = {
  providers: [CognitoPKCE()],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign-in — persist tokens from the provider response
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token ?? '',
          refreshToken: account.refresh_token ?? '',
          expiresAt: account.expires_at ?? 0,
          userId: user.id ?? '',
          role: user.role ?? 'patient',
        }
      }

      // Subsequent requests — refresh if expired (with buffer)
      const now = Math.floor(Date.now() / 1000)
      if (token.expiresAt - TOKEN_EXPIRY_BUFFER_SECONDS > now) {
        return token
      }

      return refreshAccessToken(token)
    },

    session({ session, token }) {
      session.user.id = token.userId
      session.user.role = token.role
      return session
    },

    authorized({ auth, request: { nextUrl } }) {
      const isAuthenticated = !!auth?.user
      const pathname = nextUrl.pathname

      const isProtected = PROTECTED_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      )

      if (isProtected && !isAuthenticated) {
        const loginUrl = new URL('/login', nextUrl.origin)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return Response.redirect(loginUrl)
      }

      if (pathname === '/login' && isAuthenticated) {
        return Response.redirect(new URL('/reports', nextUrl.origin))
      }

      return true
    },
  },
}
