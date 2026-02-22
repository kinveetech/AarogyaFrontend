import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@/test/render'
import { act } from '@testing-library/react'
import { useS3Upload } from './use-s3-upload'

type EventHandler = ((event: Partial<ProgressEvent>) => void) | null

class MockXMLHttpRequest {
  static instances: MockXMLHttpRequest[] = []

  status = 0
  upload = {
    onprogress: null as EventHandler,
  }
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  onabort: (() => void) | null = null

  openMethod = ''
  openUrl = ''
  headers: Record<string, string> = {}
  sentBody: unknown = null
  aborted = false

  constructor() {
    MockXMLHttpRequest.instances.push(this)
  }

  open(method: string, url: string) {
    this.openMethod = method
    this.openUrl = url
  }

  setRequestHeader(key: string, value: string) {
    this.headers[key] = value
  }

  send(body: unknown) {
    this.sentBody = body
  }

  abort() {
    this.aborted = true
    this.onabort?.()
  }
}

beforeEach(() => {
  MockXMLHttpRequest.instances = []
  vi.stubGlobal('XMLHttpRequest', MockXMLHttpRequest)
})

function createTestFile(name = 'test.pdf', type = 'application/pdf', size = 1024) {
  return new File([new ArrayBuffer(size)], name, { type })
}

describe('useS3Upload', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useS3Upload())
    expect(result.current.status).toBe('idle')
    expect(result.current.progress).toBe(0)
    expect(result.current.error).toBeNull()
  })

  it('sends PUT request with correct URL and content type', async () => {
    const { result } = renderHook(() => useS3Upload())
    const file = createTestFile()

    await act(async () => {
      const promise = result.current.upload('https://s3.example.com/presigned', file)
      const xhr = MockXMLHttpRequest.instances[0]

      expect(xhr.openMethod).toBe('PUT')
      expect(xhr.openUrl).toBe('https://s3.example.com/presigned')
      expect(xhr.headers['Content-Type']).toBe('application/pdf')
      expect(xhr.sentBody).toBe(file)

      xhr.status = 200
      xhr.onload?.()
      await promise
    })
  })

  it('sets uploading status when upload starts', async () => {
    const { result } = renderHook(() => useS3Upload())
    const file = createTestFile()

    let promise: Promise<void>
    act(() => {
      promise = result.current.upload('https://s3.example.com/presigned', file)
    })

    expect(result.current.status).toBe('uploading')

    await act(async () => {
      const xhr = MockXMLHttpRequest.instances[0]
      xhr.status = 200
      xhr.onload?.()
      await promise!
    })
  })

  it('tracks upload progress', async () => {
    const { result } = renderHook(() => useS3Upload())
    const file = createTestFile()

    let promise: Promise<void>
    act(() => {
      promise = result.current.upload('https://s3.example.com/presigned', file)
    })

    const xhr = MockXMLHttpRequest.instances[0]

    act(() => {
      xhr.upload.onprogress?.({ lengthComputable: true, loaded: 500, total: 1000 })
    })
    expect(result.current.progress).toBe(50)

    act(() => {
      xhr.upload.onprogress?.({ lengthComputable: true, loaded: 1000, total: 1000 })
    })
    expect(result.current.progress).toBe(100)

    await act(async () => {
      xhr.status = 200
      xhr.onload?.()
      await promise!
    })
  })

  it('ignores progress events without lengthComputable', async () => {
    const { result } = renderHook(() => useS3Upload())
    const file = createTestFile()

    await act(async () => {
      const promise = result.current.upload('https://s3.example.com/presigned', file)
      const xhr = MockXMLHttpRequest.instances[0]

      await act(async () => {
        xhr.upload.onprogress?.({ lengthComputable: false, loaded: 0, total: 0 })
      })
      expect(result.current.progress).toBe(0)

      xhr.status = 200
      xhr.onload?.()
      await promise
    })
  })

  it('sets success status on successful upload', async () => {
    const { result } = renderHook(() => useS3Upload())
    const file = createTestFile()

    await act(async () => {
      const promise = result.current.upload('https://s3.example.com/presigned', file)
      const xhr = MockXMLHttpRequest.instances[0]
      xhr.status = 200
      xhr.onload?.()
      await promise
    })

    expect(result.current.status).toBe('success')
    expect(result.current.progress).toBe(100)
    expect(result.current.error).toBeNull()
  })

  it('sets error status on HTTP error', async () => {
    const { result } = renderHook(() => useS3Upload())
    const file = createTestFile()

    await act(async () => {
      const promise = result.current.upload('https://s3.example.com/presigned', file)
      const xhr = MockXMLHttpRequest.instances[0]
      xhr.status = 403
      xhr.onload?.()
      await promise.catch(() => {})
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Upload failed with status 403')
  })

  it('sets error status on network error', async () => {
    const { result } = renderHook(() => useS3Upload())
    const file = createTestFile()

    await act(async () => {
      const promise = result.current.upload('https://s3.example.com/presigned', file)
      const xhr = MockXMLHttpRequest.instances[0]
      xhr.onerror?.()
      await promise.catch(() => {})
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Upload failed due to a network error')
  })

  it('aborts ongoing upload', async () => {
    const { result } = renderHook(() => useS3Upload())
    const file = createTestFile()

    await act(async () => {
      const promise = result.current.upload('https://s3.example.com/presigned', file)
      const xhr = MockXMLHttpRequest.instances[0]

      result.current.abort()
      expect(xhr.aborted).toBe(true)
      await promise.catch(() => {})
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.progress).toBe(0)
  })

  it('resets state to idle', async () => {
    const { result } = renderHook(() => useS3Upload())
    const file = createTestFile()

    await act(async () => {
      const promise = result.current.upload('https://s3.example.com/presigned', file)
      const xhr = MockXMLHttpRequest.instances[0]
      xhr.status = 403
      xhr.onload?.()
      await promise.catch(() => {})
    })

    expect(result.current.status).toBe('error')

    act(() => {
      result.current.reset()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.progress).toBe(0)
    expect(result.current.error).toBeNull()
  })
})
