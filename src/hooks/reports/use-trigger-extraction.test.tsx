import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { useTriggerExtraction } from './use-trigger-extraction'
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

let queryClient: QueryClient

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

const triggerResponse: ExtractionStatusResponse = {
  reportId: 'r1',
  status: 'extracting',
  extractionMethod: null,
  structuringModel: null,
  extractedParameterCount: 0,
  overallConfidence: null,
  pageCount: null,
  extractedAt: null,
  errorMessage: null,
  attemptCount: 2,
}

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('useTriggerExtraction', () => {
  it('sends POST request to extract endpoint', async () => {
    mockFetch.mockResolvedValue(jsonResponse(triggerResponse))

    const { result } = renderHook(() => useTriggerExtraction('r1'), {
      wrapper: createWrapper(),
    })

    await act(() => result.current.mutateAsync())

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/reports/r1/extract'),
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('updates extraction query cache on success', async () => {
    mockFetch.mockResolvedValue(jsonResponse(triggerResponse))

    const wrapper = createWrapper()
    const { result } = renderHook(() => useTriggerExtraction('r1'), {
      wrapper,
    })

    await act(() => result.current.mutateAsync())

    const cached = queryClient.getQueryData<ExtractionStatusResponse>(
      queryKeys.reports.extraction('r1'),
    )
    expect(cached).toEqual(triggerResponse)
  })

  it('returns error on failure', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Extraction already in progress' }, 409),
    )

    const { result } = renderHook(() => useTriggerExtraction('r1'), {
      wrapper: createWrapper(),
    })

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(result.current.error).toMatchObject({
      status: 409,
      message: 'Extraction already in progress',
    })
  })

  it('invalidates extraction query on settled', async () => {
    mockFetch.mockResolvedValue(jsonResponse(triggerResponse))

    const wrapper = createWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useTriggerExtraction('r1'), {
      wrapper,
    })

    await act(() => result.current.mutateAsync())

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.reports.extraction('r1'),
    })
  })
})
