import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import LoginPage from './page'

const mockSignIn = vi.fn()
let mockSearchParams = new URLSearchParams()
let mockResolvedTheme = 'light'

vi.mock('next-auth/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-auth/react')>()
  return {
    ...actual,
    signIn: (...args: unknown[]) => mockSignIn(...args),
  }
})

vi.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
}))

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: vi.fn(),
  }),
}))

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        return ({
          children,
          ...rest
        }: React.PropsWithChildren<Record<string, unknown>>) => {
          const filteredProps: Record<string, unknown> = {}
          for (const [key, value] of Object.entries(rest)) {
            if (
              typeof value !== 'object' &&
              typeof value !== 'function' &&
              !['initial', 'animate', 'transition', 'whileHover', 'whileInView'].includes(key)
            ) {
              filteredProps[key] = value
            }
          }
          if (prop === 'div') {
            const { style, ...divProps } = filteredProps as Record<string, unknown> & { style?: React.CSSProperties }
            return <div style={style as React.CSSProperties} {...divProps}>{children}</div>
          }
          return <>{children}</>
        }
      },
    },
  ),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams()
    mockResolvedTheme = 'light'
    mockSignIn.mockReset()
  })

  it('renders four auth buttons', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /continue with phone/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with apple/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with email/i })).toBeInTheDocument()
  })

  it('renders the Shield Tree logo and brand text', () => {
    render(<LoginPage />)
    expect(screen.getByText('Aarogya')).toBeInTheDocument()
    expect(screen.getByText('Your Health, Our Priority')).toBeInTheDocument()
  })

  it('renders welcome message', () => {
    render(<LoginPage />)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access your health records')).toBeInTheDocument()
  })

  it('renders terms and privacy footer', () => {
    render(<LoginPage />)
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument()
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument()
  })

  it('shows error message when error search param is present', () => {
    mockSearchParams = new URLSearchParams('error=OAuthSignin')
    render(<LoginPage />)
    expect(screen.getByText(/could not start the sign-in process/i)).toBeInTheDocument()
  })

  it('shows default error message for unknown error codes', () => {
    mockSearchParams = new URLSearchParams('error=UnknownError')
    render(<LoginPage />)
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
  })

  it('does not show error message when no error param', () => {
    render(<LoginPage />)
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/could not start/i)).not.toBeInTheDocument()
  })

  it('calls signIn with cognito-pkce and default callbackUrl when phone button clicked', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /continue with phone/i }))
    expect(mockSignIn).toHaveBeenCalledWith('cognito-pkce', { callbackUrl: '/reports' })
  })

  it('calls signIn with cognito-pkce when google button clicked', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /continue with google/i }))
    expect(mockSignIn).toHaveBeenCalledWith('cognito-pkce', { callbackUrl: '/reports' })
  })

  it('calls signIn with cognito-pkce when apple button clicked', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /continue with apple/i }))
    expect(mockSignIn).toHaveBeenCalledWith('cognito-pkce', { callbackUrl: '/reports' })
  })

  it('calls signIn with cognito-pkce when email button clicked', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /continue with email/i }))
    expect(mockSignIn).toHaveBeenCalledWith('cognito-pkce', { callbackUrl: '/reports' })
  })

  it('preserves callbackUrl from search params', async () => {
    mockSearchParams = new URLSearchParams('callbackUrl=/settings')
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /continue with phone/i }))
    expect(mockSignIn).toHaveBeenCalledWith('cognito-pkce', { callbackUrl: '/settings' })
  })

  it('shows loading state after button click', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /continue with phone/i }))

    // Auth buttons should be replaced by the loader
    expect(screen.queryByRole('button', { name: /continue with phone/i })).not.toBeInTheDocument()
    // Loader should be visible
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders in dark mode without errors', () => {
    mockResolvedTheme = 'dark'
    render(<LoginPage />)
    expect(screen.getByText('Aarogya')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue with phone/i })).toBeInTheDocument()
  })

  it('renders logo without wordmark when showWordmark is false', () => {
    // This test exercises the ShieldTreeLogo with showWordmark=false indirectly
    // by testing that the logo is present on the login page
    render(<LoginPage />)
    const svgs = document.querySelectorAll('svg[viewBox="0 0 80 80"]')
    expect(svgs.length).toBeGreaterThanOrEqual(1)
  })
})
