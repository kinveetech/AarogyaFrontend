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

const mockConsents: ConsentListResponse = {
  items: [
    {
      id: 'c1',
      purpose: 'analytics',
      granted: true,
      updatedAt: '2025-06-01T00:00:00Z',
    },
    {
      id: 'c2',
      purpose: 'marketing',
      granted: false,
      updatedAt: '2025-05-15T00:00:00Z',
    },
    {
      id: 'c3',
      purpose: 'data-sharing',
      granted: true,
      updatedAt: '2025-04-20T00:00:00Z',
    },
    {
      id: 'c4',
      purpose: 'research',
      granted: false,
      updatedAt: '2025-03-10T00:00:00Z',
    },
  ],
}

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
      expect(screen.getByText('Data Processing (Analytics)')).toBeInTheDocument()
    })
    expect(screen.getByText('Marketing Communications')).toBeInTheDocument()
    expect(screen.getByText('Third-party Data Sharing')).toBeInTheDocument()
    expect(screen.getByText('Research Participation')).toBeInTheDocument()
  })

  it('shows correct granted/revoked status', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockConsents))
    render(<ConsentsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('consent-status-analytics')).toHaveTextContent('Granted')
    })
    expect(screen.getByTestId('consent-status-marketing')).toHaveTextContent('Revoked')
    expect(screen.getByTestId('consent-status-data-sharing')).toHaveTextContent('Granted')
    expect(screen.getByTestId('consent-status-research')).toHaveTextContent('Revoked')
  })

  it('displays formatted dates', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockConsents))
    render(<ConsentsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('consent-row-analytics')).toBeInTheDocument()
    })
    const rows = screen.getAllByText(/^Updated\s/)
    expect(rows).toHaveLength(4)
  })

  it('sends PUT immediately when granting consent', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockConsents))
    render(<ConsentsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('consent-switch-marketing')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValue(
      jsonResponse({ id: 'c2', purpose: 'marketing', granted: true, updatedAt: new Date().toISOString() }),
    )

    await userEvent.click(screen.getByTestId('consent-switch-marketing'))

    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const putCall = calls.find((call) => {
        const url = call[0] as string
        const opts = call[1] as RequestInit | undefined
        return url.includes('/v1/consents/marketing') && opts?.method === 'PUT'
      })
      expect(putCall).toBeTruthy()
      const body = JSON.parse((putCall![1] as RequestInit).body as string)
      expect(body.granted).toBe(true)
    })
  })

  it('opens confirm dialog when revoking consent', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockConsents))
    render(<ConsentsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('consent-switch-analytics')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('consent-switch-analytics'))

    await waitFor(() => {
      expect(screen.getByText('Revoke Consent')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/Are you sure you want to revoke "Data Processing \(Analytics\)"/),
    ).toBeInTheDocument()
  })

  it('sends PUT after confirming revoke', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockConsents))
    render(<ConsentsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('consent-switch-analytics')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('consent-switch-analytics'))

    await waitFor(() => {
      expect(screen.getByText('Revoke Consent')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValue(
      jsonResponse({ id: 'c1', purpose: 'analytics', granted: false, updatedAt: new Date().toISOString() }),
    )

    await userEvent.click(screen.getByRole('button', { name: 'Revoke' }))

    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const putCall = calls.find((call) => {
        const url = call[0] as string
        const opts = call[1] as RequestInit | undefined
        return url.includes('/v1/consents/analytics') && opts?.method === 'PUT'
      })
      expect(putCall).toBeTruthy()
      const body = JSON.parse((putCall![1] as RequestInit).body as string)
      expect(body.granted).toBe(false)
    })
  })

  it('cancelling revoke dialog does not send API call', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockConsents))
    render(<ConsentsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('consent-switch-analytics')).toBeInTheDocument()
    })

    const fetchCallCountBefore = mockFetch.mock.calls.length

    await userEvent.click(screen.getByTestId('consent-switch-analytics'))

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
