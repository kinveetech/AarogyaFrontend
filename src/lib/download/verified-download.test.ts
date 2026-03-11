import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  downloadAndVerify,
  triggerBrowserDownload,
  ChecksumMismatchError,
  DownloadFetchError,
} from './verified-download'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock the crypto module
vi.mock('@/lib/crypto/checksum', () => ({
  computeSha256: vi.fn(),
  checksumsMatch: vi.fn(),
}))

import { computeSha256, checksumsMatch } from '@/lib/crypto/checksum'

const mockComputeSha256 = vi.mocked(computeSha256)
const mockChecksumsMatch = vi.mocked(checksumsMatch)

beforeEach(() => {
  mockFetch.mockReset()
  mockComputeSha256.mockReset()
  mockChecksumsMatch.mockReset()
})

describe('downloadAndVerify', () => {
  const validChecksum = 'B94D27B9934D3E08A52E52D7DA7DABFAC484EFE37A5380EE9088F7ACE2EFCDE9'

  it('downloads file and skips checksum validation when checksumSha256 is null', async () => {
    const blob = new Blob(['file content'])
    mockFetch.mockResolvedValue(
      new Response(blob, { status: 200 }),
    )

    const result = await downloadAndVerify({
      downloadUrl: 'https://cdn.example.com/file.pdf',
      checksumSha256: null,
    })

    expect(result.checksumValidated).toBe(false)
    expect(result.blob).toBeInstanceOf(Blob)
    expect(result.blobUrl).toBeTruthy()
    expect(mockComputeSha256).not.toHaveBeenCalled()

    // Clean up
    URL.revokeObjectURL(result.blobUrl)
  })

  it('downloads file and validates checksum when checksumSha256 is provided', async () => {
    const blob = new Blob(['file content'])
    mockFetch.mockResolvedValue(
      new Response(blob, { status: 200 }),
    )
    mockComputeSha256.mockResolvedValue(validChecksum)
    mockChecksumsMatch.mockReturnValue(true)

    const result = await downloadAndVerify({
      downloadUrl: 'https://cdn.example.com/file.pdf',
      checksumSha256: validChecksum,
    })

    expect(result.checksumValidated).toBe(true)
    expect(result.blob).toBeInstanceOf(Blob)
    expect(mockComputeSha256).toHaveBeenCalledOnce()
    expect(mockChecksumsMatch).toHaveBeenCalledWith(validChecksum, validChecksum)

    URL.revokeObjectURL(result.blobUrl)
  })

  it('throws ChecksumMismatchError when checksum does not match', async () => {
    const wrongChecksum = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
    mockComputeSha256.mockResolvedValue(wrongChecksum)
    mockChecksumsMatch.mockReturnValue(false)
    mockFetch.mockResolvedValue(
      new Response(new Blob(['corrupted content']), { status: 200 }),
    )

    try {
      await downloadAndVerify({
        downloadUrl: 'https://cdn.example.com/file.pdf',
        checksumSha256: validChecksum,
      })
      expect.fail('Should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(ChecksumMismatchError)
      const mismatch = err as ChecksumMismatchError
      expect(mismatch.expected).toBe(validChecksum)
      expect(mismatch.actual).toBe(wrongChecksum)
      expect(mismatch.message).toContain('checksum mismatch')
    }
  })

  it('throws DownloadFetchError when fetch returns non-ok status', async () => {
    mockFetch.mockResolvedValue(
      new Response('Not Found', { status: 404, statusText: 'Not Found' }),
    )

    try {
      await downloadAndVerify({
        downloadUrl: 'https://cdn.example.com/file.pdf',
        checksumSha256: null,
      })
      expect.fail('Should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(DownloadFetchError)
      const fetchErr = err as DownloadFetchError
      expect(fetchErr.status).toBe(404)
      expect(fetchErr.message).toContain('404')
    }
  })

  it('throws DownloadFetchError on network error', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))

    try {
      await downloadAndVerify({
        downloadUrl: 'https://cdn.example.com/file.pdf',
        checksumSha256: null,
      })
      expect.fail('Should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(DownloadFetchError)
      const fetchErr = err as DownloadFetchError
      expect(fetchErr.status).toBe(0)
      expect(fetchErr.message).toContain('Network error')
    }
  })

  it('creates a valid blob URL', async () => {
    const content = 'PDF content here'
    const blob = new Blob([content], { type: 'application/pdf' })
    mockFetch.mockResolvedValue(
      new Response(blob, { status: 200 }),
    )

    const result = await downloadAndVerify({
      downloadUrl: 'https://cdn.example.com/file.pdf',
      checksumSha256: null,
    })

    expect(result.blobUrl).toMatch(/^blob:/)

    URL.revokeObjectURL(result.blobUrl)
  })
})

describe('triggerBrowserDownload', () => {
  it('creates an anchor element, clicks it, and removes it', () => {
    const clickMock = vi.fn()
    const appendChildMock = vi.fn()
    const removeChildMock = vi.fn()

    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      style: { display: '' },
      click: clickMock,
    } as unknown as HTMLAnchorElement)

    vi.spyOn(document.body, 'appendChild').mockImplementation(appendChildMock)
    vi.spyOn(document.body, 'removeChild').mockImplementation(removeChildMock)

    triggerBrowserDownload('blob:http://localhost/abc', 'report.pdf')

    expect(clickMock).toHaveBeenCalledOnce()
    expect(appendChildMock).toHaveBeenCalledOnce()
    expect(removeChildMock).toHaveBeenCalledOnce()

    vi.restoreAllMocks()
  })
})

describe('ChecksumMismatchError', () => {
  it('has correct name and properties', () => {
    const error = new ChecksumMismatchError('AAAA', 'BBBB')
    expect(error.name).toBe('ChecksumMismatchError')
    expect(error.expected).toBe('AAAA')
    expect(error.actual).toBe('BBBB')
    expect(error.message).toContain('checksum mismatch')
  })
})

describe('DownloadFetchError', () => {
  it('has correct name and properties', () => {
    const error = new DownloadFetchError(500, 'Server error')
    expect(error.name).toBe('DownloadFetchError')
    expect(error.status).toBe(500)
    expect(error.message).toBe('Server error')
  })
})
