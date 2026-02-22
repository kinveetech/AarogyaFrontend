'use client'

import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider } from 'next-themes'
import { system } from '@/theme'
import { createAppQueryClient } from '@/lib/api/query-client'
import { AuthProvider } from '@/components/auth/auth-provider'

export function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
  const [queryClient] = useState(() => createAppQueryClient())

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>
          <ThemeProvider attribute="class" disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </ChakraProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AuthProvider>
  )
}
