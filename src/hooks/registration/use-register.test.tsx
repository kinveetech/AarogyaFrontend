import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useRegister } from './use-register'
import type { RegisterUserRequest } from '@/types/registration'

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

function createWrapper() {
  queryClient = new QueryClient({
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

describe('useRegister', () => {
  it('posts registration request to /v1/users/register', async () => {
    const responseData = {
      sub: 'u1',
      role: 'patient',
      registrationStatus: 'approved',
      email: 'amit@example.com',
      firstName: 'Amit',
      lastName: 'Patel',
      consentsGranted: ['profile_management'],
    }
    mockFetch.mockResolvedValue(jsonResponse(responseData))

    const request: RegisterUserRequest = {
      role: 'patient',
      firstName: 'Amit',
      lastName: 'Patel',
      email: 'amit@example.com',
      consents: [{ purpose: 'profile_management', isGranted: true }],
    }

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync(request))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(responseData)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/users/register')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('POST')
    expect(JSON.parse(calledInit.body as string)).toEqual(request)
  })

  it('posts doctor registration with doctorData', async () => {
    const responseData = {
      sub: 'u2',
      role: 'doctor',
      registrationStatus: 'pending_approval',
      email: 'dr@example.com',
      firstName: 'Priya',
      lastName: 'Sharma',
      consentsGranted: ['profile_management'],
    }
    mockFetch.mockResolvedValue(jsonResponse(responseData))

    const request: RegisterUserRequest = {
      role: 'doctor',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'dr@example.com',
      doctorData: {
        medicalLicenseNumber: 'MCI-12345',
        specialization: 'Cardiology',
      },
      consents: [{ purpose: 'profile_management', isGranted: true }],
    }

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync(request))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    const body = JSON.parse(calledInit.body as string)
    expect(body.doctorData).toEqual({
      medicalLicenseNumber: 'MCI-12345',
      specialization: 'Cardiology',
    })
  })

  it('invalidates registration queries on success', async () => {
    const wrapper = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    mockFetch.mockResolvedValue(
      jsonResponse({
        sub: 'u1',
        role: 'patient',
        registrationStatus: 'approved',
        email: 'amit@example.com',
        firstName: 'Amit',
        lastName: 'Patel',
        consentsGranted: [],
      }),
    )

    const { result } = renderHook(() => useRegister(), { wrapper })

    await act(() =>
      result.current.mutateAsync({
        role: 'patient',
        firstName: 'Amit',
        lastName: 'Patel',
        email: 'amit@example.com',
      }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.registration.all,
    })
  })

  it('returns error on API failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Validation failed' }, 422),
    )

    const { result } = renderHook(() => useRegister(), {
      wrapper: createWrapper(),
    })

    await act(() =>
      result.current.mutateAsync({
        role: 'patient',
        firstName: 'Amit',
        lastName: 'Patel',
        email: 'amit@example.com',
      }).catch(() => {}),
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
