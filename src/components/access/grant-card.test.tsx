import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/render'
import { GrantCard } from './grant-card'
import type { AccessGrant } from '@/types/access'

function makeGrant(overrides: Partial<AccessGrant> = {}): AccessGrant {
  return {
    grantId: 'g1',
    patientSub: 'patient-abc-123',
    doctorSub: 'd1',
    doctorName: 'Dr. Priya Sharma',
    allReports: false,
    reportIds: ['r1', 'r2', 'r3'],
    purpose: 'Follow-up consultation',
    startsAt: '2025-01-01T00:00:00Z',
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    revoked: false,
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('GrantCard — granted variant (default)', () => {
  it('renders doctor name and initials', () => {
    render(<GrantCard grant={makeGrant()} onRevoke={vi.fn()} />)
    expect(screen.getByText('Dr. Priya Sharma')).toBeInTheDocument()
    expect(screen.getByText('DP')).toBeInTheDocument()
  })

  it('shows report count for specific reports', () => {
    render(<GrantCard grant={makeGrant()} onRevoke={vi.fn()} />)
    expect(screen.getByText('3 reports shared')).toBeInTheDocument()
  })

  it('shows singular report count', () => {
    render(
      <GrantCard grant={makeGrant({ reportIds: ['r1'] })} onRevoke={vi.fn()} />,
    )
    expect(screen.getByText('1 report shared')).toBeInTheDocument()
  })

  it('shows "All reports" when allReports is true', () => {
    render(
      <GrantCard
        grant={makeGrant({ allReports: true, reportIds: [] })}
        onRevoke={vi.fn()}
      />,
    )
    expect(screen.getByText('All reports')).toBeInTheDocument()
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

  it('shows Revoked badge for revoked grants', () => {
    const revoked = makeGrant({ revoked: true })
    render(<GrantCard grant={revoked} onRevoke={vi.fn()} />)
    expect(screen.getByText('Revoked')).toBeInTheDocument()
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

  it('hides revoke button for revoked grants', () => {
    const revoked = makeGrant({ revoked: true })
    render(<GrantCard grant={revoked} onRevoke={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /revoke/i })).not.toBeInTheDocument()
  })

  it('calls onRevoke with grantId when revoke is clicked', async () => {
    const onRevoke = vi.fn()
    const { userEvent } = await import('@/test/render')
    render(<GrantCard grant={makeGrant()} onRevoke={onRevoke} />)
    await userEvent.click(
      screen.getByRole('button', { name: /revoke access for dr\. priya sharma/i }),
    )
    expect(onRevoke).toHaveBeenCalledWith('g1')
  })

  it('displays purpose text when present', () => {
    render(<GrantCard grant={makeGrant({ purpose: 'Blood test review' })} onRevoke={vi.fn()} />)
    expect(screen.getByTestId('grant-purpose')).toHaveTextContent('Blood test review')
  })

  it('does not display purpose when empty', () => {
    render(<GrantCard grant={makeGrant({ purpose: '' })} onRevoke={vi.fn()} />)
    expect(screen.queryByTestId('grant-purpose')).not.toBeInTheDocument()
  })

  it('shows reduced opacity for revoked grants', () => {
    const revoked = makeGrant({ revoked: true })
    render(<GrantCard grant={revoked} onRevoke={vi.fn()} />)
    const card = screen.getByTestId('grant-card')
    expect(card).toHaveStyle({ opacity: '0.6' })
  })

  it('shows reduced opacity for expired grants', () => {
    const expired = makeGrant({
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    })
    render(<GrantCard grant={expired} onRevoke={vi.fn()} />)
    const card = screen.getByTestId('grant-card')
    expect(card).toHaveStyle({ opacity: '0.6' })
  })

  it('uses grant-card test id for default variant', () => {
    render(<GrantCard grant={makeGrant()} onRevoke={vi.fn()} />)
    expect(screen.getByTestId('grant-card')).toBeInTheDocument()
  })
})

describe('GrantCard — received variant', () => {
  it('renders patient sub identifier', () => {
    render(<GrantCard grant={makeGrant()} variant="received" />)
    expect(screen.getByTestId('received-grant-patient')).toHaveTextContent(
      'Patient: patient-abc-123',
    )
  })

  it('uses received-grant-card test id', () => {
    render(<GrantCard grant={makeGrant()} variant="received" />)
    expect(screen.getByTestId('received-grant-card')).toBeInTheDocument()
  })

  it('does not show a revoke button even for active grants', () => {
    render(<GrantCard grant={makeGrant()} variant="received" />)
    expect(screen.queryByRole('button', { name: /revoke/i })).not.toBeInTheDocument()
  })

  it('shows report count for specific reports', () => {
    render(<GrantCard grant={makeGrant()} variant="received" />)
    expect(screen.getByText('3 reports shared')).toBeInTheDocument()
  })

  it('shows "All reports" when allReports is true', () => {
    render(
      <GrantCard grant={makeGrant({ allReports: true, reportIds: [] })} variant="received" />,
    )
    expect(screen.getByText('All reports')).toBeInTheDocument()
  })

  it('shows Active badge for non-expiring grants', () => {
    render(<GrantCard grant={makeGrant()} variant="received" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows Expired badge for past grants', () => {
    const expired = makeGrant({
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    })
    render(<GrantCard grant={expired} variant="received" />)
    expect(screen.getByText('Expired')).toBeInTheDocument()
  })

  it('shows Revoked badge for revoked grants', () => {
    const revoked = makeGrant({ revoked: true })
    render(<GrantCard grant={revoked} variant="received" />)
    expect(screen.getByText('Revoked')).toBeInTheDocument()
  })

  it('displays purpose text when present', () => {
    render(<GrantCard grant={makeGrant({ purpose: 'Blood test review' })} variant="received" />)
    expect(screen.getByTestId('grant-purpose')).toHaveTextContent('Blood test review')
  })

  it('shows reduced opacity for revoked grants', () => {
    const revoked = makeGrant({ revoked: true })
    render(<GrantCard grant={revoked} variant="received" />)
    const card = screen.getByTestId('received-grant-card')
    expect(card).toHaveStyle({ opacity: '0.6' })
  })

  it('shows reduced opacity for expired grants', () => {
    const expired = makeGrant({
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    })
    render(<GrantCard grant={expired} variant="received" />)
    const card = screen.getByTestId('received-grant-card')
    expect(card).toHaveStyle({ opacity: '0.6' })
  })
})
