import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useUpdateNotificationPrefs } from './use-update-notification-prefs'
import type { NotificationPreferences, UpdateNotificationPrefsRequest } from '@/types/notification'

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

const allEnabled: UpdateNotificationPrefsRequest = {
  reportUploaded: {
    push: true,
    email: true,
    sms: false,
  },
  accessGranted: {
    push: true,
    email: true,
    sms: false,
  },
  emergencyAccess: {
    push: true,
    email: true,
    sms: false,
  },
}

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useUpdateNotificationPrefs', () => {
  it('sends PUT request with correct URL and body', async () => {
    const updated: NotificationPreferences = { ...allEnabled, updatedAt: '2025-06-15T10:00:00Z' }
    mockFetch.mockResolvedValue(jsonResponse(updated))

    const { result } = renderHook(() => useUpdateNotificationPrefs(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync(allEnabled))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/notifications/preferences')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('PUT')

    const body = JSON.parse(calledInit.body as string)
    expect(body.reportUploaded.push).toBe(true)
    expect(body.reportUploaded.sms).toBe(false)
  })

  it('optimistically updates prefs in cache', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: NotificationPreferences = {
      reportUploaded: {
        push: false,
        email: false,
        sms: false,
      },
      accessGranted: {
        push: false,
        email: false,
        sms: false,
      },
      emergencyAccess: {
        push: false,
        email: false,
        sms: false,
      },
      updatedAt: '2025-06-01T00:00:00Z',
    }

    queryClient.setQueryData(queryKeys.notifications.prefs(), initialData)

    let resolveUpdate!: () => void
    mockFetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveUpdate = () =>
          resolve(jsonResponse({ ...allEnabled, updatedAt: '2025-06-15T10:00:00Z' }))
      }),
    )

    const { result } = renderHook(() => useUpdateNotificationPrefs(), { wrapper })

    await act(async () => {
      result.current.mutate(allEnabled)
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<NotificationPreferences>(
        queryKeys.notifications.prefs(),
      )
      expect(cached?.reportUploaded.push).toBe(true)
    })

    await act(async () => {
      resolveUpdate()
    })
  })

  it('rolls back cache on error', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: NotificationPreferences = {
      reportUploaded: {
        push: true,
        email: true,
        sms: false,
      },
      accessGranted: {
        push: true,
        email: true,
        sms: false,
      },
      emergencyAccess: {
        push: true,
        email: true,
        sms: false,
      },
      updatedAt: '2025-06-01T00:00:00Z',
    }

    queryClient.setQueryData(queryKeys.notifications.prefs(), initialData)

    mockFetch.mockResolvedValue(jsonResponse({ message: 'Server error' }, 500))

    const disabledAll: UpdateNotificationPrefsRequest = {
      reportUploaded: {
        push: false,
        email: false,
        sms: false,
      },
      accessGranted: {
        push: false,
        email: false,
        sms: false,
      },
      emergencyAccess: {
        push: false,
        email: false,
        sms: false,
      },
    }

    const { result } = renderHook(() => useUpdateNotificationPrefs(), { wrapper })

    await act(async () => {
      result.current.mutate(disabledAll)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    await waitFor(() => {
      const cached = queryClient.getQueryData<NotificationPreferences>(
        queryKeys.notifications.prefs(),
      )
      expect(cached?.reportUploaded.push).toBe(true)
    })
  })
})
