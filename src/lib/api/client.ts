const etagCache = new Map<string, { etag: string; data: unknown }>()

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  onRequest?: (url: string, init: RequestInit) => RequestInit
  onResponse?: (response: Response) => void
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? '/api/proxy'
  const url = `${baseUrl}${path}`

  const { body, onRequest, onResponse, ...init } = options

  let requestInit: RequestInit = {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  }

  if (body !== undefined) {
    requestInit.body = JSON.stringify(body)
  }

  const cached = etagCache.get(url)
  if (cached && requestInit.method === undefined) {
    requestInit.headers = {
      ...requestInit.headers,
      'If-None-Match': cached.etag,
    }
  }

  if (onRequest) {
    requestInit = onRequest(url, requestInit)
  }

  let response: Response
  try {
    response = await fetch(url, requestInit)
  } catch {
    throw new ApiError(0, 'Network error')
  }

  if (onResponse) {
    onResponse(response)
  }

  if (response.status === 304 && cached) {
    return cached.data as T
  }

  if (!response.ok) {
    let message = response.statusText
    let code: string | undefined
    try {
      const errorBody = await response.json()
      message = errorBody.message ?? message
      code = errorBody.code
    } catch {
      // use statusText
    }
    throw new ApiError(response.status, message, code)
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T
  }

  const data: T = await response.json()

  const etag = response.headers.get('ETag')
  if (etag) {
    etagCache.set(url, { etag, data })
  }

  return data
}

/** Clear the ETag cache — useful in tests */
export function clearEtagCache() {
  etagCache.clear()
}
