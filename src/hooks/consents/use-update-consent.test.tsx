import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useUpdateConsent } from './use-update-consent'
import type { ConsentListResponse } from '@/types/consent'

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

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useUpdateConsent', () => {
  it('sends PUT request with correct URL and body', async () => {
    const updated = {
      purpose: 'profile_management',
      isGranted: false,
      occurredAt: '2025-06-15T10:00:00Z',
      source: 'api',
    }
    mockFetch.mockResolvedValue(jsonResponse(updated))

    const { result } = renderHook(() => useUpdateConsent(), {
      wrapper: createWrapper(),
    })

    await act(() =>
      result.current.mutateAsync({
        purpose: 'profile_management',
        isGranted: false,
      }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/consents/profile_management')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('PUT')

    const body = JSON.parse(calledInit.body as string)
    expect(body).toEqual({ isGranted: false })
  })

  it('optimistically updates consent in cache', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: ConsentListResponse = [
      {
        purpose: 'profile_management',
        isGranted: true,
        occurredAt: '2025-06-01T00:00:00Z',
        source: 'api',
      },
      {
        purpose: 'emergency_contact_management',
        isGranted: false,
        occurredAt: '2025-05-15T00:00:00Z',
        source: 'api',
      },
    ]

    queryClient.setQueryData(queryKeys.consents.list(), initialData)

    let resolveUpdate!: () => void
    mockFetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveUpdate = () =>
          resolve(
            jsonResponse({
              purpose: 'profile_management',
              isGranted: false,
              occurredAt: '2025-06-15T10:00:00Z',
              source: 'api',
            }),
          )
      }),
    )

    const { result } = renderHook(() => useUpdateConsent(), { wrapper })

    await act(async () => {
      result.current.mutate({
        purpose: 'profile_management',
        isGranted: false,
      })
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<ConsentListResponse>(
        queryKeys.consents.list(),
      )
      expect(cached?.[0].isGranted).toBe(false)
    })

    await act(async () => {
      resolveUpdate()
    })
  })

  it('rolls back cache on error', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: ConsentListResponse = [
      {
        purpose: 'profile_management',
        isGranted: true,
        occurredAt: '2025-06-01T00:00:00Z',
        source: 'api',
      },
    ]

    queryClient.setQueryData(queryKeys.consents.list(), initialData)

    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Server error' }, 500),
    )

    const { result } = renderHook(() => useUpdateConsent(), { wrapper })

    await act(async () => {
      result.current.mutate({
        purpose: 'profile_management',
        isGranted: false,
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    await waitFor(() => {
      const cached = queryClient.getQueryData<ConsentListResponse>(
        queryKeys.consents.list(),
      )
      expect(cached?.[0].isGranted).toBe(true)
    })
  })
})
