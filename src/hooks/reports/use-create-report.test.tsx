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
      status: 'pending',
      reportDate: '2025-01-15',
      labName: null,
      doctorName: null,
      notes: null,
      highlightParameter: null,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
    }
    mockFetch.mockResolvedValue(jsonResponse(created))

    const { result } = renderHook(() => useCreateReport(), {
      wrapper: createWrapper(),
    })

    await act(() =>
      result.current.mutateAsync({
        title: 'Blood Test',
        reportType: 'blood_test',
        reportDate: '2025-01-15',
        fileKey: 'uploads/abc123.pdf',
      }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(created)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/reports')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('POST')
    expect(JSON.parse(calledInit.body as string)).toEqual({
      title: 'Blood Test',
      reportType: 'blood_test',
      reportDate: '2025-01-15',
      fileKey: 'uploads/abc123.pdf',
    })
  })

  it('invalidates report list cache on success', async () => {
    const wrapper = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    mockFetch.mockResolvedValue(
      jsonResponse({ id: 'r1', title: 'Test', reportType: 'blood_test', status: 'pending', reportDate: '2025-01-15', labName: null, doctorName: null, notes: null, highlightParameter: null, createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-01-15T10:00:00Z' }),
    )

    const { result } = renderHook(() => useCreateReport(), { wrapper })

    await act(() =>
      result.current.mutateAsync({
        title: 'Test',
        reportType: 'blood_test',
        reportDate: '2025-01-15',
        fileKey: 'uploads/key.pdf',
      }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.reports.all,
    })
  })
})
