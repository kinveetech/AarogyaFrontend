import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import RegistrationPendingPage from './page'

const mockSignOut = vi.fn()

vi.mock('next-auth/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-auth/react')>()
  return {
    ...actual,
    signOut: (...args: unknown[]) => mockSignOut(...args),
  }
})

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }),
}))

describe('RegistrationPendingPage', () => {
  it('renders the pending title', () => {
    render(<RegistrationPendingPage />)
    expect(screen.getByText('Registration Pending')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<RegistrationPendingPage />)
    expect(
      screen.getByText(/awaiting admin approval/i),
    ).toBeInTheDocument()
  })

  it('renders the approval timeline info', () => {
    render(<RegistrationPendingPage />)
    expect(
      screen.getByText(/1-2 business days/i),
    ).toBeInTheDocument()
  })

  it('renders a sign out button', () => {
    render(<RegistrationPendingPage />)
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('calls signOut with login callbackUrl when sign out is clicked', async () => {
    const user = userEvent.setup()
    render(<RegistrationPendingPage />)

    await user.click(screen.getByRole('button', { name: /sign out/i }))
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' })
  })
})
