import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useUpdateEmergencyContact } from './use-update-emergency-contact'
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

describe('useUpdateEmergencyContact', () => {
  it('sends PUT request with updated contact data', async () => {
    const updated = {
      id: 'ec1',
      name: 'Priya S.',
      phone: '9876543210',
      relationship: 'spouse',
      isPrimary: false,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
    }
    mockFetch.mockResolvedValue(jsonResponse(updated))

    const { result } = renderHook(() => useUpdateEmergencyContact(), {
      wrapper: createWrapper(),
    })

    await act(() =>
      result.current.mutateAsync({
        id: 'ec1',
        name: 'Priya S.',
        phone: '9876543210',
        relationship: 'spouse',
        isPrimary: false,
      }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/emergency-contacts/ec1')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('PUT')
  })

  it('optimistically updates contact in cache', async () => {
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

    let resolveUpdate!: () => void
    mockFetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveUpdate = () =>
          resolve(
            jsonResponse({
              id: 'ec1',
              name: 'Priya S.',
              phone: '9876543210',
              relationship: 'spouse',
              isPrimary: true,
              createdAt: '2025-01-01T00:00:00Z',
              updatedAt: '2025-01-15T10:00:00Z',
            }),
          )
      }),
    )

    const { result } = renderHook(() => useUpdateEmergencyContact(), { wrapper })

    await act(async () => {
      result.current.mutate({
        id: 'ec1',
        name: 'Priya S.',
        phone: '9876543210',
        relationship: 'spouse',
        isPrimary: true,
      })
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<EmergencyContactListResponse>(
        queryKeys.emergencyContacts.list(),
      )
      expect(cached?.items[0].name).toBe('Priya S.')
    })

    await act(async () => {
      resolveUpdate()
    })
  })
})
