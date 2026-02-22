import { NextResponse } from 'next/server'

// Placeholder — NextAuth.js will be configured in a later issue
export function GET() {
  return NextResponse.json({ message: 'Auth not configured' }, { status: 501 })
}

export function POST() {
  return NextResponse.json({ message: 'Auth not configured' }, { status: 501 })
}
