import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useVerifiedDownloadUrl } from './use-verified-download-url'

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
    defaultOptions: { mutations: { retry: false } },
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

describe('useVerifiedDownloadUrl', () => {
  it('posts reportId and returns verified download result with checksum', async () => {
    const responseData = {
      reportId: 'r1',
      objectKey: 'uploads/r1.pdf',
      downloadUrl: 'https://cdn.example.com/reports/r1.pdf?token=xyz',
      expiresAt: '2025-01-15T12:00:00Z',
      checksumSha256: 'B94D27B9934D3E08A52E52D7DA7DABFAC484EFE37A5380EE9088F7ACE2EFCDE9',
      isServerVerified: true,
    }
    mockFetch.mockResolvedValue(jsonResponse(responseData))

    const { result } = renderHook(() => useVerifiedDownloadUrl(), {
      wrapper: createWrapper(),
    })

    await act(() =>
      result.current.mutateAsync({ reportId: 'r1' }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      downloadUrl: 'https://cdn.example.com/reports/r1.pdf?token=xyz',
      checksumSha256: 'B94D27B9934D3E08A52E52D7DA7DABFAC484EFE37A5380EE9088F7ACE2EFCDE9',
      isServerVerified: true,
      usedFallback: false,
    })

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/reports/download-url/verified')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('POST')
    expect(JSON.parse(calledInit.body as string)).toEqual({ reportId: 'r1' })
  })

  it('returns null checksumSha256 when backend provides null', async () => {
    const responseData = {
      reportId: 'r1',
      objectKey: 'uploads/r1.pdf',
      downloadUrl: 'https://cdn.example.com/reports/r1.pdf?token=xyz',
      expiresAt: '2025-01-15T12:00:00Z',
      checksumSha256: null,
      isServerVerified: false,
    }
    mockFetch.mockResolvedValue(jsonResponse(responseData))

    const { result } = renderHook(() => useVerifiedDownloadUrl(), {
      wrapper: createWrapper(),
    })

    await act(() =>
      result.current.mutateAsync({ reportId: 'r1' }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      downloadUrl: 'https://cdn.example.com/reports/r1.pdf?token=xyz',
      checksumSha256: null,
      isServerVerified: false,
      usedFallback: false,
    })
  })

  it('returns error on 4xx client error without fallback', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Not found' }, 404),
    )

    const { result } = renderHook(() => useVerifiedDownloadUrl(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      try {
        await result.current.mutateAsync({ reportId: 'nonexistent' })
      } catch {
        // expected
      }
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ status: 404 })
    // Should NOT have called the fallback endpoint
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('falls back to standard download URL on server error', async () => {
    const fallbackData = {
      downloadUrl: 'https://cdn.example.com/reports/r1.pdf?fallback=true',
      expiresAt: '2025-01-15T12:00:00Z',
    }

    mockFetch
      .mockResolvedValueOnce(jsonResponse({ message: 'Internal Server Error' }, 500))
      .mockResolvedValueOnce(jsonResponse(fallbackData))

    const { result } = renderHook(() => useVerifiedDownloadUrl(), {
      wrapper: createWrapper(),
    })

    await act(() =>
      result.current.mutateAsync({ reportId: 'r1' }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      downloadUrl: 'https://cdn.example.com/reports/r1.pdf?fallback=true',
      checksumSha256: null,
      isServerVerified: false,
      usedFallback: true,
    })

    // Should have called both endpoints
    expect(mockFetch).toHaveBeenCalledTimes(2)
    const fallbackUrl = mockFetch.mock.calls[1][0] as string
    expect(fallbackUrl).toContain('/v1/reports/download-url')
    expect(fallbackUrl).not.toContain('verified')
  })

  it('propagates error when both verified and fallback fail', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse({ message: 'Internal Server Error' }, 500))
      .mockResolvedValueOnce(jsonResponse({ message: 'Also broken' }, 500))

    const { result } = renderHook(() => useVerifiedDownloadUrl(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      try {
        await result.current.mutateAsync({ reportId: 'r1' })
      } catch {
        // expected
      }
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ status: 500 })
  })

  it('does not fallback on 400 Bad Request', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Validation failed' }, 400),
    )

    const { result } = renderHook(() => useVerifiedDownloadUrl(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      try {
        await result.current.mutateAsync({ reportId: '' })
      } catch {
        // expected
      }
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('does not fallback on 403 Forbidden', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Forbidden' }, 403),
    )

    const { result } = renderHook(() => useVerifiedDownloadUrl(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      try {
        await result.current.mutateAsync({ reportId: 'r1' })
      } catch {
        // expected
      }
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('passes expiryMinutes in request body when provided', async () => {
    const responseData = {
      reportId: 'r1',
      objectKey: 'uploads/r1.pdf',
      downloadUrl: 'https://cdn.example.com/reports/r1.pdf',
      expiresAt: '2025-01-15T12:00:00Z',
      checksumSha256: 'ABC123',
      isServerVerified: true,
    }
    mockFetch.mockResolvedValue(jsonResponse(responseData))

    const { result } = renderHook(() => useVerifiedDownloadUrl(), {
      wrapper: createWrapper(),
    })

    await act(() =>
      result.current.mutateAsync({ reportId: 'r1', expiryMinutes: 30 }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(JSON.parse(calledInit.body as string)).toEqual({
      reportId: 'r1',
      expiryMinutes: 30,
    })
  })
})
