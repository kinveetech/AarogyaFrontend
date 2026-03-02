import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useUpdateProfile } from './use-update-profile'
import type { Profile } from '@/types/profile'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockProfile: Profile = {
  sub: 'u1',
  firstName: 'Arjun',
  lastName: 'Kumar',
  email: 'arjun@example.com',
  phone: '9876543210',
  dateOfBirth: '1990-03-15',
  bloodGroup: 'B+',
  gender: 'male',
  address: 'Bengaluru',
  aadhaarVerified: false,
  registrationStatus: 'approved',
  roles: ['patient'],
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

describe('useUpdateProfile', () => {
  it('sends PUT request with profile data', async () => {
    const updated = { ...mockProfile, firstName: 'Arjun', lastName: 'Patel' }
    mockFetch.mockResolvedValue(jsonResponse(updated))

    const { result } = renderHook(() => useUpdateProfile(), {
      wrapper: createWrapper(),
    })

    await act(() =>
      result.current.mutateAsync({
        firstName: 'Arjun',
        lastName: 'Patel',
        email: 'arjun@example.com',
        phone: '9876543210',
        dateOfBirth: '1990-03-15',
        bloodGroup: 'B+',
        address: 'Bengaluru',
      }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/users/me')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('PUT')
  })

  it('optimistically updates profile in cache', async () => {
    const wrapper = createWrapper(Infinity)

    queryClient.setQueryData(queryKeys.profile.me(), mockProfile)

    let resolveUpdate!: () => void
    mockFetch.mockReturnValue(
      new Promise<Response>((resolve) => {
        resolveUpdate = () =>
          resolve(jsonResponse({ ...mockProfile, lastName: 'Patel' }))
      }),
    )

    const { result } = renderHook(() => useUpdateProfile(), { wrapper })

    await act(async () => {
      result.current.mutate({
        firstName: 'Arjun',
        lastName: 'Patel',
        email: 'arjun@example.com',
        phone: '9876543210',
        dateOfBirth: '1990-03-15',
        bloodGroup: 'B+',
        address: 'Bengaluru',
      })
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<Profile>(queryKeys.profile.me())
      expect(cached?.lastName).toBe('Patel')
    })

    await act(async () => {
      resolveUpdate()
    })
  })

  it('rolls back on error', async () => {
    const wrapper = createWrapper(Infinity)

    queryClient.setQueryData(queryKeys.profile.me(), mockProfile)

    mockFetch.mockResolvedValue(jsonResponse({ message: 'Server Error' }, 500))

    const { result } = renderHook(() => useUpdateProfile(), { wrapper })

    await act(async () => {
      result.current.mutate({
        firstName: 'Arjun',
        lastName: 'Patel',
        email: 'arjun@example.com',
        phone: '9876543210',
        dateOfBirth: '1990-03-15',
        bloodGroup: 'B+',
        address: 'Bengaluru',
      })
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    const cached = queryClient.getQueryData<Profile>(queryKeys.profile.me())
    expect(cached?.lastName).toBe('Kumar')
  })
})
