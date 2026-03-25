import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { ConsentsSection } from './consents-section'
import type { ConsentListResponse } from '@/types/consent'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockConsents: ConsentListResponse = [
  {
    purpose: 'profile_management',
    isGranted: true,
    occurredAt: '2025-06-01T00:00:00Z',
    source: 'api',
  },
  {
    purpose: 'emergency_contact_management',
    isGranted: false,
    occurredAt: '2025-05-15T00:00:00Z',
    source: 'api',
  },
  {
    purpose: 'medical_data_sharing',
    isGranted: true,
    occurredAt: '2025-04-20T00:00:00Z',
    source: 'api',
  },
  {
    purpose: 'medical_records_processing',
    isGranted: false,
    occurredAt: '2025-03-10T00:00:00Z',
    source: 'api',
  },
]

beforeEach(() => {
  mockFetch.mockReset()
})

describe('ConsentsSection', () => {
  it('shows loading skeleton while fetching', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<ConsentsSection />)
    expect(screen.getByTestId('consents-loading')).toBeInTheDocument()
  })

  it('renders 4 toggle rows after loading', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockConsents))
    render(<ConsentsSection />)

    await waitFor(() => {
      expect(screen.getByText('Profile Management')).toBeInTheDocument()
    })
    expect(screen.getByText('Emergency Contact Management')).toBeInTheDocument()
    expect(screen.getByText('Medical Data Sharing')).toBeInTheDocument()
    expect(screen.getByText('Medical Records Processing')).toBeInTheDocument()
  })

  it('shows correct granted/revoked status', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockConsents))
    render(<ConsentsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('consent-status-profile_management')).toHaveTextContent('Granted')
    })
    expect(screen.getByTestId('consent-status-emergency_contact_management')).toHaveTextContent('Revoked')
    expect(screen.getByTestId('consent-status-medical_data_sharing')).toHaveTextContent('Granted')
    expect(screen.getByTestId('consent-status-medical_records_processing')).toHaveTextContent('Revoked')
  })

  it('displays formatted dates', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockConsents))
    render(<ConsentsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('consent-row-profile_management')).toBeInTheDocument()
    })
    const rows = screen.getAllByText(/^Updated\s/)
    expect(rows).toHaveLength(4)
  })

  it('sends PUT immediately when granting consent', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockConsents))
    render(<ConsentsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('consent-switch-emergency_contact_management')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValue(
      jsonResponse({ purpose: 'emergency_contact_management', isGranted: true, occurredAt: new Date().toISOString(), source: 'api' }),
    )

    await userEvent.click(screen.getByTestId('consent-switch-emergency_contact_management'))

    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const putCall = calls.find((call) => {
        const url = call[0] as string
        const opts = call[1] as RequestInit | undefined
        return url.includes('/v1/consents/emergency_contact_management') && opts?.method === 'PUT'
      })
      expect(putCall).toBeTruthy()
      const body = JSON.parse((putCall![1] as RequestInit).body as string)
      expect(body.isGranted).toBe(true)
    })
  })

  it('opens confirm dialog when revoking consent', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockConsents))
    render(<ConsentsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('consent-switch-profile_management')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('consent-switch-profile_management'))

    await waitFor(() => {
      expect(screen.getByText('Revoke Consent')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/Are you sure you want to revoke "Profile Management"/),
    ).toBeInTheDocument()
  })

  it('sends PUT after confirming revoke', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockConsents))
    render(<ConsentsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('consent-switch-profile_management')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('consent-switch-profile_management'))

    await waitFor(() => {
      expect(screen.getByText('Revoke Consent')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValue(
      jsonResponse({ purpose: 'profile_management', isGranted: false, occurredAt: new Date().toISOString(), source: 'api' }),
    )

    await userEvent.click(screen.getByRole('button', { name: 'Revoke' }))

    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const putCall = calls.find((call) => {
        const url = call[0] as string
        const opts = call[1] as RequestInit | undefined
        return url.includes('/v1/consents/profile_management') && opts?.method === 'PUT'
      })
      expect(putCall).toBeTruthy()
      const body = JSON.parse((putCall![1] as RequestInit).body as string)
      expect(body.isGranted).toBe(false)
    })
  })

  it('cancelling revoke dialog does not send API call', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockConsents))
    render(<ConsentsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('consent-switch-profile_management')).toBeInTheDocument()
    })

    const fetchCallCountBefore = mockFetch.mock.calls.length

    await userEvent.click(screen.getByTestId('consent-switch-profile_management'))

    await waitFor(() => {
      expect(screen.getByText('Revoke Consent')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByText('Revoke Consent')).not.toBeInTheDocument()
    })

    // No additional fetch calls should have been made (only possible refetch from query invalidation)
    const putCalls = mockFetch.mock.calls.slice(fetchCallCountBefore).filter((call) => {
      const opts = call[1] as RequestInit | undefined
      return opts?.method === 'PUT'
    })
    expect(putCalls).toHaveLength(0)
  })
})
