import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useDeleteEmergencyContact } from './use-delete-emergency-contact'
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

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useDeleteEmergencyContact', () => {
  it('sends DELETE request', async () => {
    mockFetch.mockResolvedValue(jsonResponse(null))

    const { result } = renderHook(() => useDeleteEmergencyContact(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync('ec1'))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/emergency-contacts/ec1')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('DELETE')
  })

  it('optimistically removes contact from cache', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: EmergencyContactListResponse = {
      items: [
        {
          id: 'ec1',
          name: 'Priya Sharma',
          phone: '9876543210',
          relationship: 'spouse',
          isPrimary: false,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
        {
          id: 'ec2',
          name: 'Rajesh Kumar',
          phone: '8765432109',
          relationship: 'parent',
          isPrimary: false,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
    }

    queryClient.setQueryData(queryKeys.emergencyContacts.list(), initialData)

    let resolveDelete!: () => void
    mockFetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveDelete = () => resolve(jsonResponse(null))
      }),
    )

    const { result } = renderHook(() => useDeleteEmergencyContact(), { wrapper })

    await act(async () => {
      result.current.mutate('ec1')
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<EmergencyContactListResponse>(
        queryKeys.emergencyContacts.list(),
      )
      expect(cached?.items).toHaveLength(1)
      expect(cached?.items[0].id).toBe('ec2')
    })

    await act(async () => {
      resolveDelete()
    })
  })

  it('rolls back cache on error', async () => {
    const wrapper = createWrapper(Infinity)

    const initialData: EmergencyContactListResponse = {
      items: [
        {
          id: 'ec1',
          name: 'Priya Sharma',
          phone: '9876543210',
          relationship: 'spouse',
          isPrimary: false,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ],
    }

    queryClient.setQueryData(queryKeys.emergencyContacts.list(), initialData)

    mockFetch.mockResolvedValue(jsonResponse({ message: 'Server Error' }, 500))

    const { result } = renderHook(() => useDeleteEmergencyContact(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync('ec1')
      } catch {
        // expected
      }
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<EmergencyContactListResponse>(
        queryKeys.emergencyContacts.list(),
      )
      expect(cached?.items).toHaveLength(1)
      expect(cached?.items[0].id).toBe('ec1')
    })
  })
})
