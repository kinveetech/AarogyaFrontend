import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/render'
import { GrantCard } from './grant-card'
import type { AccessGrant } from '@/types/access'

function makeGrant(overrides: Partial<AccessGrant> = {}): AccessGrant {
  return {
    id: 'g1',
    doctorId: 'd1',
    doctorName: 'Dr. Priya Sharma',
    reportIds: ['r1', 'r2', 'r3'],
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('GrantCard', () => {
  it('renders doctor name and initials', () => {
    render(<GrantCard grant={makeGrant()} onRevoke={vi.fn()} />)
    expect(screen.getByText('Dr. Priya Sharma')).toBeInTheDocument()
    expect(screen.getByText('DP')).toBeInTheDocument()
  })

  it('shows report count', () => {
    render(<GrantCard grant={makeGrant()} onRevoke={vi.fn()} />)
    expect(screen.getByText('3 reports shared')).toBeInTheDocument()
  })

  it('shows singular report count', () => {
    render(
      <GrantCard grant={makeGrant({ reportIds: ['r1'] })} onRevoke={vi.fn()} />,
    )
    expect(screen.getByText('1 report shared')).toBeInTheDocument()
  })

  it('shows Active badge for non-expiring grants', () => {
    render(<GrantCard grant={makeGrant()} onRevoke={vi.fn()} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows Expiring Soon badge for grants expiring within 7 days', () => {
    const expiring = makeGrant({
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    })
    render(<GrantCard grant={expiring} onRevoke={vi.fn()} />)
    expect(screen.getByText('Expiring Soon')).toBeInTheDocument()
  })

  it('shows Expired badge for past grants', () => {
    const expired = makeGrant({
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    })
    render(<GrantCard grant={expired} onRevoke={vi.fn()} />)
    expect(screen.getByText('Expired')).toBeInTheDocument()
  })

  it('shows revoke button for active grants', () => {
    render(<GrantCard grant={makeGrant()} onRevoke={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: /revoke access for dr\. priya sharma/i }),
    ).toBeInTheDocument()
  })

  it('hides revoke button for expired grants', () => {
    const expired = makeGrant({
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    })
    render(<GrantCard grant={expired} onRevoke={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /revoke/i })).not.toBeInTheDocument()
  })

  it('calls onRevoke with grant id when revoke is clicked', async () => {
    const onRevoke = vi.fn()
    const { userEvent } = await import('@/test/render')
    render(<GrantCard grant={makeGrant()} onRevoke={onRevoke} />)
    await userEvent.click(
      screen.getByRole('button', { name: /revoke access for dr\. priya sharma/i }),
    )
    expect(onRevoke).toHaveBeenCalledWith('g1')
  })
})
