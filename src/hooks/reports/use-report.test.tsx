import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useReport } from './use-report'

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
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
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

describe('useReport', () => {
  it('fetches report detail successfully', async () => {
    const detail = {
      id: 'r1',
      title: 'Blood Test',
      reportType: 'blood_test',
      status: 'verified',
      reportDate: '2025-01-15',
      labName: 'PathLab',
      doctorName: 'Dr. Smith',
      notes: null,
      highlightParameter: 'Hemoglobin: 14.2 g/dL',
      parameters: [{ name: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '12-16', status: 'normal' }],
      fileKey: 'abc123',
      fileType: 'application/pdf',
      fileSizeBytes: 102400,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
    }
    mockFetch.mockResolvedValue(jsonResponse(detail))

    const { result } = renderHook(() => useReport('r1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(detail)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/reports/r1')
  })

  it('does not fetch when id is empty', async () => {
    const { result } = renderHook(() => useReport(''), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns error on 404', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Not found' }, 404),
    )

    const { result } = renderHook(() => useReport('missing'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({ status: 404, message: 'Not found' })
  })
})
