export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: [
    '/reports/:path*',
    '/access/:path*',
    '/emergency/:path*',
    '/settings/:path*',
    '/register/:path*',
    '/login',
  ],
}
