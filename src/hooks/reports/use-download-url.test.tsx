import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useDownloadUrl } from './use-download-url'

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
    defaultOptions: { mutations: { retry: false } },
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

describe('useDownloadUrl', () => {
  it('posts reportId and returns signed download URL', async () => {
    const responseData = {
      downloadUrl: 'https://cdn.example.com/reports/r1.pdf?token=xyz',
      expiresAt: '2025-01-15T12:00:00Z',
    }
    mockFetch.mockResolvedValue(jsonResponse(responseData))

    const { result } = renderHook(() => useDownloadUrl(), {
      wrapper: createWrapper(),
    })

    await act(() =>
      result.current.mutateAsync({ reportId: 'r1' }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(responseData)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/reports/download-url')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('POST')
    expect(JSON.parse(calledInit.body as string)).toEqual({ reportId: 'r1' })
  })

  it('returns error on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Not found' }, 404),
    )

    const { result } = renderHook(() => useDownloadUrl(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      try {
        await result.current.mutateAsync({ reportId: 'nonexistent' })
      } catch {
        // expected
      }
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ status: 404 })
  })
})
