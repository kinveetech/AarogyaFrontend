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
  const initialUrl = initialDownload?.downloadUrl ?? null
  const [refreshedUrl, setRefreshedUrl] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const objectKeyRef = useRef(initialDownload?.objectKey ?? '')

  // Adopt a new initial URL when the prop changes (React-recommended pattern
  // for adjusting state when props change — avoids setState inside an effect)
  const [prevInitialUrl, setPrevInitialUrl] = useState(initialUrl)
  if (initialUrl !== prevInitialUrl) {
    setPrevInitialUrl(initialUrl)
    if (initialUrl) setRefreshedUrl(null)
  }

  // The current URL: a refreshed one wins over the (older) initial one
  const url = refreshedUrl ?? initialUrl

  // Update objectKey when initialDownload changes
  useEffect(() => {
    if (initialDownload?.objectKey) {
      objectKeyRef.current = initialDownload.objectKey
    }
  }, [initialDownload?.objectKey])

  const fetchUrl = useCallback(() => {
    const run = () => {
      if (!objectKeyRef.current) return

      downloadUrl.mutate(
        { reportId, objectKey: objectKeyRef.current },
        {
          onSuccess: (res) => {
            if (!mountedRef.current) return
            setRefreshedUrl(res.downloadUrl)
            setError(null)

            // Schedule auto-refresh before expiry
            const expiresAt = new Date(res.expiresAt).getTime()
            const now = Date.now()
            const refreshIn = Math.max(expiresAt - now - EXPIRY_BUFFER_MS, 0)

            if (timerRef.current) clearTimeout(timerRef.current)
            timerRef.current = setTimeout(() => {
              if (mountedRef.current) run()
            }, refreshIn)
          },
          onError: (err) => {
            if (!mountedRef.current) return
            setError(err)
          },
        },
      )
    }

    run()
  }, [downloadUrl, reportId])

  // Schedule a refresh based on the initial URL's expiry, or fetch immediately
  // when no initial URL was provided
  useEffect(() => {
    mountedRef.current = true

    if (!enabled) return

    if (initialDownload?.downloadUrl && initialDownload.expiresAt) {
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
