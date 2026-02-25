import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useRegistrationStatus } from './use-registration-status'

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

describe('useRegistrationStatus', () => {
  it('returns approved status on success', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({
        sub: 'u1',
        role: 'patient',
        registrationStatus: 'approved',
      }),
    )

    const { result } = renderHook(() => useRegistrationStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      status: 'approved',
      role: 'patient',
      rejectionReason: undefined,
    })

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/users/me/registration-status')
  })

  it('returns registration_required on 403 with registration_required code', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        { message: 'Registration required', code: 'registration_required' },
        403,
      ),
    )

    const { result } = renderHook(() => useRegistrationStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      status: 'registration_required',
    })
  })

  it('returns registration_pending_approval on 403 with pending code', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        { message: 'Pending approval', code: 'registration_pending_approval' },
        403,
      ),
    )

    const { result } = renderHook(() => useRegistrationStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      status: 'registration_pending_approval',
    })
  })

  it('returns registration_rejected on 403 with rejected code', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse(
        { message: 'Registration rejected', code: 'registration_rejected' },
        403,
      ),
    )

    const { result } = renderHook(() => useRegistrationStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      status: 'registration_rejected',
    })
  })

  it('throws error on 403 without a known registration code', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Forbidden', code: 'some_other_code' }, 403),
    )

    const { result } = renderHook(() => useRegistrationStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('throws error on non-403 failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Internal server error' }, 500),
    )

    const { result } = renderHook(() => useRegistrationStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('includes rejectionReason when present in response', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({
        sub: 'u1',
        role: 'doctor',
        registrationStatus: 'rejected',
        rejectionReason: 'Invalid license',
      }),
    )

    const { result } = renderHook(() => useRegistrationStatus(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual({
      status: 'rejected',
      role: 'doctor',
      rejectionReason: 'Invalid license',
    })
  })
})
