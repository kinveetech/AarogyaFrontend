import { render, type RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ChakraProvider } from '@chakra-ui/react'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { system } from '@/theme'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

function AllProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = createTestQueryClient()

  return (
    <SessionProvider session={null}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>
          <ThemeProvider attribute="class" disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}

function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export { customRender as render, userEvent }
export * from '@testing-library/react'
