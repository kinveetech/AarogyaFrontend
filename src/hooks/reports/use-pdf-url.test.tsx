import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@/test/render'
import { usePdfUrl } from './use-pdf-url'

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

beforeEach(() => {
  mockFetch.mockReset()
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('usePdfUrl', () => {
  it('fetches signed URL on mount when enabled', async () => {
    mockFetch.mockResolvedValue(jsonResponse(downloadData))

    const { result } = renderHook(() => usePdfUrl('r1'))

    await waitFor(() => {
      expect(result.current.url).toBe(downloadData.downloadUrl)
    })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('does not fetch when disabled', () => {
    const { result } = renderHook(() => usePdfUrl('r1', false))

    expect(mockFetch).not.toHaveBeenCalled()
    expect(result.current.url).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('exposes error when fetch fails', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Forbidden' }, 403))

    const { result } = renderHook(() => usePdfUrl('r1'))

    await waitFor(() => {
      expect(result.current.error).not.toBeNull()
    })
    expect(result.current.url).toBeNull()
  })

  it('auto-refreshes URL before expiry', async () => {
    // First response: expires in 2 minutes
    const firstData = {
      downloadUrl: 'https://cdn.example.com/first.pdf',
      expiresAt: new Date(Date.now() + 120_000).toISOString(),
    }
    mockFetch.mockResolvedValueOnce(jsonResponse(firstData))

    const { result } = renderHook(() => usePdfUrl('r1'))

    await waitFor(() => {
      expect(result.current.url).toBe(firstData.downloadUrl)
    })

    // Prepare second response
    const secondData = {
      downloadUrl: 'https://cdn.example.com/second.pdf',
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    }
    mockFetch.mockResolvedValueOnce(jsonResponse(secondData))

    // Advance time past the refresh point (120s - 60s buffer = 60s)
    vi.advanceTimersByTime(61_000)

    await waitFor(() => {
      expect(result.current.url).toBe(secondData.downloadUrl)
    })
  })

  it('cleans up timer on unmount', async () => {
    mockFetch.mockResolvedValue(jsonResponse(downloadData))

    const { result, unmount } = renderHook(() => usePdfUrl('r1'))

    await waitFor(() => {
      expect(result.current.url).toBe(downloadData.downloadUrl)
    })

    // Unmount should not throw or leave dangling timers
    unmount()
  })

  it('provides refresh function to manually re-fetch', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse(downloadData))

    const { result } = renderHook(() => usePdfUrl('r1'))

    await waitFor(() => {
      expect(result.current.url).toBe(downloadData.downloadUrl)
    })

    const refreshedData = {
      downloadUrl: 'https://cdn.example.com/refreshed.pdf',
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    }
    mockFetch.mockResolvedValueOnce(jsonResponse(refreshedData))

    result.current.refresh()

    await waitFor(() => {
      expect(result.current.url).toBe(refreshedData.downloadUrl)
    })
  })
})
