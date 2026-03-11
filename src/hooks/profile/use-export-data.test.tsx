import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useExportData } from './use-export-data'
import type { DataExportResponse } from '@/types/data-export'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockExportResponse: DataExportResponse = {
  id: 'export-1',
  status: 'pending',
  requestedAt: '2026-03-11T10:00:00Z',
  completedAt: null,
  downloadUrl: null,
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

describe('useExportData', () => {
  it('sends GET request to export endpoint', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockExportResponse))

    const { result } = renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync())

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/users/me/export')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('GET')
  })

  it('returns export response data on success', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockExportResponse))

    const { result } = renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    })

    const data = await act(() => result.current.mutateAsync())

    expect(data).toEqual(mockExportResponse)
    expect(data.id).toBe('export-1')
    expect(data.status).toBe('pending')
  })

  it('sets isError on server error', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Server Error' }, 500))

    const { result } = renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('sets isPending while request is in flight', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useExportData(), {
      wrapper: createWrapper(),
    })

    act(() => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isPending).toBe(true))
  })
})
