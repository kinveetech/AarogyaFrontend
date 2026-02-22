import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useRevokeGrant } from './use-revoke-grant'
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

const grantOne = {
  id: 'ag1',
  doctorId: 'd1',
  doctorName: 'Dr. Smith',
  reportIds: ['r1'],
  expiresAt: '2025-06-01T00:00:00Z',
  createdAt: '2025-01-01T00:00:00Z',
}

const grantTwo = {
  id: 'ag2',
  doctorId: 'd2',
  doctorName: 'Dr. Jones',
  reportIds: ['r2'],
  expiresAt: '2025-07-01T00:00:00Z',
  createdAt: '2025-01-02T00:00:00Z',
}

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useRevokeGrant', () => {
  it('sends DELETE request', async () => {
    mockFetch.mockResolvedValue(
      new Response(null, { status: 204, statusText: 'No Content' }),
    )

    const { result } = renderHook(() => useRevokeGrant(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync('ag1'))

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/access-grants/ag1'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('optimistically removes grant from list cache', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: AccessGrantListResponse = {
      items: [grantOne, grantTwo],
      page: 1,
      pageSize: 10,
      totalCount: 2,
      totalPages: 1,
    }

    queryClient.setQueryData(queryKeys.accessGrants.list(), initialData)

    let resolveDelete!: () => void
    mockFetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveDelete = () =>
          resolve(new Response(null, { status: 204 }))
      }),
    )

    const { result } = renderHook(() => useRevokeGrant(), { wrapper })

    await act(async () => {
      result.current.mutate('ag1')
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<AccessGrantListResponse>(
        queryKeys.accessGrants.list(),
      )
      expect(cached?.items).toHaveLength(1)
      expect(cached?.items[0].id).toBe('ag2')
      expect(cached?.totalCount).toBe(1)
    })

    await act(async () => {
      resolveDelete()
    })
  })

  it('rolls back cache on error', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: AccessGrantListResponse = {
      items: [grantOne],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    }

    queryClient.setQueryData(queryKeys.accessGrants.list(), initialData)

    mockFetch.mockResolvedValue(jsonResponse({ message: 'Forbidden' }, 403))

    const { result } = renderHook(() => useRevokeGrant(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync('ag1')
      } catch {
        // expected
      }
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<AccessGrantListResponse>(
        queryKeys.accessGrants.list(),
      )
      expect(cached?.items).toHaveLength(1)
      expect(cached?.items[0].id).toBe('ag1')
    })
  })
})
