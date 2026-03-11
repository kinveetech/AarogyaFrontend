import { computeSha256, checksumsMatch } from '@/lib/crypto/checksum'

export class ChecksumMismatchError extends Error {
  constructor(
    public readonly expected: string,
    public readonly actual: string,
  ) {
    super(
      `File integrity check failed: checksum mismatch (expected ${expected.slice(0, 8)}..., got ${actual.slice(0, 8)}...)`,
    )
    this.name = 'ChecksumMismatchError'
  }
}

export class DownloadFetchError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'DownloadFetchError'
  }
}

export interface VerifiedDownloadOptions {
  /** The signed download URL */
  downloadUrl: string
  /** Expected SHA-256 checksum (uppercase hex). If null, checksum validation is skipped. */
  checksumSha256: string | null
  /** Filename for the downloaded file */
  fileName?: string
}

export interface VerifiedDownloadResult {
  /** Object URL for the downloaded blob — caller must revoke when done */
  blobUrl: string
  /** The downloaded blob */
  blob: Blob
  /** Whether checksum validation was performed */
  checksumValidated: boolean
}

/**
 * Download a file from the given URL and optionally validate its SHA-256 checksum.
 * Throws ChecksumMismatchError if the checksum does not match.
 * Throws DownloadFetchError if the download itself fails.
 */
export async function downloadAndVerify(
  options: VerifiedDownloadOptions,
): Promise<VerifiedDownloadResult> {
  const { downloadUrl, checksumSha256 } = options

  let response: Response
  try {
    response = await fetch(downloadUrl)
  } catch {
    throw new DownloadFetchError(0, 'Network error during file download')
  }

  if (!response.ok) {
    throw new DownloadFetchError(
      response.status,
      `File download failed with status ${response.status}`,
    )
  }

  const blob = await response.blob()

  if (checksumSha256) {
    const actualChecksum = await computeSha256(blob)
    if (!checksumsMatch(checksumSha256, actualChecksum)) {
      throw new ChecksumMismatchError(checksumSha256, actualChecksum)
    }
  }

  const blobUrl = URL.createObjectURL(blob)

  return {
    blobUrl,
    blob,
    checksumValidated: checksumSha256 !== null,
  }
}

/**
 * Trigger a browser download of a blob URL with the specified filename.
 */
export function triggerBrowserDownload(blobUrl: string, fileName: string): void {
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = fileName
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
