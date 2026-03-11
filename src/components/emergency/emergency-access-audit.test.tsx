import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/render'
import { EmergencyAccessAudit } from './emergency-access-audit'
import type { EmergencyAccessAuditResponse } from '@/types/emergency'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const auditData: EmergencyAccessAuditResponse = {
  page: 1,
  pageSize: 20,
  totalCount: 2,
  items: [
    {
      auditLogId: 'aud-1',
      occurredAt: '2026-03-10T14:00:00Z',
      action: 'granted',
      grantId: 'grant-abc-12345678',
      actorUserId: 'user-doctor-001-long-id',
      actorRole: 'Doctor',
      resourceType: 'EmergencyAccess',
      resourceId: 'res-1',
      data: { reason: 'Cardiac arrest', duration: '24h' },
    },
    {
      auditLogId: 'aud-2',
      occurredAt: '2026-03-09T08:30:00Z',
      action: 'requested',
      grantId: null,
      actorUserId: null,
      actorRole: null,
      resourceType: 'EmergencyAccess',
      resourceId: null,
      data: {},
    },
  ],
}

const emptyAuditData: EmergencyAccessAuditResponse = {
  page: 1,
  pageSize: 20,
  totalCount: 0,
  items: [],
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('EmergencyAccessAudit', () => {
  it('renders the Access History heading', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(auditData)))
    render(<EmergencyAccessAudit />)

    expect(screen.getByRole('heading', { name: 'Access History' })).toBeInTheDocument()
  })

  it('shows loading skeleton initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<EmergencyAccessAudit />)

    expect(screen.getByTestId('audit-loading')).toBeInTheDocument()
  })

  it('renders audit event rows after loading', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(auditData)))
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      expect(screen.getAllByTestId('audit-event-row')).toHaveLength(2)
    })
  })

  it('displays action badges with correct labels', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(auditData)))
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      expect(screen.getByText('Granted')).toBeInTheDocument()
    })
    expect(screen.getByText('Requested')).toBeInTheDocument()
  })

  it('masks actor user IDs for PII protection', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(auditData)))
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      const actorIds = screen.getAllByTestId('actor-id')
      // "user-doctor-001-long-id" should be masked: user****g-id
      expect(actorIds[0].textContent).toContain('****')
      expect(actorIds[0].textContent).not.toBe('user-doctor-001-long-id')
    })
  })

  it('shows "System" for null actor IDs', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(auditData)))
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      const actorIds = screen.getAllByTestId('actor-id')
      expect(actorIds[1].textContent).toBe('System')
    })
  })

  it('shows "Unknown" for null actor roles', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(auditData)))
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      expect(screen.getByText('Unknown')).toBeInTheDocument()
    })
  })

  it('displays actor role label', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(auditData)))
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      expect(screen.getByText('Doctor')).toBeInTheDocument()
    })
  })

  it('shows truncated grant ID when present', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(auditData)))
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      const grantIds = screen.getAllByTestId('grant-id')
      expect(grantIds).toHaveLength(1)
      expect(grantIds[0].textContent).toContain('grant-ab...')
    })
  })

  it('renders formatted timestamps', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(auditData)))
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      const timestamps = screen.getAllByTestId('audit-timestamp')
      expect(timestamps).toHaveLength(2)
      expect(timestamps[0].textContent).toBeTruthy()
      expect(timestamps[1].textContent).toBeTruthy()
    })
  })

  it('renders data tags when event has extra data', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(auditData)))
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      const tags = screen.getAllByTestId('audit-data-tag')
      expect(tags).toHaveLength(2)
      expect(tags[0].textContent).toBe('reason: Cardiac arrest')
      expect(tags[1].textContent).toBe('duration: 24h')
    })
  })

  it('shows empty state when no audit events exist', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(emptyAuditData)))
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      expect(screen.getByText('No access history')).toBeInTheDocument()
    })
    expect(
      screen.getByText('Emergency access events will appear here when they occur'),
    ).toBeInTheDocument()
  })

  it('shows error message on API failure', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(jsonResponse({ message: 'Forbidden' }, 403)),
    )
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      expect(screen.getByTestId('audit-error')).toBeInTheDocument()
    })
    expect(screen.getByText(/unable to load access history/i)).toBeInTheDocument()
  })

  it('shows total count when more events exist than displayed', async () => {
    const paginatedData: EmergencyAccessAuditResponse = {
      ...auditData,
      totalCount: 50,
    }
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(paginatedData)))
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      expect(screen.getByText('Showing 2 of 50 events')).toBeInTheDocument()
    })
  })

  it('does not show total count text when all events are displayed', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(auditData)))
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      expect(screen.getAllByTestId('audit-event-row')).toHaveLength(2)
    })
    expect(screen.queryByText(/Showing .* of .* events/)).not.toBeInTheDocument()
  })

  it('handles unknown action types gracefully', async () => {
    const unknownActionData: EmergencyAccessAuditResponse = {
      page: 1,
      pageSize: 20,
      totalCount: 1,
      items: [
        {
          auditLogId: 'aud-3',
          occurredAt: '2026-03-10T14:00:00Z',
          action: 'custom_action',
          grantId: null,
          actorUserId: 'user-1',
          actorRole: 'Admin',
          resourceType: 'EmergencyAccess',
          resourceId: null,
          data: {},
        },
      ],
    }
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(unknownActionData)))
    render(<EmergencyAccessAudit />)

    await waitFor(() => {
      expect(screen.getByText('custom_action')).toBeInTheDocument()
    })
  })
})
