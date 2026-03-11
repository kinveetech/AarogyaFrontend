import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import AccessPage from './page'
import type { AccessGrantListResponse } from '@/types/access'
import type { ReportListResponse } from '@/types/reports'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

let mockRole: 'patient' | 'doctor' = 'patient'

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', name: 'Test User', email: 'test@example.com', role: mockRole },
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const activeGrant = {
  grantId: 'g1',
  patientSub: 'p1',
  doctorSub: 'd1',
  doctorName: 'Dr. Priya Sharma',
  allReports: false,
  reportIds: ['r1', 'r2', 'r3'],
  purpose: 'Blood test review',
  startsAt: '2025-01-01T00:00:00Z',
  expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
  revoked: false,
  createdAt: '2025-01-01T00:00:00Z',
}

const expiringGrant = {
  grantId: 'g2',
  patientSub: 'p1',
  doctorSub: 'd2',
  doctorName: 'Dr. Rajesh Kumar',
  allReports: true,
  reportIds: [],
  purpose: 'Ongoing treatment',
  startsAt: '2025-01-10T00:00:00Z',
  expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  revoked: false,
  createdAt: '2025-01-10T00:00:00Z',
}

const expiredGrant = {
  grantId: 'g3',
  patientSub: 'p1',
  doctorSub: 'd3',
  doctorName: 'Dr. Anita Desai',
  allReports: false,
  reportIds: ['r2'],
  purpose: 'X-ray analysis',
  startsAt: '2024-12-01T00:00:00Z',
  expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  revoked: false,
  createdAt: '2024-12-01T00:00:00Z',
}

const revokedGrant = {
  grantId: 'g4',
  patientSub: 'p1',
  doctorSub: 'd4',
  doctorName: 'Dr. Vikram Patel',
  allReports: false,
  reportIds: ['r1'],
  purpose: 'Second opinion',
  startsAt: '2025-01-05T00:00:00Z',
  expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
  revoked: true,
  createdAt: '2025-01-05T00:00:00Z',
}

const mockGrantData: AccessGrantListResponse = {
  items: [activeGrant, expiringGrant, expiredGrant, revokedGrant],
  page: 1,
  pageSize: 20,
  totalCount: 4,
  totalPages: 1,
}

const emptyGrantData: AccessGrantListResponse = {
  items: [],
  page: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
}

const mockReports: ReportListResponse = {
  items: [
    {
      id: 'r1',
      title: 'Complete Blood Count',
      reportType: 'lab',
      status: 'verified',
      reportDate: '2025-01-15T00:00:00Z',
      labName: 'Thyrocare',
      doctorName: null,
      notes: null,
      highlightParameter: null,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 'r2',
      title: 'Chest X-Ray',
      reportType: 'imaging',
      status: 'verified',
      reportDate: '2025-02-10T00:00:00Z',
      labName: null,
      doctorName: null,
      notes: null,
      highlightParameter: null,
      createdAt: '2025-02-10T10:00:00Z',
      updatedAt: '2025-02-10T10:00:00Z',
    },
  ],
  page: 1,
  pageSize: 100,
  totalCount: 2,
  totalPages: 1,
}

function mockFetchHandler(url: string) {
  if (url.includes('/v1/access-grants')) return jsonResponse(mockGrantData)
  if (url.includes('/v1/reports')) return jsonResponse(mockReports)
  if (url.includes('/v1/doctors/search')) {
    return jsonResponse({
      items: [
        {
          id: 'doc1',
          name: 'Dr. Arun Mehta',
          specialisation: 'Orthopedic',
          registrationNumber: 'MH12345',
        },
      ],
    })
  }
  return jsonResponse({})
}

beforeEach(() => {
  mockFetch.mockReset()
  mockRole = 'patient'
})

