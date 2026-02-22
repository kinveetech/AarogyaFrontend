import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useProfile } from './use-profile'
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
  dateOfBirth: '1990-03-15T00:00:00Z',
  bloodGroup: 'B+',
  gender: 'male',
  city: 'Bengaluru',
  aadhaarVerified: false,
  avatarUrl: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
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

describe('useProfile', () => {
  it('fetches profile from /v1/profile', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))

    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockProfile)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/profile')
  })

  it('returns error on failure', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Unauthorized' }, 401))

    const { result } = renderHook(() => useProfile(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
