import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useDeleteReport } from './use-delete-report'
import type { ReportListResponse } from '@/types/reports'

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

const reportOne = { id: 'r1', title: 'Report 1', reportType: 'blood_test' as const, status: 'verified' as const, reportDate: '2025-01-01', labName: null, doctorName: null, notes: null, highlightParameter: null, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' }
const reportTwo = { id: 'r2', title: 'Report 2', reportType: 'radiology' as const, status: 'pending' as const, reportDate: '2025-01-02', labName: null, doctorName: null, notes: null, highlightParameter: null, createdAt: '2025-01-02T00:00:00Z', updatedAt: '2025-01-02T00:00:00Z' }

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useDeleteReport', () => {
  it('sends DELETE request', async () => {
    mockFetch.mockResolvedValue(
      new Response(null, { status: 204, statusText: 'No Content' }),
    )

    const { result } = renderHook(() => useDeleteReport(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync('r1'))

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/reports/r1'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })

  it('optimistically removes report from list cache', async () => {
    // Use Infinity gcTime so manually-set query data is not garbage collected
    const wrapper = createWrapper(Infinity)

    const initialData: ReportListResponse = {
      items: [reportOne, reportTwo],
      page: 1,
      pageSize: 10,
      totalCount: 2,
      totalPages: 1,
    }

    queryClient.setQueryData(queryKeys.reports.list(), initialData)

    let resolveDelete!: () => void
    mockFetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveDelete = () => resolve(new Response(null, { status: 204 }))
      }),
    )

    const { result } = renderHook(() => useDeleteReport(), { wrapper })

    await act(async () => { result.current.mutate('r1') })

    await waitFor(() => {
      const cached = queryClient.getQueryData<ReportListResponse>(queryKeys.reports.list())
      expect(cached?.items).toHaveLength(1)
      expect(cached?.items[0].id).toBe('r2')
      expect(cached?.totalCount).toBe(1)
    })

    await act(async () => { resolveDelete() })
  })

  it('rolls back cache on error', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: ReportListResponse = {
      items: [reportOne],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    }

    queryClient.setQueryData(queryKeys.reports.list(), initialData)

    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Forbidden' }, 403),
    )

    const { result } = renderHook(() => useDeleteReport(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync('r1')
      } catch {
        // expected
      }
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<ReportListResponse>(queryKeys.reports.list())
      expect(cached?.items).toHaveLength(1)
      expect(cached?.items[0].id).toBe('r1')
    })
  })
})
