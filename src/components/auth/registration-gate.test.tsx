import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/render'
import { RegistrationGate } from './registration-gate'

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/reports',
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

let mockRegistrationStatus: {
  data: { status: string; role?: string; rejectionReason?: string } | undefined
  isLoading: boolean
  isError: boolean
} = {
  data: undefined,
  isLoading: true,
  isError: false,
}

vi.mock('@/hooks/registration', () => ({
  useRegistrationStatus: () => mockRegistrationStatus,
}))

vi.mock('@/components/ui/shield-tree-loader', () => ({
  ShieldTreeLoader: () => <div data-testid="shield-tree-loader" role="status">Loading...</div>,
}))

beforeEach(() => {
  mockReplace.mockReset()
  mockRegistrationStatus = {
    data: undefined,
    isLoading: true,
    isError: false,
  }
})

describe('RegistrationGate', () => {
  it('shows loader when loading', () => {
    mockRegistrationStatus = {
      data: undefined,
      isLoading: true,
      isError: false,
    }

    render(
      <RegistrationGate>
        <div>Protected Content</div>
      </RegistrationGate>,
    )

    expect(screen.getByTestId('shield-tree-loader')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when status is approved', () => {
    mockRegistrationStatus = {
      data: { status: 'approved', role: 'patient' },
      isLoading: false,
      isError: false,
    }

    render(
      <RegistrationGate>
        <div>Protected Content</div>
      </RegistrationGate>,
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /register when status is registration_required', async () => {
    mockRegistrationStatus = {
      data: { status: 'registration_required' },
      isLoading: false,
      isError: false,
    }

    render(
      <RegistrationGate>
        <div>Protected Content</div>
      </RegistrationGate>,
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/register')
    })
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to /register/pending when status is registration_pending_approval', async () => {
    mockRegistrationStatus = {
      data: { status: 'registration_pending_approval' },
      isLoading: false,
      isError: false,
    }

    render(
      <RegistrationGate>
        <div>Protected Content</div>
      </RegistrationGate>,
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/register/pending')
    })
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects to /register/rejected when status is registration_rejected', async () => {
    mockRegistrationStatus = {
      data: { status: 'registration_rejected' },
      isLoading: false,
      isError: false,
    }

    render(
      <RegistrationGate>
        <div>Protected Content</div>
      </RegistrationGate>,
    )

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/register/rejected')
    })
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('does not redirect when there is an error', () => {
    mockRegistrationStatus = {
      data: undefined,
      isLoading: false,
      isError: true,
    }

    render(
      <RegistrationGate>
        <div>Protected Content</div>
      </RegistrationGate>,
    )

    expect(mockReplace).not.toHaveBeenCalled()
  })

  it('does not render children while redirecting', () => {
    mockRegistrationStatus = {
      data: { status: 'registration_required' },
      isLoading: false,
      isError: false,
    }

    render(
      <RegistrationGate>
        <div>Protected Content</div>
      </RegistrationGate>,
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('does not show loader when not loading', () => {
    mockRegistrationStatus = {
      data: { status: 'approved', role: 'patient' },
      isLoading: false,
      isError: false,
    }

    render(
      <RegistrationGate>
        <div>Protected Content</div>
      </RegistrationGate>,
    )

    expect(screen.queryByTestId('shield-tree-loader')).not.toBeInTheDocument()
  })
})
