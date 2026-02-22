import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useReports } from './use-reports'

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

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useReports', () => {
  it('fetches report list successfully', async () => {
    const data = {
      items: [{ id: 'r1', title: 'Blood Test' }],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    }
    mockFetch.mockResolvedValue(jsonResponse(data))

    const { result } = renderHook(() => useReports(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(data)
  })

  it('forwards query parameters', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ items: [], page: 2, pageSize: 5, totalCount: 0, totalPages: 0 }),
    )

    const { result } = renderHook(
      () => useReports({ page: 2, pageSize: 5, search: 'blood', category: 'lab' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('page=2')
    expect(calledUrl).toContain('pageSize=5')
    expect(calledUrl).toContain('search=blood')
    expect(calledUrl).toContain('category=lab')
  })

  it('returns error state on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Internal server error' }, 500),
    )

    const { result } = renderHook(() => useReports(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ status: 500 })
  })
})
