import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useSearchDoctors } from './use-search-doctors'

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

describe('useSearchDoctors', () => {
  it('fetches doctor search results', async () => {
    const data = {
      items: [
        {
          id: 'd1',
          name: 'Dr. Smith',
          specialisation: 'Cardiology',
          registrationNumber: 'MCI-12345',
        },
      ],
    }
    mockFetch.mockResolvedValue(jsonResponse(data))

    const { result } = renderHook(() => useSearchDoctors('Smith'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(data)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/doctors/search?q=Smith')
  })

  it('returns error state on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Service unavailable' }, 503),
    )

    const { result } = renderHook(() => useSearchDoctors('Smith'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ status: 503 })
  })

  it('does not fetch when query is shorter than 2 characters', async () => {
    const { result } = renderHook(() => useSearchDoctors('S'), {
      wrapper: createWrapper(),
    })

    // Wait a tick for the initial render to settle
    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'))
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('debounces the search query', async () => {
    vi.useFakeTimers()

    mockFetch.mockResolvedValue(jsonResponse({ items: [] }))

    // Start with a short query that won't trigger a fetch
    const { rerender } = renderHook(
      ({ query }: { query: string }) => useSearchDoctors(query),
      {
        wrapper: createWrapper(),
        initialProps: { query: '' },
      },
    )

    // Rapid re-renders with different queries
    rerender({ query: 'Sm' })
    rerender({ query: 'Smi' })
    rerender({ query: 'Smit' })

    // No fetch should have happened yet — debounce hasn't fired
    expect(mockFetch).not.toHaveBeenCalled()

    // Advance past debounce
    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    // Now the debounced value should trigger a single fetch
    await vi.waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('q=Smit')

    vi.useRealTimers()
  })
})