describe('AccessPage — Patient view', () => {
  it('shows loading skeleton on initial render', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<AccessPage />)
    expect(screen.getByTestId('access-loading')).toBeInTheDocument()
  })

  it('renders active and inactive grant sections', async () => {
    mockFetch.mockImplementation((url: string) => Promise.resolve(mockFetchHandler(url)))
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('Dr. Priya Sharma')).toBeInTheDocument()
    })

    expect(screen.getByText('Active Grants')).toBeInTheDocument()
    expect(screen.getByText('Inactive Grants')).toBeInTheDocument()
    expect(screen.getByText('Dr. Rajesh Kumar')).toBeInTheDocument()
    expect(screen.getByText('Dr. Anita Desai')).toBeInTheDocument()
    expect(screen.getByText('Dr. Vikram Patel')).toBeInTheDocument()
  })

  it('renders page heading and Grant Access button', async () => {
    mockFetch.mockImplementation((url: string) => Promise.resolve(mockFetchHandler(url)))
    render(<AccessPage />)

    expect(screen.getByRole('heading', { name: 'Doctor Access' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /grant access/i })).toBeInTheDocument()
  })

  it('shows empty state when no grants exist', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/v1/access-grants')) return Promise.resolve(jsonResponse(emptyGrantData))
      return Promise.resolve(jsonResponse({}))
    })
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('No active grants')).toBeInTheDocument()
    })
    expect(screen.getByText('Grant a doctor access to your reports')).toBeInTheDocument()
  })

  it('shows correct grant card count', async () => {
    mockFetch.mockImplementation((url: string) => Promise.resolve(mockFetchHandler(url)))
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getAllByTestId('grant-card')).toHaveLength(4)
    })
  })

  it('shows active/expiring/expired/revoked status badges', async () => {
    mockFetch.mockImplementation((url: string) => Promise.resolve(mockFetchHandler(url)))
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
    expect(screen.getByText('Expiring Soon')).toBeInTheDocument()
    expect(screen.getByText('Expired')).toBeInTheDocument()
    expect(screen.getByText('Revoked')).toBeInTheDocument()
  })

  it('shows "All reports" for grants with allReports flag', async () => {
    mockFetch.mockImplementation((url: string) => Promise.resolve(mockFetchHandler(url)))
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('Dr. Rajesh Kumar')).toBeInTheDocument()
    })
    expect(screen.getByText('All reports')).toBeInTheDocument()
  })

  it('opens revoke dialog when Revoke is clicked', async () => {
    mockFetch.mockImplementation((url: string) => Promise.resolve(mockFetchHandler(url)))
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('Dr. Priya Sharma')).toBeInTheDocument()
    })

    await userEvent.click(
      screen.getByRole('button', { name: /revoke access for dr\. priya sharma/i }),
    )

    await waitFor(() => {
      expect(screen.getByText('Revoke Access')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/will no longer be able to view/),
    ).toBeInTheDocument()
  })

  it('confirms revoke and sends DELETE request', async () => {
    mockFetch.mockImplementation((url: string) => Promise.resolve(mockFetchHandler(url)))
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('Dr. Priya Sharma')).toBeInTheDocument()
    })

    await userEvent.click(
      screen.getByRole('button', { name: /revoke access for dr\. priya sharma/i }),
    )
    await waitFor(() => {
      expect(screen.getByText('Revoke Access')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValue(jsonResponse(null, 200))
    await userEvent.click(screen.getByRole('button', { name: 'Revoke' }))

    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const deleteCall = calls.find((call) => {
        const url = call[0] as string
        return url.includes('/v1/access-grants/g1')
      })
      expect(deleteCall).toBeTruthy()
    })
  })

  it('closes revoke dialog when Cancel is clicked', async () => {
    mockFetch.mockImplementation((url: string) => Promise.resolve(mockFetchHandler(url)))
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('Dr. Priya Sharma')).toBeInTheDocument()
    })

    await userEvent.click(
      screen.getByRole('button', { name: /revoke access for dr\. priya sharma/i }),
    )
    await waitFor(() => {
      expect(screen.getByText('Revoke Access')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByText(/will no longer be able to view/)).not.toBeInTheDocument()
    })
  })

  it('opens grant modal when Grant Access button is clicked', async () => {
    mockFetch.mockImplementation((url: string) => Promise.resolve(mockFetchHandler(url)))
    render(<AccessPage />)

    await userEvent.click(screen.getByRole('button', { name: /grant access/i }))

    await waitFor(() => {
      expect(screen.getByText('Grant Doctor Access')).toBeInTheDocument()
    })
    expect(screen.getByPlaceholderText('Search by name or ID...')).toBeInTheDocument()
  })

  it('opens grant modal from empty state CTA', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/v1/access-grants')) return Promise.resolve(jsonResponse(emptyGrantData))
      return Promise.resolve(jsonResponse(mockReports))
    })
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('No active grants')).toBeInTheDocument()
    })

    // The empty state also has a "Grant Access" button
    const buttons = screen.getAllByRole('button', { name: /grant access/i })
    await userEvent.click(buttons[buttons.length - 1])

    await waitFor(() => {
      expect(screen.getByText('Grant Doctor Access')).toBeInTheDocument()
    })
  })

  it('does not show revoke button for revoked grants', async () => {
    mockFetch.mockImplementation((url: string) => Promise.resolve(mockFetchHandler(url)))
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('Dr. Vikram Patel')).toBeInTheDocument()
    })

    expect(
      screen.queryByRole('button', { name: /revoke access for dr\. vikram patel/i }),
    ).not.toBeInTheDocument()
  })
})

