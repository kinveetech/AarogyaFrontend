import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { clearEtagCache } from '@/lib/api/client'
import { useVerifiedDownload } from './use-verified-download'
import { ChecksumMismatchError } from '@/lib/download/verified-download'

// Mock fetch for the API calls
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock the download utility
vi.mock('@/lib/download/verified-download', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/download/verified-download')>()
  return {
    ...original,
    downloadAndVerify: vi.fn(),
    triggerBrowserDownload: vi.fn(),
  }
})

import {
  downloadAndVerify,
  triggerBrowserDownload,
} from '@/lib/download/verified-download'

const mockDownloadAndVerify = vi.mocked(downloadAndVerify)
const mockTriggerBrowserDownload = vi.mocked(triggerBrowserDownload)

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

// Mock URL.createObjectURL / revokeObjectURL
const mockRevokeObjectURL = vi.fn()
vi.stubGlobal('URL', {
  ...globalThis.URL,
  createObjectURL: vi.fn(() => 'blob:http://localhost/mock'),
  revokeObjectURL: mockRevokeObjectURL,
})

beforeEach(() => {
  mockFetch.mockReset()
  mockDownloadAndVerify.mockReset()
  mockTriggerBrowserDownload.mockReset()
  mockRevokeObjectURL.mockReset()
  clearEtagCache()
})

