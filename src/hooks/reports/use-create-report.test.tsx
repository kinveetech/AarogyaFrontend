import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useCreateReport } from './use-create-report'

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

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useCreateReport', () => {
  it('posts report metadata', async () => {
    const created = {
      id: 'r1',
      title: 'Blood Test',
      reportType: 'blood_test',
      status: 'uploaded',
      labName: 'City Medical Lab',
      highlightParameter: null,
      createdAt: '2025-01-15T10:00:00Z',
    }
    mockFetch.mockResolvedValue(jsonResponse(created))

    const { result } = renderHook(() => useCreateReport(), {
      wrapper: createWrapper(),
    })

    await act(() =>
      result.current.mutateAsync({
        reportType: 'blood_test',
        objectKey: 'uploads/abc123.pdf',
        labName: 'City Medical Lab',
        collectedAt: '2025-01-15T00:00:00Z',
        parameters: [],
      }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(created)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/reports')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('POST')
    expect(JSON.parse(calledInit.body as string)).toEqual({
      reportType: 'blood_test',
      objectKey: 'uploads/abc123.pdf',
      labName: 'City Medical Lab',
      collectedAt: '2025-01-15T00:00:00Z',
      parameters: [],
    })
  })

  it('invalidates report list cache on success', async () => {
    const wrapper = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    mockFetch.mockResolvedValue(
      jsonResponse({ id: 'r1', title: 'Test', reportType: 'blood_test', status: 'uploaded', labName: 'City Medical Lab', highlightParameter: null, createdAt: '2025-01-15T10:00:00Z' }),
    )

    const { result } = renderHook(() => useCreateReport(), { wrapper })

    await act(() =>
      result.current.mutateAsync({
        reportType: 'blood_test',
        objectKey: 'uploads/key.pdf',
        labName: 'City Medical Lab',
        collectedAt: '2025-01-15T00:00:00Z',
        parameters: [],
      }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.reports.all,
    })
  })
})
