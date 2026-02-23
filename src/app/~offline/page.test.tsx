import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/render'
import OfflinePage from './page'

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }),
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
            const { style, ...divProps } = filteredProps as Record<string, unknown> & {
              style?: React.CSSProperties
            }
            return (
              <div style={style as React.CSSProperties} {...divProps}>
                {children}
              </div>
            )
          }
          return <>{children}</>
        }
      },
    },
  ),
}))

describe('OfflinePage', () => {
  const reloadMock = vi.fn()

  beforeEach(() => {
    reloadMock.mockClear()
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: reloadMock },
    })
  })

  it('renders the offline heading', () => {
    render(<OfflinePage />)
    expect(screen.getByText("You're offline")).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<OfflinePage />)
    expect(
      screen.getByText(/lost your internet connection/),
    ).toBeInTheDocument()
  })

  it('renders a Try Again button', () => {
    render(<OfflinePage />)
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument()
  })

  it('calls window.location.reload when Try Again is clicked', async () => {
    const { userEvent } = await import('@/test/render')
    const user = userEvent.setup()
    render(<OfflinePage />)
    await user.click(screen.getByRole('button', { name: 'Try Again' }))
    expect(reloadMock).toHaveBeenCalledOnce()
  })

  it('renders the ShieldTreeLoader', () => {
    render(<OfflinePage />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