describe('useVerifiedDownload', () => {
  const verifiedApiResponse = {
    reportId: 'r1',
    objectKey: 'uploads/r1.pdf',
    downloadUrl: 'https://cdn.example.com/reports/r1.pdf?token=xyz',
    expiresAt: '2025-01-15T12:00:00Z',
    checksumSha256: 'B94D27B9934D3E08A52E52D7DA7DABFAC484EFE37A5380EE9088F7ACE2EFCDE9',
    isServerVerified: true,
  }

  it('downloads file with checksum validation on success', async () => {
    mockFetch.mockResolvedValue(jsonResponse(verifiedApiResponse))
    mockDownloadAndVerify.mockResolvedValue({
      blobUrl: 'blob:http://localhost/mock',
      blob: new Blob(['content']),
      checksumValidated: true,
    })

    const onSuccess = vi.fn()
    const { result } = renderHook(
      () => useVerifiedDownload({ onSuccess }),
      { wrapper: createWrapper() },
    )

    expect(result.current.isPending).toBe(false)
    expect(result.current.error).toBeNull()

    await act(async () => {
      result.current.download('r1', 'report.pdf')
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(mockDownloadAndVerify).toHaveBeenCalledWith({
      downloadUrl: 'https://cdn.example.com/reports/r1.pdf?token=xyz',
      checksumSha256: 'B94D27B9934D3E08A52E52D7DA7DABFAC484EFE37A5380EE9088F7ACE2EFCDE9',
    })
    expect(mockTriggerBrowserDownload).toHaveBeenCalledWith(
      'blob:http://localhost/mock',
      'report.pdf',
    )
    expect(onSuccess).toHaveBeenCalledOnce()
    expect(result.current.error).toBeNull()
  })

  it('uses default filename when not provided', async () => {
    mockFetch.mockResolvedValue(jsonResponse(verifiedApiResponse))
    mockDownloadAndVerify.mockResolvedValue({
      blobUrl: 'blob:http://localhost/mock',
      blob: new Blob(['content']),
      checksumValidated: true,
    })

    const { result } = renderHook(
      () => useVerifiedDownload(),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      result.current.download('r1')
    })

    await waitFor(() => expect(mockTriggerBrowserDownload).toHaveBeenCalled())
    expect(mockTriggerBrowserDownload).toHaveBeenCalledWith(
      'blob:http://localhost/mock',
      'report-r1',
    )
  })

  it('calls onChecksumMismatch when checksum validation fails', async () => {
    const mismatchError = new ChecksumMismatchError('EXPECTED', 'ACTUAL')
    mockFetch.mockResolvedValue(jsonResponse(verifiedApiResponse))
    mockDownloadAndVerify.mockRejectedValue(mismatchError)

    const onChecksumMismatch = vi.fn()
    const onError = vi.fn()

    const { result } = renderHook(
      () => useVerifiedDownload({ onChecksumMismatch, onError }),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      result.current.download('r1', 'report.pdf')
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(onChecksumMismatch).toHaveBeenCalledWith(mismatchError)
    expect(onError).not.toHaveBeenCalled()
    expect(result.current.error).toBe(mismatchError)
    expect(mockTriggerBrowserDownload).not.toHaveBeenCalled()
  })

  it('calls onError when download fetch fails', async () => {
    mockFetch.mockResolvedValue(jsonResponse(verifiedApiResponse))
    const downloadError = new Error('Download failed')
    mockDownloadAndVerify.mockRejectedValue(downloadError)

    const onError = vi.fn()

    const { result } = renderHook(
      () => useVerifiedDownload({ onError }),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      result.current.download('r1', 'report.pdf')
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(onError).toHaveBeenCalledWith(downloadError)
    expect(result.current.error).toBe(downloadError)
  })

  it('calls onError when API URL fetch fails', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Not found' }, 404))

    const onError = vi.fn()

    const { result } = renderHook(
      () => useVerifiedDownload({ onError }),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      result.current.download('r1', 'report.pdf')
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(onError).toHaveBeenCalledOnce()
    expect(result.current.error).toBeTruthy()
    expect(mockDownloadAndVerify).not.toHaveBeenCalled()
  })

  it('sets isPending true during download and false after', async () => {
    let resolveDownload: (value: unknown) => void
    const downloadPromise = new Promise((resolve) => {
      resolveDownload = resolve
    })

    mockFetch.mockResolvedValue(jsonResponse(verifiedApiResponse))
    mockDownloadAndVerify.mockReturnValue(downloadPromise as never)

    const { result } = renderHook(
      () => useVerifiedDownload(),
      { wrapper: createWrapper() },
    )

    expect(result.current.isPending).toBe(false)

    act(() => {
      result.current.download('r1', 'report.pdf')
    })

    await waitFor(() => expect(result.current.isPending).toBe(true))

    await act(async () => {
      resolveDownload!({
        blobUrl: 'blob:http://localhost/mock',
        blob: new Blob(['content']),
        checksumValidated: true,
      })
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))
  })

  it('resets error state', async () => {
    mockFetch.mockResolvedValue(jsonResponse(verifiedApiResponse))
    mockDownloadAndVerify.mockRejectedValue(new Error('fail'))

    const { result } = renderHook(
      () => useVerifiedDownload(),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      result.current.download('r1', 'report.pdf')
    })

    await waitFor(() => expect(result.current.error).not.toBeNull())

    act(() => {
      result.current.reset()
    })

    expect(result.current.error).toBeNull()
  })

  it('clears previous error when starting new download', async () => {
    // Use mockResolvedValueOnce to get fresh Response objects each time
    mockFetch
      .mockResolvedValueOnce(jsonResponse(verifiedApiResponse))
      .mockResolvedValueOnce(jsonResponse(verifiedApiResponse))
    mockDownloadAndVerify.mockRejectedValueOnce(new Error('first fail'))

    const { result } = renderHook(
      () => useVerifiedDownload(),
      { wrapper: createWrapper() },
    )

    // First download fails
    await act(async () => {
      result.current.download('r1', 'report.pdf')
    })
    await waitFor(() => expect(result.current.error).not.toBeNull())

    // Second download succeeds
    mockDownloadAndVerify.mockResolvedValueOnce({
      blobUrl: 'blob:http://localhost/mock',
      blob: new Blob(['content']),
      checksumValidated: true,
    })

    await act(async () => {
      result.current.download('r1', 'report.pdf')
    })

    await waitFor(() => expect(result.current.error).toBeNull())
  })

  it('revokes blob URL after triggering download', async () => {
    mockFetch.mockResolvedValue(jsonResponse(verifiedApiResponse))
    mockDownloadAndVerify.mockResolvedValue({
      blobUrl: 'blob:http://localhost/mock',
      blob: new Blob(['content']),
      checksumValidated: true,
    })

    const { result } = renderHook(
      () => useVerifiedDownload(),
      { wrapper: createWrapper() },
    )

    await act(async () => {
      result.current.download('r1', 'report.pdf')
    })

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(mockTriggerBrowserDownload).toHaveBeenCalledBefore(mockRevokeObjectURL)
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock')
  })

  it('wraps non-Error thrown values in Error', async () => {
    mockFetch.mockResolvedValue(jsonResponse(verifiedApiResponse))
    // Reject with a string instead of an Error instance
    mockDownloadAndVerify.mockRejectedValue('string error')

    const onError = vi.fn()

    const { result } = renderHook(
      () => useVerifiedDownload({ onError }),
      { wrapper: createWrapper() },
    )

    act(() => {
      result.current.download('r1', 'report.pdf')
    })

    await waitFor(() => expect(result.current.error).not.toBeNull())

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('string error')
    expect(onError).toHaveBeenCalledOnce()
  })

  it('wraps non-Error API failure in Error', async () => {
    // Simulate fetch returning a non-standard error shape
    mockFetch.mockRejectedValue('network failure')

    const onError = vi.fn()

    const { result } = renderHook(
      () => useVerifiedDownload({ onError }),
      { wrapper: createWrapper() },
    )

    act(() => {
      result.current.download('r1', 'report.pdf')
    })

    await waitFor(() => expect(result.current.error).not.toBeNull())

    expect(onError).toHaveBeenCalledOnce()
    expect(mockDownloadAndVerify).not.toHaveBeenCalled()
  })
})
