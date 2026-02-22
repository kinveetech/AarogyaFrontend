import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useCreateGrant } from './use-create-grant'
import type { AccessGrantListResponse } from '@/types/access'

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

const grantRequest = {
  doctorId: 'd1',
  doctorName: 'Dr. Smith',
  reportIds: ['r1', 'r2'],
  expiresAt: '2025-06-01T00:00:00Z',
}

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useCreateGrant', () => {
  it('sends POST request with grant data', async () => {
    const created = {
      id: 'ag1',
      ...grantRequest,
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

  it('optimistically adds grant to list cache', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: AccessGrantListResponse = {
      items: [
        {
          id: 'ag-existing',
          doctorId: 'd2',
          doctorName: 'Dr. Jones',
          reportIds: ['r3'],
          expiresAt: '2025-07-01T00:00:00Z',
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
              id: 'ag-new',
              ...grantRequest,
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
      expect(cached?.items[0].id).toMatch(/^optimistic-/)
      expect(cached?.items[0].doctorName).toBe('Dr. Smith')
      expect(cached?.totalCount).toBe(2)
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
          id: 'ag-existing',
          doctorId: 'd2',
          doctorName: 'Dr. Jones',
          reportIds: ['r3'],
          expiresAt: '2025-07-01T00:00:00Z',
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
      expect(cached?.items[0].id).toBe('ag-existing')
      expect(cached?.totalCount).toBe(1)
    })
  })
})
