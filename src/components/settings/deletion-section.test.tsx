import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { DeletionSection } from './deletion-section'
import type { Profile } from '@/types/profile'
import type { DeletionResponse } from '@/types/deletion'

const mockSignOut = vi.fn()
vi.mock('next-auth/react', async () => {
  const actual = await vi.importActual<typeof import('next-auth/react')>('next-auth/react')
  return {
    ...actual,
    signOut: (...args: unknown[]) => mockSignOut(...args),
  }
})

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockProfile: Profile = {
  sub: 'u1',
  firstName: 'Arjun',
  lastName: 'Kumar',
  email: 'arjun@example.com',
  phone: '9876543210',
  dateOfBirth: '1990-03-15T00:00:00Z',
  bloodGroup: 'B+',
  gender: 'male',
  address: 'Bengaluru',
  aadhaarVerified: false,
  registrationStatus: 'approved',
  roles: ['patient'],
}

const mockDeletionResponse: DeletionResponse = {
  id: 'del-1',
  status: 'pending',
  requestedAt: '2026-03-11T10:00:00Z',
}

function setupProfileFetch() {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/v1/users/me/deletion')) {
      return Promise.resolve(jsonResponse(mockDeletionResponse))
    }
    return Promise.resolve(jsonResponse(mockProfile))
  })
}

beforeEach(() => {
  mockFetch.mockReset()
  mockSignOut.mockReset()
})

