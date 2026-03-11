import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/render'
import { ReceivedGrantCard } from './received-grant-card'
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

describe('ReceivedGrantCard', () => {
  it('renders patient sub identifier', () => {
    render(<ReceivedGrantCard grant={makeGrant()} />)
    expect(screen.getByTestId('received-grant-patient')).toHaveTextContent(
      'Patient: patient-abc-123',
    )
  })

  it('shows report count for specific reports', () => {
    render(<ReceivedGrantCard grant={makeGrant()} />)
    expect(screen.getByText('3 reports shared')).toBeInTheDocument()
  })

  it('shows singular report count', () => {
    render(<ReceivedGrantCard grant={makeGrant({ reportIds: ['r1'] })} />)
    expect(screen.getByText('1 report shared')).toBeInTheDocument()
  })

  it('shows "All reports" when allReports is true', () => {
    render(
      <ReceivedGrantCard grant={makeGrant({ allReports: true, reportIds: [] })} />,
    )
    expect(screen.getByText('All reports')).toBeInTheDocument()
  })

  it('shows Active badge for non-expiring grants', () => {
    render(<ReceivedGrantCard grant={makeGrant()} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('shows Expiring Soon badge for grants expiring within 7 days', () => {
    const expiring = makeGrant({
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    })
    render(<ReceivedGrantCard grant={expiring} />)
    expect(screen.getByText('Expiring Soon')).toBeInTheDocument()
  })

  it('shows Expired badge for past grants', () => {
    const expired = makeGrant({
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    })
    render(<ReceivedGrantCard grant={expired} />)
    expect(screen.getByText('Expired')).toBeInTheDocument()
  })

  it('shows Revoked badge for revoked grants', () => {
    const revoked = makeGrant({ revoked: true })
    render(<ReceivedGrantCard grant={revoked} />)
    expect(screen.getByText('Revoked')).toBeInTheDocument()
  })

  it('does not show a revoke button', () => {
    render(<ReceivedGrantCard grant={makeGrant()} />)
    expect(screen.queryByRole('button', { name: /revoke/i })).not.toBeInTheDocument()
  })

  it('displays purpose text when present', () => {
    render(<ReceivedGrantCard grant={makeGrant({ purpose: 'Blood test review' })} />)
    expect(screen.getByTestId('grant-purpose')).toHaveTextContent('Blood test review')
  })

  it('does not display purpose when empty', () => {
    render(<ReceivedGrantCard grant={makeGrant({ purpose: '' })} />)
    expect(screen.queryByTestId('grant-purpose')).not.toBeInTheDocument()
  })

  it('shows reduced opacity for revoked grants', () => {
    const revoked = makeGrant({ revoked: true })
    render(<ReceivedGrantCard grant={revoked} />)
    const card = screen.getByTestId('received-grant-card')
    expect(card).toHaveStyle({ opacity: '0.6' })
  })

  it('shows reduced opacity for expired grants', () => {
    const expired = makeGrant({
      expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    })
    render(<ReceivedGrantCard grant={expired} />)
    const card = screen.getByTestId('received-grant-card')
    expect(card).toHaveStyle({ opacity: '0.6' })
  })
})
