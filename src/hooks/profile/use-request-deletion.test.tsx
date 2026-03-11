import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useRequestDeletion } from './use-request-deletion'
import type { DeletionResponse } from '@/types/deletion'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockDeletionResponse: DeletionResponse = {
  id: 'del-1',
  status: 'pending',
  requestedAt: '2026-03-11T10:00:00Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
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

describe('useRequestDeletion', () => {
  it('sends POST request to deletion endpoint', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockDeletionResponse))

    const { result } = renderHook(() => useRequestDeletion(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/users/me/deletion')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('POST')
  })

  it('returns deletion response data on success', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockDeletionResponse))

    const { result } = renderHook(() => useRequestDeletion(), {
      wrapper: createWrapper(),
    })

    const data = await act(() => result.current.mutateAsync())

    expect(data).toEqual(mockDeletionResponse)
    expect(data.id).toBe('del-1')
    expect(data.status).toBe('pending')
  })

  it('sets isError on server error', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Server Error' }, 500))

    const { result } = renderHook(() => useRequestDeletion(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('sets isPending while request is in flight', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useRequestDeletion(), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isPending).toBe(true))
  })

  it('handles 409 conflict for pending deletion', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Deletion already requested', code: 'deletion_pending' }, 409),
    )

    const { result } = renderHook(() => useRequestDeletion(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Deletion already requested')
  })
})
