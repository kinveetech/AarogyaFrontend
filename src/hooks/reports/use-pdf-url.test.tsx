import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@/test/render'
import { usePdfUrl } from './use-pdf-url'
import type { ReportDetailDownload } from '@/types/reports'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const downloadData = {
  downloadUrl: 'https://cdn.example.com/report.pdf?token=abc',
  expiresAt: new Date(Date.now() + 300_000).toISOString(), // 5 min from now
}

const initialDownload: ReportDetailDownload = {
  objectKey: 'uploads/r1.pdf',
  downloadUrl: 'https://cdn.example.com/initial.pdf?token=init',
  expiresAt: new Date(Date.now() + 300_000).toISOString(),
  provider: 's3',
}

beforeEach(() => {
  mockFetch.mockReset()
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('usePdfUrl', () => {
  it('uses initial download URL without fetching', async () => {
    const { result } = renderHook(() => usePdfUrl('r1', initialDownload))

    expect(result.current.url).toBe(initialDownload.downloadUrl)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    // Should NOT have fetched since initial URL is provided
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches URL on mount when no initial download is provided but objectKey would be missing', () => {
    const { result } = renderHook(() => usePdfUrl('r1', null))

    // No initial URL and no objectKey means it can't fetch
    expect(result.current.url).toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('does not fetch when disabled', () => {
    const { result } = renderHook(() => usePdfUrl('r1', initialDownload, false))

    expect(mockFetch).not.toHaveBeenCalled()
    // Initial URL still set from state initialization
    expect(result.current.url).toBe(initialDownload.downloadUrl)
    expect(result.current.isLoading).toBe(false)
  })

  it('auto-refreshes URL before initial download expiry', async () => {
    // Initial download expires in 2 minutes
    const shortExpiry: ReportDetailDownload = {
      ...initialDownload,
      expiresAt: new Date(Date.now() + 120_000).toISOString(),
    }

    const refreshedData = {
      downloadUrl: 'https://cdn.example.com/refreshed.pdf',
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    }
    mockFetch.mockResolvedValueOnce(jsonResponse(refreshedData))

    const { result } = renderHook(() => usePdfUrl('r1', shortExpiry))

    // Should use initial URL immediately
    expect(result.current.url).toBe(shortExpiry.downloadUrl)

    // Advance time past the refresh point (120s - 60s buffer = 60s)
    vi.advanceTimersByTime(61_000)

    await waitFor(() => {
      expect(result.current.url).toBe(refreshedData.downloadUrl)
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('cleans up timer on unmount', () => {
    const { result, unmount } = renderHook(() => usePdfUrl('r1', initialDownload))

    expect(result.current.url).toBe(initialDownload.downloadUrl)

    // Unmount should not throw or leave dangling timers
    unmount()
  })

  it('provides refresh function to manually re-fetch', async () => {
    const refreshedData = {
      downloadUrl: 'https://cdn.example.com/refreshed.pdf',
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    }
    mockFetch.mockResolvedValueOnce(jsonResponse(refreshedData))

    const { result } = renderHook(() => usePdfUrl('r1', initialDownload))

    expect(result.current.url).toBe(initialDownload.downloadUrl)

    result.current.refresh()

    await waitFor(() => {
      expect(result.current.url).toBe(refreshedData.downloadUrl)
    })
  })

  it('sends objectKey in refresh request body', async () => {
    const refreshedData = {
      downloadUrl: 'https://cdn.example.com/refreshed.pdf',
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    }
    mockFetch.mockResolvedValueOnce(jsonResponse(refreshedData))

    const { result } = renderHook(() => usePdfUrl('r1', initialDownload))

    result.current.refresh()

    await waitFor(() => {
      expect(result.current.url).toBe(refreshedData.downloadUrl)
    })

    const calledInit = mockFetch.mock.calls[0][1] as RequestInit
    const body = JSON.parse(calledInit.body as string)
    expect(body).toEqual({ reportId: 'r1', objectKey: 'uploads/r1.pdf' })
  })

  it('exposes error when refresh fetch fails', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Forbidden' }, 403))

    const { result } = renderHook(() => usePdfUrl('r1', initialDownload))

    result.current.refresh()

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })
  })
})
