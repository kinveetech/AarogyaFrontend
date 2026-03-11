import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useCreateGrant } from './use-create-grant'
import type { AccessGrantListResponse, CreateAccessGrantRequest } from '@/types/access'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

let queryClient: QueryClient

function createWrapper(gcTime = 0) {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

const grantRequest: CreateAccessGrantRequest = {
  doctorSub: 'd1',
  doctorName: 'Dr. Smith',
  allReports: false,
  reportIds: ['r1', 'r2'],
  purpose: 'Follow-up consultation',
  expiresAt: '2025-06-01T00:00:00Z',
}

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useCreateGrant', () => {
  it('sends POST request with grant data', async () => {
    const created = {
      grantId: 'ag1',
      patientSub: 'p1',
      doctorSub: grantRequest.doctorSub,
      doctorName: grantRequest.doctorName,
      allReports: grantRequest.allReports,
      reportIds: grantRequest.reportIds,
      purpose: grantRequest.purpose,
      startsAt: '2025-01-15T10:00:00Z',
      expiresAt: grantRequest.expiresAt,
      revoked: false,
      createdAt: '2025-01-15T10:00:00Z',
    }
    mockFetch.mockResolvedValue(jsonResponse(created))

    const { result } = renderHook(() => useCreateGrant(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync(grantRequest))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(created)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/access-grants')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('POST')
    expect(JSON.parse(calledInit.body as string)).toEqual(grantRequest)
  })

  it('sends POST request with allReports grant', async () => {
    const allReportsRequest: CreateAccessGrantRequest = {
      doctorSub: 'd1',
      doctorName: 'Dr. Smith',
      allReports: true,
      reportIds: [],
      purpose: 'Ongoing treatment',
      expiresAt: '2025-06-01T00:00:00Z',
    }
    const created = {
      grantId: 'ag2',
      patientSub: 'p1',
      doctorSub: allReportsRequest.doctorSub,
      doctorName: allReportsRequest.doctorName,
      allReports: true,
      reportIds: [],
      purpose: allReportsRequest.purpose,
      startsAt: '2025-01-15T10:00:00Z',
      expiresAt: allReportsRequest.expiresAt,
      revoked: false,
      createdAt: '2025-01-15T10:00:00Z',
    }
    mockFetch.mockResolvedValue(jsonResponse(created))

    const { result } = renderHook(() => useCreateGrant(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync(allReportsRequest))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.allReports).toBe(true)
  })

  it('optimistically adds grant to list cache', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: AccessGrantListResponse = {
      items: [
        {
          grantId: 'ag-existing',
          patientSub: 'p1',
          doctorSub: 'd2',
          doctorName: 'Dr. Jones',
          allReports: false,
          reportIds: ['r3'],
          purpose: 'Initial consultation',
          startsAt: '2025-01-01T00:00:00Z',
          expiresAt: '2025-07-01T00:00:00Z',
          revoked: false,
          createdAt: '2025-01-01T00:00:00Z',
        },
      ],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    }

    queryClient.setQueryData(queryKeys.accessGrants.list(), initialData)

    let resolveCreate!: () => void
    mockFetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveCreate = () =>
          resolve(
            jsonResponse({
              grantId: 'ag-new',
              patientSub: 'p1',
              ...grantRequest,
              startsAt: '2025-01-15T10:00:00Z',
              revoked: false,
              createdAt: '2025-01-15T10:00:00Z',
            }),
          )
      }),
    )

    const { result } = renderHook(() => useCreateGrant(), { wrapper })

    await act(async () => {
      result.current.mutate(grantRequest)
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<AccessGrantListResponse>(
        queryKeys.accessGrants.list(),
      )
      expect(cached?.items).toHaveLength(2)
      expect(cached?.items[0].grantId).toMatch(/^optimistic-/)
      expect(cached?.items[0].doctorName).toBe('Dr. Smith')
      expect(cached?.items[0].allReports).toBe(false)
      expect(cached?.items[0].purpose).toBe('Follow-up consultation')
      expect(cached?.totalCount).toBe(2)
    })

    await act(async () => {
      resolveCreate()
    })
  })

  it('optimistic grant includes allReports flag', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: AccessGrantListResponse = {
      items: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
    }

    queryClient.setQueryData(queryKeys.accessGrants.list(), initialData)

    const allReportsRequest: CreateAccessGrantRequest = {
      doctorSub: 'd1',
      doctorName: 'Dr. Smith',
      allReports: true,
      reportIds: [],
      purpose: 'Treatment plan',
      expiresAt: '2025-06-01T00:00:00Z',
    }

    let resolveCreate!: () => void
    mockFetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveCreate = () =>
          resolve(jsonResponse({ grantId: 'ag-new', ...allReportsRequest }))
      }),
    )

    const { result } = renderHook(() => useCreateGrant(), { wrapper })

    await act(async () => {
      result.current.mutate(allReportsRequest)
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<AccessGrantListResponse>(
        queryKeys.accessGrants.list(),
      )
      expect(cached?.items[0].allReports).toBe(true)
      expect(cached?.items[0].purpose).toBe('Treatment plan')
    })

    await act(async () => {
      resolveCreate()
    })
  })

  it('rolls back cache on error', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: AccessGrantListResponse = {
      items: [
        {
          grantId: 'ag-existing',
          patientSub: 'p1',
          doctorSub: 'd2',
          doctorName: 'Dr. Jones',
          allReports: false,
          reportIds: ['r3'],
          purpose: 'Consultation',
          startsAt: '2025-01-01T00:00:00Z',
          expiresAt: '2025-07-01T00:00:00Z',
          revoked: false,
          createdAt: '2025-01-01T00:00:00Z',
        },
      ],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    }

    queryClient.setQueryData(queryKeys.accessGrants.list(), initialData)

    mockFetch.mockResolvedValue(jsonResponse({ message: 'Bad Request' }, 400))

    const { result } = renderHook(() => useCreateGrant(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync(grantRequest)
      } catch {
        // expected
      }
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<AccessGrantListResponse>(
        queryKeys.accessGrants.list(),
      )
      expect(cached?.items).toHaveLength(1)
      expect(cached?.items[0].grantId).toBe('ag-existing')
      expect(cached?.totalCount).toBe(1)
    })
  })
})