describe('AccessPage — Doctor view', () => {
  beforeEach(() => {
    mockRole = 'doctor'
  })

  it('shows "Received Grants" heading for doctor role', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<AccessPage />)
    expect(screen.getByRole('heading', { name: 'Received Grants' })).toBeInTheDocument()
  })

  it('does not show Grant Access button for doctor role', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<AccessPage />)
    expect(screen.queryByRole('button', { name: /grant access/i })).not.toBeInTheDocument()
  })

  it('shows loading skeleton on initial render', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<AccessPage />)
    expect(screen.getByTestId('received-grants-loading')).toBeInTheDocument()
  })

  it('renders received grant cards', async () => {
    const receivedGrants = [
      {
        grantId: 'rg1',
        patientSub: 'patient-abc',
        doctorSub: 'doctor-1',
        doctorName: 'Dr. Self',
        allReports: true,
        reportIds: [],
        purpose: 'General checkup',
        startsAt: '2025-01-01T00:00:00Z',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        revoked: false,
        createdAt: '2025-01-01T00:00:00Z',
      },
      {
        grantId: 'rg2',
        patientSub: 'patient-xyz',
        doctorSub: 'doctor-1',
        doctorName: 'Dr. Self',
        allReports: false,
        reportIds: ['r1'],
        purpose: 'Lab results',
        startsAt: '2025-02-01T00:00:00Z',
        expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        revoked: false,
        createdAt: '2025-02-01T00:00:00Z',
      },
    ]

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/v1/access-grants/received')) {
        return Promise.resolve(jsonResponse(receivedGrants))
      }
      return Promise.resolve(jsonResponse([]))
    })
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('Patient: patient-abc')).toBeInTheDocument()
    })
    expect(screen.getByText('Patient: patient-xyz')).toBeInTheDocument()
    expect(screen.getAllByTestId('received-grant-card')).toHaveLength(2)
  })

  it('shows active and inactive sections for received grants', async () => {
    const receivedGrants = [
      {
        grantId: 'rg1',
        patientSub: 'patient-abc',
        doctorSub: 'doctor-1',
        doctorName: 'Dr. Self',
        allReports: true,
        reportIds: [],
        purpose: 'General checkup',
        startsAt: '2025-01-01T00:00:00Z',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        revoked: false,
        createdAt: '2025-01-01T00:00:00Z',
      },
      {
        grantId: 'rg2',
        patientSub: 'patient-xyz',
        doctorSub: 'doctor-1',
        doctorName: 'Dr. Self',
        allReports: false,
        reportIds: ['r1'],
        purpose: 'Lab results',
        startsAt: '2025-02-01T00:00:00Z',
        expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        revoked: false,
        createdAt: '2025-02-01T00:00:00Z',
      },
    ]

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/v1/access-grants/received')) {
        return Promise.resolve(jsonResponse(receivedGrants))
      }
      return Promise.resolve(jsonResponse([]))
    })
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('Active Grants')).toBeInTheDocument()
    })
    expect(screen.getByText('Inactive Grants')).toBeInTheDocument()
  })

  it('shows empty state when doctor has no received grants', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/v1/access-grants/received')) {
        return Promise.resolve(jsonResponse([]))
      }
      return Promise.resolve(jsonResponse([]))
    })
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('No received grants')).toBeInTheDocument()
    })
    expect(
      screen.getByText('Patients who grant you access to their reports will appear here'),
    ).toBeInTheDocument()
  })

  it('empty state does not have an action button for doctors', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/v1/access-grants/received')) {
        return Promise.resolve(jsonResponse([]))
      }
      return Promise.resolve(jsonResponse([]))
    })
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('No received grants')).toBeInTheDocument()
    })
    expect(screen.queryByRole('button', { name: /grant access/i })).not.toBeInTheDocument()
  })

  it('calls the received endpoint, not the patient grants endpoint', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/v1/access-grants/received')) {
        return Promise.resolve(jsonResponse([]))
      }
      return Promise.resolve(jsonResponse([]))
    })
    render(<AccessPage />)

    await waitFor(() => {
      expect(screen.getByText('No received grants')).toBeInTheDocument()
    })

    const calledUrls = mockFetch.mock.calls.map((call) => call[0] as string)
    const receivedCall = calledUrls.find((url) => url.includes('/v1/access-grants/received'))
    const patientCall = calledUrls.find(
      (url) => url.includes('/v1/access-grants') && !url.includes('/received'),
    )
    expect(receivedCall).toBeTruthy()
    expect(patientCall).toBeUndefined()
  })
})
