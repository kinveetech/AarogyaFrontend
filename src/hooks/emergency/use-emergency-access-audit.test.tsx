import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useEmergencyAccessAudit } from './use-emergency-access-audit'
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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

const auditResponse: EmergencyAccessAuditResponse = {
  page: 1,
  pageSize: 20,
  totalCount: 2,
  items: [
    {
      auditLogId: 'aud-1',
      occurredAt: '2026-03-10T14:00:00Z',
      action: 'granted',
      grantId: 'grant-abc-123',
      actorUserId: 'user-doctor-001',
      actorRole: 'Doctor',
      resourceType: 'EmergencyAccess',
      resourceId: 'res-1',
      data: { reason: 'Cardiac arrest', duration: '24h' },
    },
    {
      auditLogId: 'aud-2',
      occurredAt: '2026-03-09T08:30:00Z',
      action: 'requested',
      grantId: 'grant-def-456',
      actorUserId: 'user-doctor-002',
      actorRole: 'Doctor',
      resourceType: 'EmergencyAccess',
      resourceId: null,
      data: {},
    },
  ],
}

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useEmergencyAccessAudit', () => {
  it('fetches audit trail successfully', async () => {
    mockFetch.mockResolvedValue(jsonResponse(auditResponse))

    const { result } = renderHook(() => useEmergencyAccessAudit(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(auditResponse)
    expect(result.current.data?.items).toHaveLength(2)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/emergency-access/audit')
    expect(calledUrl).toContain('page=1')
    expect(calledUrl).toContain('pageSize=20')
  })

  it('returns empty items when no audit events exist', async () => {
    const emptyResponse: EmergencyAccessAuditResponse = {
      page: 1,
      pageSize: 20,
      totalCount: 0,
      items: [],
    }
    mockFetch.mockResolvedValue(jsonResponse(emptyResponse))

    const { result } = renderHook(() => useEmergencyAccessAudit(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.items).toHaveLength(0)
    expect(result.current.data?.totalCount).toBe(0)
  })

  it('returns error state on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Internal server error' }, 500),
    )

    const { result } = renderHook(() => useEmergencyAccessAudit(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ status: 500 })
  })

  it('passes custom page and pageSize parameters', async () => {
    mockFetch.mockResolvedValue(jsonResponse(auditResponse))

    const { result } = renderHook(
      () => useEmergencyAccessAudit({ page: 3, pageSize: 10 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('page=3')
    expect(calledUrl).toContain('pageSize=10')
  })
})
