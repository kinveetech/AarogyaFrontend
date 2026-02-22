'use client'

import { SessionProvider } from 'next-auth/react'

const REFETCH_INTERVAL_SECONDS = 4 * 60 // 4 minutes

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <SessionProvider refetchInterval={REFETCH_INTERVAL_SECONDS} refetchOnWindowFocus>
      {children}
    </SessionProvider>
  )
}
