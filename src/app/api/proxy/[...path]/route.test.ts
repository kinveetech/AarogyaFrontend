import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockGetToken = vi.fn()
vi.mock('next-auth/jwt', () => ({
  getToken: (...args: unknown[]) => mockGetToken(...args),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { GET, POST, PUT, DELETE, PATCH } from './route'

function makeRequest(
  path: string,
  options: { method?: string; body?: string; headers?: Record<string, string> } = {},
): NextRequest {
  const url = `http://localhost:3000/api/proxy/${path}`
  return new NextRequest(url, {
    method: options.method ?? 'GET',
    body: options.body,
    headers: options.headers,
  })
}

function makeParams(path: string) {
  return Promise.resolve({ path: path.split('/') })
}

beforeEach(() => {
  mockGetToken.mockReset()
  mockFetch.mockReset()
  vi.stubEnv('API_URL', 'https://api.example.com')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('BFF proxy route', () => {
  it('forwards GET with Bearer token and returns response', async () => {
    mockGetToken.mockResolvedValue({
      accessToken: 'at-123',
      refreshToken: 'rt-456',
    })
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ items: [1, 2] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const request = makeRequest('v1/reports')
    const response = await GET(request, { params: makeParams('v1/reports') })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ items: [1, 2] })
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/reports',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer at-123',
        }),
      }),
    )
  })

  it('forwards POST with JSON body', async () => {
    mockGetToken.mockResolvedValue({ accessToken: 'at-123' })
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ id: 'new-1' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const body = JSON.stringify({ title: 'Report' })
    const request = makeRequest('v1/reports', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(request, { params: makeParams('v1/reports') })

    expect(response.status).toBe(201)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/reports',
      expect.objectContaining({
        method: 'POST',
        body,
        headers: expect.objectContaining({
          'content-type': 'application/json',
        }),
      }),
    )
  })

  it('returns 401 when no session', async () => {
    mockGetToken.mockResolvedValue(null)

    const request = makeRequest('v1/reports')
    const response = await GET(request, { params: makeParams('v1/reports') })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Authentication required' })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns 401 when token has RefreshTokenError', async () => {
    mockGetToken.mockResolvedValue({
      accessToken: 'expired',
      error: 'RefreshTokenError',
    })

    const request = makeRequest('v1/reports')
    const response = await GET(request, { params: makeParams('v1/reports') })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Authentication required' })
  })

  it('forwards query parameters to backend', async () => {
    mockGetToken.mockResolvedValue({ accessToken: 'at-123' })
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const request = new NextRequest(
      'http://localhost:3000/api/proxy/v1/reports?page=2&limit=10',
    )
    const response = await GET(request, { params: makeParams('v1/reports') })

    expect(response.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/reports?page=2&limit=10',
      expect.any(Object),
    )
  })

  it('passes through backend 4xx/5xx errors', async () => {
    mockGetToken.mockResolvedValue({ accessToken: 'at-123' })
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ message: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const request = makeRequest('v1/reports/999')
    const response = await GET(request, { params: makeParams('v1/reports/999') })

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ message: 'Not found' })
  })

  it('returns 500 when API_URL is missing', async () => {
    vi.stubEnv('API_URL', '')
    mockGetToken.mockResolvedValue({ accessToken: 'at-123' })

    const request = makeRequest('v1/reports')
    const response = await GET(request, { params: makeParams('v1/reports') })

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: 'Server configuration error' })
  })

  it('forwards ETag and If-None-Match headers', async () => {
    mockGetToken.mockResolvedValue({ accessToken: 'at-123' })
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ETag: '"abc123"',
          'Cache-Control': 'private, max-age=0',
        },
      }),
    )

    const request = makeRequest('v1/reports', {
      headers: { 'If-None-Match': '"abc123"' },
    })
    const response = await GET(request, { params: makeParams('v1/reports') })

    // Verify If-None-Match was forwarded to backend
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'if-none-match': '"abc123"',
        }),
      }),
    )

    // Verify ETag and Cache-Control are in the response
    expect(response.headers.get('etag')).toBe('"abc123"')
    expect(response.headers.get('cache-control')).toBe('private, max-age=0')
  })

  it('exports all HTTP method handlers', () => {
    expect(typeof GET).toBe('function')
    expect(typeof POST).toBe('function')
    expect(typeof PUT).toBe('function')
    expect(typeof DELETE).toBe('function')
    expect(typeof PATCH).toBe('function')
  })
})