describe('DeletionSection', () => {
  it('renders section heading', () => {
    setupProfileFetch()
    render(<DeletionSection />)
    expect(
      screen.getByRole('heading', { name: 'Delete Account' }),
    ).toBeInTheDocument()
  })

  it('renders description text', () => {
    setupProfileFetch()
    render(<DeletionSection />)
    expect(
      screen.getByText(/Permanently delete your Aarogya account/),
    ).toBeInTheDocument()
  })

  it('renders delete button', () => {
    setupProfileFetch()
    render(<DeletionSection />)
    expect(screen.getByTestId('delete-account-button')).toBeInTheDocument()
    expect(screen.getByTestId('delete-account-button')).toHaveTextContent(
      'Delete My Account',
    )
  })

  it('renders within a glass card container', () => {
    setupProfileFetch()
    render(<DeletionSection />)
    expect(screen.getByTestId('deletion-section')).toBeInTheDocument()
  })

  it('opens deletion dialog on button click', async () => {
    setupProfileFetch()
    render(<DeletionSection />)

    await userEvent.click(screen.getByTestId('delete-account-button'))

    await waitFor(() => {
      expect(
        screen.getByText(/This action is permanent and irreversible/),
      ).toBeInTheDocument()
    })
  })

  it('shows email confirmation input in dialog', async () => {
    setupProfileFetch()
    render(<DeletionSection />)

    await userEvent.click(screen.getByTestId('delete-account-button'))

    await waitFor(() => {
      expect(screen.getByTestId('deletion-confirm-input')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/To confirm, type your email address/),
    ).toBeInTheDocument()
  })

  it('displays user email in confirmation prompt', async () => {
    setupProfileFetch()
    render(<DeletionSection />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    await userEvent.click(screen.getByTestId('delete-account-button'))

    await waitFor(() => {
      expect(screen.getByText('arjun@example.com')).toBeInTheDocument()
    })
  })

  it('disables confirm button when email does not match', async () => {
    setupProfileFetch()
    render(<DeletionSection />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    await userEvent.click(screen.getByTestId('delete-account-button'))

    await waitFor(() => {
      expect(screen.getByTestId('deletion-confirm-button')).toBeInTheDocument()
    })

    expect(screen.getByTestId('deletion-confirm-button')).toBeDisabled()

    await userEvent.type(
      screen.getByTestId('deletion-confirm-input'),
      'wrong@email.com',
    )

    expect(screen.getByTestId('deletion-confirm-button')).toBeDisabled()
  })

  it('enables confirm button when email matches', async () => {
    setupProfileFetch()
    render(<DeletionSection />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    await userEvent.click(screen.getByTestId('delete-account-button'))

    await waitFor(() => {
      expect(screen.getByTestId('deletion-confirm-input')).toBeInTheDocument()
    })

    await userEvent.type(
      screen.getByTestId('deletion-confirm-input'),
      'arjun@example.com',
    )

    expect(screen.getByTestId('deletion-confirm-button')).not.toBeDisabled()
  })

  it('closes dialog when cancel is clicked', async () => {
    setupProfileFetch()
    render(<DeletionSection />)

    await userEvent.click(screen.getByTestId('delete-account-button'))
    await waitFor(() => {
      expect(
        screen.getByText(/This action is permanent and irreversible/),
      ).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(
        screen.queryByText(/This action is permanent and irreversible/),
      ).not.toBeInTheDocument()
    })
  })

  it('clears email input when dialog is reopened', async () => {
    setupProfileFetch()
    render(<DeletionSection />)

    await userEvent.click(screen.getByTestId('delete-account-button'))
    await waitFor(() => {
      expect(screen.getByTestId('deletion-confirm-input')).toBeInTheDocument()
    })

    await userEvent.type(
      screen.getByTestId('deletion-confirm-input'),
      'arjun@example.com',
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(
        screen.queryByText(/This action is permanent and irreversible/),
      ).not.toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('delete-account-button'))
    await waitFor(() => {
      expect(screen.getByTestId('deletion-confirm-input')).toBeInTheDocument()
    })
    expect(screen.getByTestId('deletion-confirm-input')).toHaveValue('')
  })

  it('calls deletion API and signs out on success', async () => {
    setupProfileFetch()
    render(<DeletionSection />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    await userEvent.click(screen.getByTestId('delete-account-button'))
    await waitFor(() => {
      expect(screen.getByTestId('deletion-confirm-input')).toBeInTheDocument()
    })

    await userEvent.type(
      screen.getByTestId('deletion-confirm-input'),
      'arjun@example.com',
    )

    await userEvent.click(screen.getByTestId('deletion-confirm-button'))

    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const postCall = calls.find((call) => {
        const opts = call[1] as RequestInit | undefined
        return opts?.method === 'POST' && (call[0] as string).includes('/deletion')
      })
      expect(postCall).toBeTruthy()
    })

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/login' })
    })
  })

  it('shows conflict message when deletion already pending', async () => {
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST' && url.includes('/deletion')) {
        return Promise.resolve(
          jsonResponse({ message: 'Deletion already requested', code: 'deletion_pending' }, 409),
        )
      }
      return Promise.resolve(jsonResponse(mockProfile))
    })

    render(<DeletionSection />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    await userEvent.click(screen.getByTestId('delete-account-button'))
    await waitFor(() => {
      expect(screen.getByTestId('deletion-confirm-input')).toBeInTheDocument()
    })

    await userEvent.type(
      screen.getByTestId('deletion-confirm-input'),
      'arjun@example.com',
    )

    await userEvent.click(screen.getByTestId('deletion-confirm-button'))

    await waitFor(() => {
      expect(screen.getByTestId('deletion-conflict-message')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/A deletion request is already pending/),
    ).toBeInTheDocument()
  })

  it('shows generic error message on non-409 API failure', async () => {
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST' && url.includes('/deletion')) {
        return Promise.resolve(
          jsonResponse({ message: 'Internal Server Error' }, 500),
        )
      }
      return Promise.resolve(jsonResponse(mockProfile))
    })

    render(<DeletionSection />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    await userEvent.click(screen.getByTestId('delete-account-button'))
    await waitFor(() => {
      expect(screen.getByTestId('deletion-confirm-input')).toBeInTheDocument()
    })

    await userEvent.type(
      screen.getByTestId('deletion-confirm-input'),
      'arjun@example.com',
    )

    await userEvent.click(screen.getByTestId('deletion-confirm-button'))

    await waitFor(() => {
      expect(screen.getByTestId('deletion-error-message')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/Failed to request account deletion/),
    ).toBeInTheDocument()
  })

  it('does not sign out on API error', async () => {
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST' && url.includes('/deletion')) {
        return Promise.resolve(
          jsonResponse({ message: 'Internal Server Error' }, 500),
        )
      }
      return Promise.resolve(jsonResponse(mockProfile))
    })

    render(<DeletionSection />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    await userEvent.click(screen.getByTestId('delete-account-button'))
    await waitFor(() => {
      expect(screen.getByTestId('deletion-confirm-input')).toBeInTheDocument()
    })

    await userEvent.type(
      screen.getByTestId('deletion-confirm-input'),
      'arjun@example.com',
    )

    await userEvent.click(screen.getByTestId('deletion-confirm-button'))

    await waitFor(() => {
      expect(screen.getByTestId('deletion-error-message')).toBeInTheDocument()
    })
    expect(mockSignOut).not.toHaveBeenCalled()
  })

  it('dialog has correct title', async () => {
    setupProfileFetch()
    render(<DeletionSection />)

    await userEvent.click(screen.getByTestId('delete-account-button'))

    await waitFor(() => {
      expect(
        screen.getAllByText('Delete Account').length,
      ).toBeGreaterThanOrEqual(2)
    })
  })
})
