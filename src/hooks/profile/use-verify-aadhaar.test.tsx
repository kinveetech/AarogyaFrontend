import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useVerifyAadhaar } from './use-verify-aadhaar'
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
  id: 'u1',
  name: 'Arjun Kumar',
  email: 'arjun@example.com',
  phone: '9876543210',
  dateOfBirth: '1990-03-15',
  bloodGroup: 'B+',
  gender: 'male',
  city: 'Bengaluru',
  aadhaarVerified: false,
  avatarUrl: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
}

const validRequest = {
  aadhaarNumber: '234567890123',
  firstName: 'Arjun',
  lastName: 'Kumar',
  dateOfBirth: '1990-03-15',
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

describe('useVerifyAadhaar', () => {
  it('sends POST request to /v1/profile/aadhaar/verify', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ verified: true, message: 'Aadhaar verified successfully' }),
    )

    const { result } = renderHook(() => useVerifyAadhaar(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync(validRequest))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/profile/aadhaar/verify')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('POST')
  })

  it('sets aadhaarVerified to true in profile cache on success', async () => {
    const wrapper = createWrapper(Infinity)

    queryClient.setQueryData(queryKeys.profile.me(), mockProfile)

    mockFetch.mockResolvedValue(
      jsonResponse({ verified: true, message: 'Aadhaar verified successfully' }),
    )

    const { result } = renderHook(() => useVerifyAadhaar(), { wrapper })

    await act(() => result.current.mutateAsync(validRequest))

    await waitFor(() => {
      const cached = queryClient.getQueryData<Profile>(queryKeys.profile.me())
      expect(cached?.aadhaarVerified).toBe(true)
    })
  })

  it('returns error on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Verification failed' }, 400),
    )

    const { result } = renderHook(() => useVerifyAadhaar(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      try {
        await result.current.mutateAsync(validRequest)
      } catch {
        // expected
      }
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
