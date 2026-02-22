import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useRegisterDeviceToken } from './use-register-device-token'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {
      'Content-Type': 'application/json',
      'content-length': status === 204 ? '0' : undefined!,
    },
  })
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

describe('useRegisterDeviceToken', () => {
  it('sends POST request with token and platform', async () => {
    mockFetch.mockResolvedValue(
      new Response(null, { status: 204, headers: { 'content-length': '0' } }),
    )

    const { result } = renderHook(() => useRegisterDeviceToken(), {
      wrapper: createWrapper(),
    })

    await act(() =>
      result.current.mutateAsync({ token: 'fcm-token-123', platform: 'web' }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/notification-preferences/device-token')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('POST')

    const body = JSON.parse(calledInit.body as string)
    expect(body).toEqual({ token: 'fcm-token-123', platform: 'web' })
  })

  it('returns error state on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Server error' }, 500),
    )

    const { result } = renderHook(() => useRegisterDeviceToken(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate({ token: 'bad-token', platform: 'web' })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
