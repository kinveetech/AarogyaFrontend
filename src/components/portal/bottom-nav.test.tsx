import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/render'
import { axe } from 'vitest-axe'
import { BottomNav } from './bottom-nav'

let mockPathname = '/reports'

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}))

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn(),
  }),
}))

describe('BottomNav', () => {
  beforeEach(() => {
    mockPathname = '/reports'
  })

  it('renders all four navigation items', () => {
    render(<BottomNav />)
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Access')).toBeInTheDocument()
    expect(screen.getByText('Emergency')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders nav links with correct hrefs', () => {
    render(<BottomNav />)
    expect(screen.getByRole('link', { name: /reports/i })).toHaveAttribute('href', '/reports')
    expect(screen.getByRole('link', { name: /access/i })).toHaveAttribute('href', '/access')
    expect(screen.getByRole('link', { name: /emergency/i })).toHaveAttribute('href', '/emergency')
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings')
  })

  it('has mobile navigation landmark', () => {
    render(<BottomNav />)
    expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument()
  })

  it('sets aria-current=page on active link', () => {
    mockPathname = '/reports'
    render(<BottomNav />)
    const reportsLink = screen.getByRole('link', { name: /reports/i })
    expect(reportsLink).toHaveAttribute('aria-current', 'page')
  })

  it('does not set aria-current on inactive links', () => {
    mockPathname = '/reports'
    render(<BottomNav />)
    const accessLink = screen.getByRole('link', { name: /access/i })
    expect(accessLink).not.toHaveAttribute('aria-current')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<BottomNav />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
