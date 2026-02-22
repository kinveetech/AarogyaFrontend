import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useCreateEmergencyContact } from './use-create-emergency-contact'
import type { EmergencyContactListResponse } from '@/types/emergency'

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

const contactRequest = {
  name: 'Priya Sharma',
  phone: '9876543210',
  relationship: 'spouse' as const,
}

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useCreateEmergencyContact', () => {
  it('sends POST request with contact data', async () => {
    const created = {
      id: 'ec1',
      ...contactRequest,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
    }
    mockFetch.mockResolvedValue(jsonResponse(created))

    const { result } = renderHook(() => useCreateEmergencyContact(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync(contactRequest))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(created)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/emergency-contacts')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('POST')
    expect(JSON.parse(calledInit.body as string)).toEqual(contactRequest)
  })

  it('optimistically adds contact to list cache', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: EmergencyContactListResponse = {
      items: [
        {
          id: 'ec-existing',
          name: 'Rajesh Kumar',
          phone: '8765432109',
          relationship: 'parent',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
    }

    queryClient.setQueryData(queryKeys.emergencyContacts.list(), initialData)

    let resolveCreate!: () => void
    mockFetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveCreate = () =>
          resolve(
            jsonResponse({
              id: 'ec-new',
              ...contactRequest,
              createdAt: '2025-01-15T10:00:00Z',
              updatedAt: '2025-01-15T10:00:00Z',
            }),
          )
      }),
    )

    const { result } = renderHook(() => useCreateEmergencyContact(), { wrapper })

    await act(async () => {
      result.current.mutate(contactRequest)
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<EmergencyContactListResponse>(
        queryKeys.emergencyContacts.list(),
      )
      expect(cached?.items).toHaveLength(2)
      expect(cached?.items[1].id).toMatch(/^optimistic-/)
      expect(cached?.items[1].name).toBe('Priya Sharma')
    })

    await act(async () => {
      resolveCreate()
    })
  })

  it('rolls back cache on error', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: EmergencyContactListResponse = {
      items: [
        {
          id: 'ec-existing',
          name: 'Rajesh Kumar',
          phone: '8765432109',
          relationship: 'parent',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
    }

    queryClient.setQueryData(queryKeys.emergencyContacts.list(), initialData)

    mockFetch.mockResolvedValue(jsonResponse({ message: 'Bad Request' }, 400))

    const { result } = renderHook(() => useCreateEmergencyContact(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync(contactRequest)
      } catch {
        // expected
      }
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<EmergencyContactListResponse>(
        queryKeys.emergencyContacts.list(),
      )
      expect(cached?.items).toHaveLength(1)
      expect(cached?.items[0].id).toBe('ec-existing')
    })
  })
})
