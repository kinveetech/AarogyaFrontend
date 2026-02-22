import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const FORWARDED_REQUEST_HEADERS = ['content-type', 'accept', 'if-none-match']
const FORWARDED_RESPONSE_HEADERS = ['content-type', 'etag', 'cache-control']

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const apiUrl = process.env.API_URL
  if (!apiUrl) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 },
    )
  }

  const token = await getToken({ req: request })

  if (!token || token.error === 'RefreshTokenError') {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    )
  }

  const { path } = await params
  const targetPath = path.join('/')
  const search = request.nextUrl.search
  const targetUrl = `${apiUrl}/${targetPath}${search}`

  const headers: HeadersInit = {
    Authorization: `Bearer ${token.accessToken}`,
  }

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value) {
      headers[name] = value
    }
  }

  const fetchInit: RequestInit = {
    method: request.method,
    headers,
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    fetchInit.body = await request.text()
  }

  const upstream = await fetch(targetUrl, fetchInit)

  const responseHeaders = new Headers()
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name)
    if (value) {
      responseHeaders.set(name, value)
    }
  }

  const body = await upstream.arrayBuffer()

  return new NextResponse(body.byteLength > 0 ? body : null, {
    status: upstream.status,
    headers: responseHeaders,
  })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const DELETE = proxyRequest
export const PATCH = proxyRequest
