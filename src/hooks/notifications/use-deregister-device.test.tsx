import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useDeregisterDevice } from './use-deregister-device'
import type { RegisteredDevice } from '@/types/notification'

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

const mockDevices: RegisteredDevice[] = [
  {
    deviceToken: 'token-abc-123',
    platform: 'web',
    deviceName: 'Chrome 120',
    appVersion: '1.0.0',
    registeredAt: '2025-12-01T10:00:00Z',
  },
  {
    deviceToken: 'token-def-456',
    platform: 'ios',
    deviceName: 'iPhone 16 Pro',
    appVersion: '2.0.0',
    registeredAt: '2025-12-05T14:30:00Z',
  },
]

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useDeregisterDevice', () => {
  it('sends DELETE request with encoded device token', async () => {
    mockFetch.mockResolvedValue(
      new Response(null, { status: 204, headers: { 'content-length': '0' } }),
    )

    const { result } = renderHook(() => useDeregisterDevice(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync('token-abc-123'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/notifications/devices/token-abc-123')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('DELETE')
  })

  it('encodes special characters in device token', async () => {
    mockFetch.mockResolvedValue(
      new Response(null, { status: 204, headers: { 'content-length': '0' } }),
    )

    const { result } = renderHook(() => useDeregisterDevice(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync('token/with+special=chars'))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain(encodeURIComponent('token/with+special=chars'))
  })

  it('optimistically removes device from cache', async () => {
    const wrapper = createWrapper(Infinity)

    queryClient.setQueryData(queryKeys.notifications.devices(), mockDevices)

    let resolveDelete!: () => void
    mockFetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveDelete = () =>
          resolve(new Response(null, { status: 204, headers: { 'content-length': '0' } }))
      }),
    )

    const { result } = renderHook(() => useDeregisterDevice(), { wrapper })

    await act(async () => {
      result.current.mutate('token-abc-123')
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<RegisteredDevice[]>(
        queryKeys.notifications.devices(),
      )
      expect(cached).toHaveLength(1)
      expect(cached?.[0].deviceToken).toBe('token-def-456')
    })

    await act(async () => {
      resolveDelete()
    })
  })

  it('rolls back cache on error', async () => {
    const wrapper = createWrapper(Infinity)

    queryClient.setQueryData(queryKeys.notifications.devices(), mockDevices)

    mockFetch.mockResolvedValue(jsonResponse({ message: 'Server error' }, 500))

    const { result } = renderHook(() => useDeregisterDevice(), { wrapper })

    await act(async () => {
      result.current.mutate('token-abc-123')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    await waitFor(() => {
      const cached = queryClient.getQueryData<RegisteredDevice[]>(
        queryKeys.notifications.devices(),
      )
      expect(cached).toHaveLength(2)
    })
  })

  it('returns error state on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Not found' }, 404),
    )

    const { result } = renderHook(() => useDeregisterDevice(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate('nonexistent-token')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
