import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiFetch, ApiError, clearEtagCache } from './client'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

beforeEach(() => {
  mockFetch.mockReset()
  clearEtagCache()
})

describe('apiFetch', () => {
  it('fetches JSON successfully', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ id: 1, name: 'test' }))

    const result = await apiFetch<{ id: number; name: string }>('/v1/reports')

    expect(result).toEqual({ id: 1, name: 'test' })
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/reports',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      }),
    )
  })

  it('uses NEXT_PUBLIC_API_URL when set', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com')
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }))

    await apiFetch('/v1/test')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/test',
      expect.any(Object),
    )
    vi.unstubAllEnvs()
  })

  it('sends JSON body', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ created: true }))

    await apiFetch('/v1/reports', {
      method: 'POST',
      body: { title: 'Report' },
    })

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/reports',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Report' }),
      }),
    )
  })

  it('throws ApiError on 401', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Unauthorized', code: 'AUTH_REQUIRED' }, 401),
    )

    const error = await apiFetch('/v1/reports').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 401,
      message: 'Unauthorized',
      code: 'AUTH_REQUIRED',
    })
  })

  it('throws ApiError on 403', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Forbidden' }, 403),
    )

    const error = await apiFetch('/v1/reports').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 403, message: 'Forbidden' })
  })

  it('throws ApiError on 404', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Not found' }, 404),
    )

    const error = await apiFetch('/v1/reports/999').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404, message: 'Not found' })
  })

  it('throws ApiError on 500', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ message: 'Internal server error' }, 500),
    )

    const error = await apiFetch('/v1/reports').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 500, message: 'Internal server error' })
  })

  it('falls back to statusText when error body has no message field', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ error: 'something' }, 422),
    )

    const error = await apiFetch('/v1/reports').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 422, message: 'Error' })
  })

  it('throws ApiError with statusText when body is not JSON', async () => {
    mockFetch.mockResolvedValue(
      new Response('Not Found', { status: 404, statusText: 'Not Found' }),
    )

    await expect(apiFetch('/v1/missing')).rejects.toMatchObject({
      status: 404,
      message: 'Not Found',
    })
  })

  it('throws ApiError on network error', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(apiFetch('/v1/reports')).rejects.toThrow(ApiError)
    await expect(apiFetch('/v1/reports')).rejects.toMatchObject({
      status: 0,
      message: 'Network error',
    })
  })

  it('stores and sends ETags for cached responses', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ items: [1] }, 200, { ETag: '"abc123"' }),
    )

    const first = await apiFetch('/v1/reports')
    expect(first).toEqual({ items: [1] })

    mockFetch.mockResolvedValueOnce(
      new Response(null, { status: 304, statusText: 'Not Modified' }),
    )

    const second = await apiFetch('/v1/reports')
    expect(second).toEqual({ items: [1] })

    const secondCallInit = mockFetch.mock.calls[1][1]
    expect(secondCallInit.headers['If-None-Match']).toBe('"abc123"')
  })

  it('does not send ETag for non-GET requests', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ items: [1] }, 200, { ETag: '"abc123"' }),
    )
    await apiFetch('/v1/reports')

    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }))
    await apiFetch('/v1/reports', { method: 'POST', body: {} })

    const secondCallInit = mockFetch.mock.calls[1][1]
    expect(secondCallInit.headers['If-None-Match']).toBeUndefined()
  })

  it('calls onRequest interceptor', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }))

    const onRequest = vi.fn((_url: string, init: RequestInit) => ({
      ...init,
      headers: { ...init.headers, 'X-Custom': 'value' },
    }))

    await apiFetch('/v1/test', { onRequest })

    expect(onRequest).toHaveBeenCalledOnce()
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/v1/test',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Custom': 'value' }),
      }),
    )
  })

  it('calls onResponse interceptor', async () => {
    const res = jsonResponse({ ok: true })
    mockFetch.mockResolvedValue(res)

    const onResponse = vi.fn()
    await apiFetch('/v1/test', { onResponse })

    expect(onResponse).toHaveBeenCalledWith(res)
  })
})
