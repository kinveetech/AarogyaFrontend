'use client'

import { useState, useCallback, useRef } from 'react'

export type S3UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export interface S3UploadState {
  progress: number
  status: S3UploadStatus
  error: string | null
}

export interface UseS3UploadReturn extends S3UploadState {
  upload: (url: string, file: File) => Promise<void>
  abort: () => void
  reset: () => void
}

const INITIAL_STATE: S3UploadState = {
  progress: 0,
  status: 'idle',
  error: null,
}

export function useS3Upload(): UseS3UploadReturn {
  const [state, setState] = useState<S3UploadState>(INITIAL_STATE)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const upload = useCallback(async (url: string, file: File): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhrRef.current = xhr

      setState({ progress: 0, status: 'uploading', error: null })

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setState((prev) => ({ ...prev, progress: percent }))
        }
      }

      xhr.onload = () => {
        xhrRef.current = null
        if (xhr.status >= 200 && xhr.status < 300) {
          setState({ progress: 100, status: 'success', error: null })
          resolve()
        } else {
          const errorMsg = `Upload failed with status ${xhr.status}`
          setState({ progress: 0, status: 'error', error: errorMsg })
          reject(new Error(errorMsg))
        }
      }

      xhr.onerror = () => {
        xhrRef.current = null
        const errorMsg = 'Upload failed due to a network error'
        setState({ progress: 0, status: 'error', error: errorMsg })
        reject(new Error(errorMsg))
      }

      xhr.onabort = () => {
        xhrRef.current = null
        setState(INITIAL_STATE)
        reject(new Error('Upload aborted'))
      }

      xhr.open('PUT', url)
      xhr.setRequestHeader('Content-Type', file.type)
      xhr.send(file)
    })
  }, [])

  const abort = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort()
      xhrRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    abort()
    setState(INITIAL_STATE)
  }, [abort])

  return { ...state, upload, abort, reset }
}
