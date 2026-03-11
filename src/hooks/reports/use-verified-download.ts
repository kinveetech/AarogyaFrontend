'use client'

import { useState, useCallback, useRef } from 'react'
import { useVerifiedDownloadUrl } from './use-verified-download-url'
import {
  downloadAndVerify,
  triggerBrowserDownload,
  ChecksumMismatchError,
  DownloadFetchError,
} from '@/lib/download/verified-download'

export interface UseVerifiedDownloadOptions {
  /** Called when checksum mismatch is detected */
  onChecksumMismatch?: (error: ChecksumMismatchError) => void
  /** Called when download fails */
  onError?: (error: Error) => void
  /** Called on successful download */
  onSuccess?: () => void
}

export interface UseVerifiedDownloadResult {
  /** Trigger a verified download for the given report */
  download: (reportId: string, fileName?: string) => void
  /** Whether the download is in progress */
  isPending: boolean
  /** The last error encountered */
  error: Error | null
  /** Reset the error state */
  reset: () => void
}

export function useVerifiedDownload(
  options: UseVerifiedDownloadOptions = {},
): UseVerifiedDownloadResult {
  const { onChecksumMismatch, onError, onSuccess } = options
  const verifiedDownloadUrl = useVerifiedDownloadUrl()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  const reset = useCallback(() => {
    setError(null)
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [])

  const download = useCallback(
    (reportId: string, fileName?: string) => {
      setIsPending(true)
      setError(null)

      verifiedDownloadUrl.mutate(
        { reportId },
        {
          onSuccess: async (urlResult) => {
            try {
              const result = await downloadAndVerify({
                downloadUrl: urlResult.downloadUrl,
                checksumSha256: urlResult.checksumSha256,
              })

              blobUrlRef.current = result.blobUrl
              const downloadName = fileName ?? `report-${reportId}`
              triggerBrowserDownload(result.blobUrl, downloadName)

              // Revoke after a short delay to ensure download starts
              setTimeout(() => {
                if (blobUrlRef.current) {
                  URL.revokeObjectURL(blobUrlRef.current)
                  blobUrlRef.current = null
                }
              }, 1000)

              setIsPending(false)
              onSuccess?.()
            } catch (err) {
              setIsPending(false)
              const downloadError = err instanceof Error ? err : new Error(String(err))
              setError(downloadError)

              if (err instanceof ChecksumMismatchError) {
                onChecksumMismatch?.(err)
              } else {
                onError?.(downloadError)
              }
            }
          },
          onError: (err) => {
            setIsPending(false)
            const apiError = err instanceof Error ? err : new Error(String(err))
            setError(apiError)
            onError?.(apiError)
          },
        },
      )
    },
    [verifiedDownloadUrl, onChecksumMismatch, onError, onSuccess],
  )

  return {
    download,
    isPending,
    error,
    reset,
  }
}

export { ChecksumMismatchError, DownloadFetchError }
