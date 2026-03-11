import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor, fireEvent } from '@/test/render'
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

const mockVerificationResponse = {
  referenceToken: 'ref-token-123',
  existingRecord: false,
  provider: 'uidai',
  demographics: {
    name: 'Arjun Kumar',
    dateOfBirth: '1990-03-15',
    gender: 'male',
    address: 'Bengaluru, Karnataka',
  },
}

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  profile: mockProfile,
}

function typeAadhaarDigits(input: HTMLElement, digits: string) {
  for (const digit of digits) {
    fireEvent.keyDown(input, { key: digit })
  }
}

beforeEach(() => {
  mockFetch.mockReset()
  defaultProps.onClose.mockReset()
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

  it('masks aadhaar input showing only last 4 digits', async () => {
    render(<AadhaarVerifyDialog {...defaultProps} />)
    const input = screen.getByTestId('aadhaar-number-input')

    typeAadhaarDigits(input, '234567890123')

    // The input should display masked value, not full Aadhaar
    await waitFor(() => {
      const value = (input as HTMLInputElement).value
      // Should not contain the full Aadhaar number
      expect(value).not.toBe('234567890123')
      // Should show masked pattern with only last 4 visible
      expect(value).toContain('0123')
      expect(value).toContain('X')
    })
  })

  it('submits POST request with valid data', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockVerificationResponse))
    const onClose = vi.fn()

    render(<AadhaarVerifyDialog {...defaultProps} onClose={onClose} />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-first-name-input')).toHaveValue('Arjun')
    })

    const aadhaarInput = screen.getByTestId('aadhaar-number-input')
    typeAadhaarDigits(aadhaarInput, '234567890123')

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

  it('shows success view after successful verification', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockVerificationResponse))

    render(<AadhaarVerifyDialog {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-first-name-input')).toHaveValue('Arjun')
    })

    const aadhaarInput = screen.getByTestId('aadhaar-number-input')
    typeAadhaarDigits(aadhaarInput, '234567890123')

    await userEvent.click(screen.getByTestId('aadhaar-verify-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-verify-success')).toBeInTheDocument()
    })
    expect(screen.getByText('Aadhaar Verified')).toBeInTheDocument()
    expect(
      screen.getByText('Your identity has been successfully verified.'),
    ).toBeInTheDocument()
  })

  it('shows Done button in success view', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockVerificationResponse))

    render(<AadhaarVerifyDialog {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-first-name-input')).toHaveValue('Arjun')
    })

    const aadhaarInput = screen.getByTestId('aadhaar-number-input')
    typeAadhaarDigits(aadhaarInput, '234567890123')

    await userEvent.click(screen.getByTestId('aadhaar-verify-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-verify-done')).toBeInTheDocument()
    })
  })

  it('calls onClose when Done is clicked in success view', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockVerificationResponse))
    const onClose = vi.fn()

    render(<AadhaarVerifyDialog {...defaultProps} onClose={onClose} />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-first-name-input')).toHaveValue('Arjun')
    })

    const aadhaarInput = screen.getByTestId('aadhaar-number-input')
    typeAadhaarDigits(aadhaarInput, '234567890123')

    await userEvent.click(screen.getByTestId('aadhaar-verify-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-verify-done')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('aadhaar-verify-done'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows API error message on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Details do not match' }, 400),
    )

    render(<AadhaarVerifyDialog {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-first-name-input')).toHaveValue('Arjun')
    })

    const aadhaarInput = screen.getByTestId('aadhaar-number-input')
    typeAadhaarDigits(aadhaarInput, '234567890123')

    await userEvent.click(screen.getByTestId('aadhaar-verify-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-verify-error')).toBeInTheDocument()
    })
  })

  it('shows specific message for already verified error', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        { message: 'Already verified', code: 'already_verified' },
        409,
      ),
    )

    render(<AadhaarVerifyDialog {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-first-name-input')).toHaveValue('Arjun')
    })

    const aadhaarInput = screen.getByTestId('aadhaar-number-input')
    typeAadhaarDigits(aadhaarInput, '234567890123')

    await userEvent.click(screen.getByTestId('aadhaar-verify-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-verify-error')).toBeInTheDocument()
    })
    expect(
      screen.getByText('Your Aadhaar is already verified.'),
    ).toBeInTheDocument()
  })

  it('shows specific message for aadhaar mismatch error', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        { message: 'Mismatch', code: 'aadhaar_mismatch' },
        400,
      ),
    )

    render(<AadhaarVerifyDialog {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-first-name-input')).toHaveValue('Arjun')
    })

    const aadhaarInput = screen.getByTestId('aadhaar-number-input')
    typeAadhaarDigits(aadhaarInput, '234567890123')

    await userEvent.click(screen.getByTestId('aadhaar-verify-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-verify-error')).toBeInTheDocument()
    })
    expect(
      screen.getByText(
        'The details provided do not match the Aadhaar record. Please check and try again.',
      ),
    ).toBeInTheDocument()
  })

  it('shows specific message for invalid aadhaar error', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        { message: 'Invalid', code: 'invalid_aadhaar' },
        400,
      ),
    )

    render(<AadhaarVerifyDialog {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-first-name-input')).toHaveValue('Arjun')
    })

    const aadhaarInput = screen.getByTestId('aadhaar-number-input')
    typeAadhaarDigits(aadhaarInput, '234567890123')

    await userEvent.click(screen.getByTestId('aadhaar-verify-submit'))

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-verify-error')).toBeInTheDocument()
    })
    expect(
      screen.getByText(
        'The Aadhaar number is invalid. Please check and try again.',
      ),
    ).toBeInTheDocument()
  })

  it('does not render dialog content when closed', () => {
    render(<AadhaarVerifyDialog {...defaultProps} open={false} />)
    expect(screen.queryByText('Verify Aadhaar')).not.toBeInTheDocument()
  })

  it('never displays full Aadhaar number in the UI', async () => {
    render(<AadhaarVerifyDialog {...defaultProps} />)

    const aadhaarInput = screen.getByTestId('aadhaar-number-input')
    typeAadhaarDigits(aadhaarInput, '234567890123')

    // Check that no element in the document contains the full Aadhaar
    const bodyText = document.body.textContent ?? ''
    expect(bodyText).not.toContain('234567890123')
  })
})
