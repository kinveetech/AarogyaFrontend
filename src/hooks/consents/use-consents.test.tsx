import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useConsents } from './use-consents'

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

describe('useConsents', () => {
  it('fetches consents successfully', async () => {
    const data = {
      items: [
        {
          id: 'c1',
          purpose: 'analytics',
          granted: true,
          updatedAt: '2025-06-01T00:00:00Z',
        },
        {
          id: 'c2',
          purpose: 'marketing',
          granted: false,
          updatedAt: '2025-05-15T00:00:00Z',
        },
      ],
    }
    mockFetch.mockResolvedValue(jsonResponse(data))

    const { result } = renderHook(() => useConsents(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(data)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/consents')
  })

  it('returns error state on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Internal server error' }, 500),
    )

    const { result } = renderHook(() => useConsents(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ status: 500 })
  })
})
