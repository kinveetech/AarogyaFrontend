import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import RegistrationRejectedPage from './page'

const mockSignOut = vi.fn()

vi.mock('next-auth/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-auth/react')>()
  return {
    ...actual,
    signOut: (...args: unknown[]) => mockSignOut(...args),
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }),
}))

vi.mock('@/hooks/registration', () => ({
  useRegistrationStatus: () => ({
    data: {
      status: 'registration_rejected',
      rejectionReason: 'Invalid medical license number',
    },
    isLoading: false,
    isError: false,
  }),
}))

describe('RegistrationRejectedPage', () => {
  it('renders the rejected title', () => {
    render(<RegistrationRejectedPage />)
    expect(screen.getByText('Registration Rejected')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<RegistrationRejectedPage />)
    expect(
      screen.getByText(/could not be approved/i),
    ).toBeInTheDocument()
  })

  it('renders the rejection reason', () => {
    render(<RegistrationRejectedPage />)
    expect(screen.getByText('Invalid medical license number')).toBeInTheDocument()
    expect(screen.getByText('Reason')).toBeInTheDocument()
  })

  it('renders a sign out button', () => {
    render(<RegistrationRejectedPage />)
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  it('calls signOut with login callbackUrl when sign out is clicked', async () => {
    const user = userEvent.setup()
    render(<RegistrationRejectedPage />)

    await user.click(screen.getByRole('button', { name: /sign out/i }))
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' })
  })
})
