import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { ColorModeToggle } from './color-mode-toggle'

const mockSetTheme = vi.fn()
let mockResolvedTheme = 'light'

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: mockSetTheme,
  }),
}))

describe('ColorModeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockClear()
    mockResolvedTheme = 'light'
  })

  it('renders with "switch to dark mode" label in light mode', () => {
    render(<ColorModeToggle />)
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
  })

  it('toggles to dark mode on click in light mode', async () => {
    const user = userEvent.setup()
    render(<ColorModeToggle />)

    await user.click(screen.getByRole('button'))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('renders with "switch to light mode" label in dark mode', () => {
    mockResolvedTheme = 'dark'
    render(<ColorModeToggle />)
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
  })

  it('toggles to light mode on click in dark mode', async () => {
    mockResolvedTheme = 'dark'
    const user = userEvent.setup()
    render(<ColorModeToggle />)

    await user.click(screen.getByRole('button'))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })
})
