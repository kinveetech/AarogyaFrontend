import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/render'
import CallbackPage from './page'

let mockSearchParams = new URLSearchParams()
let mockResolvedTheme = 'light'

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

describe('CallbackPage', () => {
  it('shows Shield Tree loader when no error param', () => {
    mockSearchParams = new URLSearchParams()
    render(<CallbackPage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows full-page loader overlay when no error', () => {
    mockSearchParams = new URLSearchParams()
    const { container } = render(<CallbackPage />)
    const overlay = container.firstElementChild as HTMLElement
    expect(overlay).toHaveStyle({ position: 'fixed' })
  })

  it('shows error message when error param is present', () => {
    mockSearchParams = new URLSearchParams('error=OAuthSignin')
    render(<CallbackPage />)
    expect(screen.getByText('Sign-in failed')).toBeInTheDocument()
    expect(screen.getByText(/could not start the sign-in process/i)).toBeInTheDocument()
  })

  it('shows default error message for unknown error codes', () => {
    mockSearchParams = new URLSearchParams('error=SomeUnknownError')
    render(<CallbackPage />)
    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument()
  })

  it('shows specific message for AccessDenied error', () => {
    mockSearchParams = new URLSearchParams('error=AccessDenied')
    render(<CallbackPage />)
    expect(screen.getByText(/access was denied/i)).toBeInTheDocument()
  })

  it('shows specific message for Configuration error', () => {
    mockSearchParams = new URLSearchParams('error=Configuration')
    render(<CallbackPage />)
    expect(screen.getByText(/server configuration/i)).toBeInTheDocument()
  })

  it('renders retry button that links to /login', () => {
    mockSearchParams = new URLSearchParams('error=Default')
    render(<CallbackPage />)
    const link = screen.getByRole('link', { name: /try again/i })
    expect(link).toHaveAttribute('href', '/login')
  })

  it('renders Shield Tree logo in error state', () => {
    mockSearchParams = new URLSearchParams('error=Default')
    render(<CallbackPage />)
    expect(screen.getByText('Aarogya')).toBeInTheDocument()
  })

  it('does not show loader when error is present', () => {
    mockSearchParams = new URLSearchParams('error=Default')
    render(<CallbackPage />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders error state in dark mode without errors', () => {
    mockResolvedTheme = 'dark'
    mockSearchParams = new URLSearchParams('error=OAuthCallback')
    render(<CallbackPage />)
    expect(screen.getByText('Sign-in failed')).toBeInTheDocument()
    expect(screen.getByText('Aarogya')).toBeInTheDocument()
  })
})
