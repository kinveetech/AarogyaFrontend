import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import PortalLayout from './layout'

vi.mock('next/navigation', () => ({
  usePathname: () => '/reports',
}))

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn(),
  }),
}))

describe('PortalLayout', () => {
  it('renders children', () => {
    render(
      <PortalLayout>
        <div>Test Content</div>
      </PortalLayout>
    )
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders the top bar with Aarogya branding', () => {
    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    )
    expect(screen.getByText('Aarogya')).toBeInTheDocument()
  })

  it('renders the sidebar navigation', () => {
    const { container } = render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    )
    // Sidebar uses display={{ base: 'none', md: 'flex' }}, hidden in jsdom (no media queries)
    const nav = container.querySelector('nav[aria-label="Main navigation"]')
    expect(nav).toBeInTheDocument()
  })

  it('renders the bottom navigation', () => {
    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    )
    expect(screen.getByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument()
  })

  it('renders a main content area', () => {
    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('toggles sidebar collapse via top bar menu button', async () => {
    const user = userEvent.setup()
    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    )

    // Click the mobile menu toggle to trigger setCollapsed
    await user.click(screen.getByRole('button', { name: /toggle menu/i }))
    // After toggling, the sidebar collapse button should say "Expand"
    expect(screen.getByRole('button', { name: /expand sidebar/i, hidden: true })).toBeInTheDocument()
  })

  it('toggles sidebar collapse via sidebar chevron', async () => {
    const user = userEvent.setup()
    render(
      <PortalLayout>
        <div>Content</div>
      </PortalLayout>
    )

    // Click the sidebar collapse button
    await user.click(screen.getByRole('button', { name: /collapse sidebar/i, hidden: true }))
    expect(screen.getByRole('button', { name: /expand sidebar/i, hidden: true })).toBeInTheDocument()
  })
})
