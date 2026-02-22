import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/render'
import { TopBar } from './top-bar'

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: vi.fn(),
  }),
}))

describe('TopBar', () => {
  it('renders the Aarogya logo text', () => {
    render(<TopBar onMenuToggle={vi.fn()} />)
    expect(screen.getByText('Aarogya')).toBeInTheDocument()
  })

  it('renders the notifications bell button', () => {
    render(<TopBar onMenuToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument()
  })

  it('renders the color mode toggle', () => {
    render(<TopBar onMenuToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
  })

  it('renders the mobile menu toggle button', () => {
    render(<TopBar onMenuToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument()
  })

  it('calls onMenuToggle when hamburger is clicked', async () => {
    const onMenuToggle = vi.fn()
    const { userEvent } = await import('@/test/render')
    const user = userEvent.setup()
    render(<TopBar onMenuToggle={onMenuToggle} />)

    await user.click(screen.getByRole('button', { name: /toggle menu/i }))
    expect(onMenuToggle).toHaveBeenCalledOnce()
  })
})
