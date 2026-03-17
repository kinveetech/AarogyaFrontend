'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useDownloadUrl } from './use-download-url'
import type { ReportDetailDownload } from '@/types/reports'

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
  initialDownload: ReportDetailDownload | null,
  enabled = true,
): UsePdfUrlResult {
  const downloadUrl = useDownloadUrl()
  const [url, setUrl] = useState<string | null>(initialDownload?.downloadUrl ?? null)
  const [error, setError] = useState<Error | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const objectKeyRef = useRef(initialDownload?.objectKey ?? '')

  // Update objectKey when initialDownload changes
  useEffect(() => {
    if (initialDownload?.objectKey) {
      objectKeyRef.current = initialDownload.objectKey
    }
  }, [initialDownload?.objectKey])

  const fetchUrl = useCallback(() => {
    if (!objectKeyRef.current) return

    downloadUrl.mutate(
      { reportId, objectKey: objectKeyRef.current },
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

  // Use initial download URL and schedule refresh based on its expiry
  useEffect(() => {
    mountedRef.current = true

    if (!enabled) return

    if (initialDownload?.downloadUrl && initialDownload.expiresAt) {
      setUrl(initialDownload.downloadUrl)
      // Schedule refresh before the initial URL expires
      const expiresAt = new Date(initialDownload.expiresAt).getTime()
      const now = Date.now()
      const refreshIn = Math.max(expiresAt - now - EXPIRY_BUFFER_MS, 0)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) fetchUrl()
      }, refreshIn)
    } else if (objectKeyRef.current) {
      fetchUrl()
    }

    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, enabled, initialDownload?.downloadUrl])

  return {
    url,
    isLoading: downloadUrl.isPending && url === null,
    error,
    refresh: fetchUrl,
  }
}
