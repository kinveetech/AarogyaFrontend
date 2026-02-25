import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { AadhaarVerifyDialog } from './aadhaar-verify-dialog'
import type { Profile } from '@/types/profile'

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
  id: 'u1',
  name: 'Arjun Kumar',
  email: 'arjun@example.com',
  phone: '9876543210',
  dateOfBirth: '1990-03-15T00:00:00Z',
  bloodGroup: 'B+',
  gender: 'male',
  city: 'Bengaluru',
  aadhaarVerified: false,
  avatarUrl: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
}

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  profile: mockProfile,
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('AadhaarVerifyDialog', () => {
  it('renders dialog title when open', () => {
    render(<AadhaarVerifyDialog {...defaultProps} />)
    expect(screen.getByText('Verify Aadhaar')).toBeInTheDocument()
  })

  it('renders subtitle text', () => {
    render(<AadhaarVerifyDialog {...defaultProps} />)
    expect(
      screen.getByText('Enter your Aadhaar details to verify your identity.'),
    ).toBeInTheDocument()
  })

  it('shows all form fields', () => {
    render(<AadhaarVerifyDialog {...defaultProps} />)
    expect(screen.getByText('Aadhaar Number')).toBeInTheDocument()
    expect(screen.getByText('First Name')).toBeInTheDocument()
    expect(screen.getByText('Last Name')).toBeInTheDocument()
    expect(screen.getByText('Date of Birth')).toBeInTheDocument()
  })

  it('pre-populates first name from profile', async () => {
    render(<AadhaarVerifyDialog {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-first-name-input')).toHaveValue('Arjun')
    })
  })

  it('pre-populates last name from profile', async () => {
    render(<AadhaarVerifyDialog {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-last-name-input')).toHaveValue('Kumar')
    })
  })

  it('pre-populates date of birth from profile', async () => {
    render(<AadhaarVerifyDialog {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-dob-input')).toHaveValue('1990-03-15')
    })
  })

  it('leaves aadhaar number field empty', async () => {
    render(<AadhaarVerifyDialog {...defaultProps} />)
    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-number-input')).toHaveValue('')
    })
  })

  it('shows Verify and Cancel buttons', () => {
    render(<AadhaarVerifyDialog {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Verify' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('shows validation error for empty aadhaar number', async () => {
    render(<AadhaarVerifyDialog {...defaultProps} />)

    await userEvent.click(screen.getByTestId('aadhaar-verify-submit'))

    await waitFor(() => {
      expect(
        screen.getByText('Must be a valid 12-digit Aadhaar number'),
      ).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid aadhaar number', async () => {
    render(<AadhaarVerifyDialog {...defaultProps} />)

    await userEvent.type(screen.getByTestId('aadhaar-number-input'), '123456789012')
    await userEvent.click(screen.getByTestId('aadhaar-verify-submit'))

    await waitFor(() => {
      expect(
        screen.getByText('Must be a valid 12-digit Aadhaar number'),
      ).toBeInTheDocument()
    })
  })

  it('submits POST request with valid data', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ verified: true, message: 'Aadhaar verified successfully' }),
    )
    const onClose = vi.fn()

    render(<AadhaarVerifyDialog {...defaultProps} onClose={onClose} />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-first-name-input')).toHaveValue('Arjun')
    })

    await userEvent.type(screen.getByTestId('aadhaar-number-input'), '234567890123')
    await userEvent.click(screen.getByTestId('aadhaar-verify-submit'))

    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const postCall = calls.find((call) => {
        const opts = call[1] as RequestInit | undefined
        return opts?.method === 'POST'
      })
      expect(postCall).toBeTruthy()
    })
  })

  it('calls onClose after successful verification', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ verified: true, message: 'Aadhaar verified successfully' }),
    )
    const onClose = vi.fn()

    render(<AadhaarVerifyDialog {...defaultProps} onClose={onClose} />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-first-name-input')).toHaveValue('Arjun')
    })

    await userEvent.type(screen.getByTestId('aadhaar-number-input'), '234567890123')
    await userEvent.click(screen.getByTestId('aadhaar-verify-submit'))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('shows API error message on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Details do not match' }, 400),
    )

    render(<AadhaarVerifyDialog {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-first-name-input')).toHaveValue('Arjun')
    })

    await userEvent.type(screen.getByTestId('aadhaar-number-input'), '234567890123')
    await userEvent.click(screen.getByTestId('aadhaar-verify-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-verify-error')).toBeInTheDocument()
    })
  })

  it('does not render dialog content when closed', () => {
    render(<AadhaarVerifyDialog {...defaultProps} open={false} />)
    expect(screen.queryByText('Verify Aadhaar')).not.toBeInTheDocument()
  })
})
