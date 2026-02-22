import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/render'
import { ShieldTreeLoader } from './shield-tree-loader'

let mockResolvedTheme = 'light'

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
          // SVG elements — use createElement to avoid JSX namespace issues
          const element = document.createElementNS('http://www.w3.org/2000/svg', prop)
          for (const [key, value] of Object.entries(filteredProps)) {
            if (key === 'data-testid') {
              element.setAttribute('data-testid', String(value))
            } else if (typeof value === 'string' || typeof value === 'number') {
              element.setAttribute(key, String(value))
            }
          }
          return <>{children}</>
        }
      },
    },
  ),
}))

describe('ShieldTreeLoader', () => {
  beforeEach(() => {
    mockResolvedTheme = 'light'
  })

  it('renders with status role and aria-label', () => {
    render(<ShieldTreeLoader />)
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
  })

  it('renders SVG with expected viewBox', () => {
    const { container } = render(<ShieldTreeLoader />)
    const svg = container.querySelector('svg[viewBox="0 0 80 80"]')
    expect(svg).toBeInTheDocument()
  })

  it('renders sm size container', () => {
    const { container } = render(<ShieldTreeLoader size="sm" />)
    const sizeContainer = container.querySelector('[role="status"] > div')
    expect(sizeContainer).toHaveStyle({ width: '80px', height: '80px' })
  })

  it('renders md size container (default)', () => {
    const { container } = render(<ShieldTreeLoader />)
    const sizeContainer = container.querySelector('[role="status"] > div')
    expect(sizeContainer).toHaveStyle({ width: '160px', height: '160px' })
  })

  it('renders lg size container', () => {
    const { container } = render(<ShieldTreeLoader size="lg" />)
    const sizeContainer = container.querySelector('[role="status"] > div')
    expect(sizeContainer).toHaveStyle({ width: '240px', height: '240px' })
  })

  it('renders full-page overlay with fixed positioning', () => {
    const { container } = render(<ShieldTreeLoader variant="fullPage" />)
    const overlay = container.firstElementChild as HTMLElement
    expect(overlay).toHaveStyle({ position: 'fixed' })
  })

  it('does not render full-page overlay for inline variant', () => {
    const { container } = render(<ShieldTreeLoader variant="inline" />)
    const statusEl = container.querySelector('[role="status"]')
    expect(statusEl).toBe(container.firstElementChild)
  })

  it('shows brand text for fullPage variant by default', () => {
    render(<ShieldTreeLoader variant="fullPage" />)
    expect(screen.getByText('Aarogya')).toBeInTheDocument()
    expect(screen.getByText('Your Health, Our Priority')).toBeInTheDocument()
  })

  it('hides brand text for inline variant by default', () => {
    render(<ShieldTreeLoader variant="inline" />)
    expect(screen.queryByText('Aarogya')).not.toBeInTheDocument()
  })

  it('shows brand text when showBrandText is true', () => {
    render(<ShieldTreeLoader showBrandText />)
    expect(screen.getByText('Aarogya')).toBeInTheDocument()
  })

  it('hides brand text when showBrandText is false on fullPage', () => {
    render(<ShieldTreeLoader variant="fullPage" showBrandText={false} />)
    expect(screen.queryByText('Aarogya')).not.toBeInTheDocument()
  })

  it('shows progress bar for fullPage variant by default', () => {
    render(<ShieldTreeLoader variant="fullPage" />)
    expect(screen.getByText('Growing your wellness journey...')).toBeInTheDocument()
  })

  it('hides progress bar for inline variant by default', () => {
    render(<ShieldTreeLoader variant="inline" />)
    expect(screen.queryByText('Growing your wellness journey...')).not.toBeInTheDocument()
  })

  it('shows progress bar when showProgress is true', () => {
    render(<ShieldTreeLoader showProgress />)
    expect(screen.getByText('Growing your wellness journey...')).toBeInTheDocument()
  })

  it('hides progress bar when showProgress is false on fullPage', () => {
    render(<ShieldTreeLoader variant="fullPage" showProgress={false} />)
    expect(screen.queryByText('Growing your wellness journey...')).not.toBeInTheDocument()
  })

  it('renders three ripple elements', () => {
    render(<ShieldTreeLoader />)
    const ripples = screen.getAllByTestId('ripple')
    expect(ripples).toHaveLength(3)
  })

  it('renders in dark mode without errors', () => {
    mockResolvedTheme = 'dark'
    render(<ShieldTreeLoader variant="fullPage" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Aarogya')).toBeInTheDocument()
  })
})
