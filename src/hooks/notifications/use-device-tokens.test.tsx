import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useDeviceTokens } from './use-device-tokens'
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

describe('useDeviceTokens', () => {
  it('fetches registered devices successfully', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockDevices))

    const { result } = renderHook(() => useDeviceTokens(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockDevices)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/notifications/devices')
  })

  it('returns empty array when no devices registered', async () => {
    mockFetch.mockResolvedValue(jsonResponse([]))

    const { result } = renderHook(() => useDeviceTokens(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })

  it('returns error state on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Internal server error' }, 500),
    )

    const { result } = renderHook(() => useDeviceTokens(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ status: 500 })
  })
})
