'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDownloadUrl } from './use-download-url'

/** Refresh URL this many ms before it expires */
const EXPIRY_BUFFER_MS = 60_000

export interface UsePdfUrlResult {
  url: string | null
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

export function usePdfUrl(
  reportId: string,
  enabled = true,
): UsePdfUrlResult {
  const downloadUrl = useDownloadUrl()
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const fetchUrl = useCallback(() => {
    downloadUrl.mutate(
      { reportId },
      {
        onSuccess: (res) => {
          if (!mountedRef.current) return
          setUrl(res.downloadUrl)
          setError(null)

          // Schedule auto-refresh before expiry
          const expiresAt = new Date(res.expiresAt).getTime()
          const now = Date.now()
          const refreshIn = Math.max(expiresAt - now - EXPIRY_BUFFER_MS, 0)

          if (timerRef.current) clearTimeout(timerRef.current)
          timerRef.current = setTimeout(() => {
            if (mountedRef.current) fetchUrl()
          }, refreshIn)
        },
        onError: (err) => {
          if (!mountedRef.current) return
          setError(err)
        },
      },
    )
  }, [downloadUrl, reportId])

  useEffect(() => {
    mountedRef.current = true
    if (enabled) fetchUrl()

    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // Only re-run when reportId or enabled changes, not on fetchUrl identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, enabled])

  return {
    url,
    isLoading: downloadUrl.isPending && url === null,
    error,
    refresh: fetchUrl,
  }
}
