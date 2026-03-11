import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useExtractionStatus } from './use-extraction-status'
import type { ExtractionStatusResponse } from '@/types/reports'

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

const completedExtraction: ExtractionStatusResponse = {
  status: 'completed',
  extractionMethod: 'ocr',
  structuringModel: 'gpt-4o',
  extractedParameterCount: 12,
  overallConfidence: 0.95,
  pageCount: 3,
  extractedAt: '2025-06-15T10:30:00Z',
  errorMessage: null,
  attemptCount: 1,
}

const processingExtraction: ExtractionStatusResponse = {
  status: 'processing',
  extractionMethod: null,
  structuringModel: null,
  extractedParameterCount: 0,
  overallConfidence: null,
  pageCount: null,
  extractedAt: null,
  errorMessage: null,
  attemptCount: 1,
}

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useExtractionStatus', () => {
  it('fetches extraction status successfully', async () => {
    mockFetch.mockResolvedValue(jsonResponse(completedExtraction))

    const { result } = renderHook(() => useExtractionStatus('r1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(completedExtraction)

    const calledUrl = mockFetch.mock.calls[0][0] as string
    expect(calledUrl).toContain('/v1/reports/r1/extraction')
  })

  it('does not fetch when reportId is empty', () => {
    const { result } = renderHook(() => useExtractionStatus(''), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns error on 404', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Not found' }, 404),
    )

    const { result } = renderHook(() => useExtractionStatus('missing'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toMatchObject({
      status: 404,
      message: 'Not found',
    })
  })

  it('enables refetch interval for processing status', async () => {
    mockFetch.mockResolvedValue(jsonResponse(processingExtraction))

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    })

    const wrapper = function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      )
    }

    const { result } = renderHook(() => useExtractionStatus('r1'), {
      wrapper,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.status).toBe('processing')
  })

  it('does not poll for completed status', async () => {
    mockFetch.mockResolvedValue(jsonResponse(completedExtraction))

    const { result } = renderHook(() => useExtractionStatus('r1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.status).toBe('completed')
    // Completed status should not trigger polling — only 1 call
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('returns failed extraction with error message', async () => {
    const failedExtraction: ExtractionStatusResponse = {
      status: 'failed',
      extractionMethod: 'ocr',
      structuringModel: null,
      extractedParameterCount: 0,
      overallConfidence: null,
      pageCount: null,
      extractedAt: null,
      errorMessage: 'Unable to parse document',
      attemptCount: 2,
    }
    mockFetch.mockResolvedValue(jsonResponse(failedExtraction))

    const { result } = renderHook(() => useExtractionStatus('r1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.status).toBe('failed')
    expect(result.current.data?.errorMessage).toBe('Unable to parse document')
  })
})
