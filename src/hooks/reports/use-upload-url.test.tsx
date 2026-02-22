import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useUploadUrl } from './use-upload-url'

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

describe('useUploadUrl', () => {
  it('posts fileName and contentType, returns presigned URL', async () => {
    const responseData = {
      uploadUrl: 'https://s3.amazonaws.com/bucket/key?signature=abc',
      fileKey: 'uploads/abc123.pdf',
      expiresAt: '2025-01-15T11:00:00Z',
    }
    mockFetch.mockResolvedValue(jsonResponse(responseData))

    const { result } = renderHook(() => useUploadUrl(), {
      wrapper: createWrapper(),
    })

    await act(() =>
      result.current.mutateAsync({
        fileName: 'blood-test.pdf',
        contentType: 'application/pdf',
      }),
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(responseData)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/reports/upload-url')

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    expect(calledInit.method).toBe('POST')
    expect(JSON.parse(calledInit.body as string)).toEqual({
      fileName: 'blood-test.pdf',
      contentType: 'application/pdf',
    })
  })

  it('returns error on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Unauthorized' }, 401),
    )

    const { result } = renderHook(() => useUploadUrl(), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      try {
        await result.current.mutateAsync({
          fileName: 'test.pdf',
          contentType: 'application/pdf',
        })
      } catch {
        // expected
      }
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ status: 401 })
  })
})
