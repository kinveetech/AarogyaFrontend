import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { EmergencyAccessForm } from './emergency-access-form'
import type { EmergencyAccessResponse } from '@/types/emergency'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 201) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 201 ? 'Created' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const successResponse: EmergencyAccessResponse = {
  grantId: 'grant-abc-123',
  patientSub: 'patient-sub-123',
  doctorSub: 'doctor-sub-456',
  emergencyContactId: 'ec-789',
  startsAt: '2026-03-11T10:00:00Z',
  expiresAt: '2026-03-12T10:00:00Z',
  purpose: 'Patient unconscious, need medical history',
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('EmergencyAccessForm', () => {
  it('renders the form with all fields', () => {
    render(<EmergencyAccessForm />)

    expect(screen.getByTestId('emergency-access-form')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Request Emergency Access' }),
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter patient identifier')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter contact phone')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter doctor identifier')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Describe the emergency situation requiring access'),
    ).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Default: 24 hours')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Request Emergency Access' }),
    ).toBeInTheDocument()
  })

  it('shows validation errors when submitting empty form', async () => {
    render(<EmergencyAccessForm />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Request Emergency Access' }),
    )

    await waitFor(() => {
      expect(screen.getAllByText('Required').length).toBeGreaterThanOrEqual(3)
    })
  })

  it('shows validation error for invalid phone number', async () => {
    render(<EmergencyAccessForm />)

    await userEvent.type(
      screen.getByPlaceholderText('Enter patient identifier'),
      'patient-123',
    )
    await userEvent.type(screen.getByPlaceholderText('Enter contact phone'), '12345')
    await userEvent.type(
      screen.getByPlaceholderText('Enter doctor identifier'),
      'doctor-456',
    )
    await userEvent.type(
      screen.getByPlaceholderText(
        'Describe the emergency situation requiring access',
      ),
      'Emergency reason',
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Request Emergency Access' }),
    )

    await waitFor(() => {
      expect(
        screen.getByText('Must be a valid 10-digit Indian mobile number'),
      ).toBeInTheDocument()
    })
  })

  it('submits form and shows success state', async () => {
    mockFetch.mockResolvedValue(jsonResponse(successResponse))
    render(<EmergencyAccessForm />)

    await userEvent.type(
      screen.getByPlaceholderText('Enter patient identifier'),
      'patient-sub-123',
    )
    await userEvent.type(
      screen.getByPlaceholderText('Enter contact phone'),
      '9876543210',
    )
    await userEvent.type(
      screen.getByPlaceholderText('Enter doctor identifier'),
      'doctor-sub-456',
    )
    await userEvent.type(
      screen.getByPlaceholderText(
        'Describe the emergency situation requiring access',
      ),
      'Patient unconscious, need medical history',
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Request Emergency Access' }),
    )

    await waitFor(() => {
      expect(screen.getByTestId('emergency-access-success')).toBeInTheDocument()
    })

    expect(screen.getByText('Emergency Access Granted')).toBeInTheDocument()
    expect(screen.getByTestId('grant-id')).toHaveTextContent('grant-abc-123')
    expect(screen.getByTestId('grant-purpose')).toHaveTextContent(
      'Patient unconscious, need medical history',
    )
    expect(screen.getByTestId('grant-starts-at')).toBeInTheDocument()
    expect(screen.getByTestId('grant-expires-at')).toBeInTheDocument()
  })

  it('shows error message on API failure', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'Phone number is not a registered emergency contact for this patient.',
        }),
        {
          status: 400,
          statusText: 'Bad Request',
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    render(<EmergencyAccessForm />)

    await userEvent.type(
      screen.getByPlaceholderText('Enter patient identifier'),
      'patient-sub-123',
    )
    await userEvent.type(
      screen.getByPlaceholderText('Enter contact phone'),
      '9876543210',
    )
    await userEvent.type(
      screen.getByPlaceholderText('Enter doctor identifier'),
      'doctor-sub-456',
    )
    await userEvent.type(
      screen.getByPlaceholderText(
        'Describe the emergency situation requiring access',
      ),
      'Emergency reason',
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Request Emergency Access' }),
    )

    await waitFor(() => {
      expect(screen.getByTestId('emergency-access-error')).toBeInTheDocument()
    })

    expect(
      screen.getByText(
        'Phone number is not a registered emergency contact for this patient.',
      ),
    ).toBeInTheDocument()
  })

  it('shows error on network failure', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))

    render(<EmergencyAccessForm />)

    await userEvent.type(
      screen.getByPlaceholderText('Enter patient identifier'),
      'patient-sub-123',
    )
    await userEvent.type(
      screen.getByPlaceholderText('Enter contact phone'),
      '9876543210',
    )
    await userEvent.type(
      screen.getByPlaceholderText('Enter doctor identifier'),
      'doctor-sub-456',
    )
    await userEvent.type(
      screen.getByPlaceholderText(
        'Describe the emergency situation requiring access',
      ),
      'Emergency reason',
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Request Emergency Access' }),
    )

    await waitFor(() => {
      expect(screen.getByTestId('emergency-access-error')).toBeInTheDocument()
    })
  })

  it('allows submitting another request after success', async () => {
    mockFetch.mockResolvedValue(jsonResponse(successResponse))

    render(<EmergencyAccessForm />)

    await userEvent.type(
      screen.getByPlaceholderText('Enter patient identifier'),
      'patient-sub-123',
    )
    await userEvent.type(
      screen.getByPlaceholderText('Enter contact phone'),
      '9876543210',
    )
    await userEvent.type(
      screen.getByPlaceholderText('Enter doctor identifier'),
      'doctor-sub-456',
    )
    await userEvent.type(
      screen.getByPlaceholderText(
        'Describe the emergency situation requiring access',
      ),
      'Emergency reason',
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Request Emergency Access' }),
    )

    await waitFor(() => {
      expect(screen.getByTestId('emergency-access-success')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('new-request-button'))

    await waitFor(() => {
      expect(screen.getByTestId('emergency-access-form')).toBeInTheDocument()
    })

    expect(screen.getByPlaceholderText('Enter patient identifier')).toHaveValue('')
  })

  it('shows description text explaining the feature', () => {
    render(<EmergencyAccessForm />)

    expect(
      screen.getByText(
        /Request time-limited access to a patient/,
      ),
    ).toBeInTheDocument()
  })

  it('shows duration hint text', () => {
    render(<EmergencyAccessForm />)

    expect(
      screen.getByText(/Leave empty for default duration/),
    ).toBeInTheDocument()
  })
})
