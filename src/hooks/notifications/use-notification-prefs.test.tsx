import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useNotificationPrefs } from './use-notification-prefs'
import type { NotificationPreferences } from '@/types/notification'

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

const mockPrefs: NotificationPreferences = {
  push: {
    enabled: true,
    categories: {
      'report-processed': true,
      'access-activity': true,
      'emergency-alerts': true,
      'system-updates': false,
    },
  },
  email: {
    enabled: true,
    categories: {
      'report-processed': true,
      'access-activity': false,
      'emergency-alerts': true,
      'system-updates': true,
    },
  },
  sms: {
    enabled: false,
    categories: {
      'report-processed': false,
      'access-activity': false,
      'emergency-alerts': false,
      'system-updates': false,
    },
  },
  updatedAt: '2025-06-01T00:00:00Z',
}

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useNotificationPrefs', () => {
  it('fetches notification preferences successfully', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))

    const { result } = renderHook(() => useNotificationPrefs(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockPrefs)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/notification-preferences')
  })

  it('returns error state on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Internal server error' }, 500),
    )

    const { result } = renderHook(() => useNotificationPrefs(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ status: 500 })
  })
})
