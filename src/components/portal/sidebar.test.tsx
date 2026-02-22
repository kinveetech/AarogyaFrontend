import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { Sidebar } from './sidebar'

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

// The sidebar uses display={{ base: 'none', md: 'flex' }} which jsdom
// renders as hidden (no media query support). Use { hidden: true } for role queries.

describe('Sidebar', () => {
  beforeEach(() => {
    mockPathname = '/reports'
  })

  it('renders all four navigation links', () => {
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />)
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Access')).toBeInTheDocument()
    expect(screen.getByText('Emergency')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders nav links with correct hrefs', () => {
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />)
    expect(screen.getByRole('link', { name: /reports/i, hidden: true })).toHaveAttribute('href', '/reports')
    expect(screen.getByRole('link', { name: /access/i, hidden: true })).toHaveAttribute('href', '/access')
    expect(screen.getByRole('link', { name: /emergency/i, hidden: true })).toHaveAttribute('href', '/emergency')
    expect(screen.getByRole('link', { name: /settings/i, hidden: true })).toHaveAttribute('href', '/settings')
  })

  it('hides labels when collapsed', () => {
    render(<Sidebar collapsed={true} onToggle={vi.fn()} />)
    expect(screen.queryByText('Reports')).not.toBeInTheDocument()
    expect(screen.queryByText('Access')).not.toBeInTheDocument()
  })

  it('renders collapse toggle button', () => {
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /collapse sidebar/i, hidden: true })).toBeInTheDocument()
  })

  it('renders expand button when collapsed', () => {
    render(<Sidebar collapsed={true} onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /expand sidebar/i, hidden: true })).toBeInTheDocument()
  })

  it('calls onToggle when collapse button is clicked', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<Sidebar collapsed={false} onToggle={onToggle} />)

    await user.click(screen.getByRole('button', { name: /collapse sidebar/i, hidden: true }))
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('has main navigation landmark', () => {
    const { container } = render(<Sidebar collapsed={false} onToggle={vi.fn()} />)
    const nav = container.querySelector('nav[aria-label="Main navigation"]')
    expect(nav).toBeInTheDocument()
  })
})
