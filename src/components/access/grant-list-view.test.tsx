import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/render'
import { GrantListView } from './grant-list-view'
import type { AccessGrant } from '@/types/access'

const shieldIcon = <svg data-testid="shield-icon" />

function makeGrant(overrides: Partial<AccessGrant> = {}): AccessGrant {
  return {
    grantId: 'g1',
    patientSub: 'p1',
    doctorSub: 'd1',
    doctorName: 'Dr. Priya Sharma',
    allReports: false,
    reportIds: ['r1'],
    purpose: 'Follow-up',
    startsAt: '2025-01-01T00:00:00Z',
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    revoked: false,
    createdAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

const activeGrant = makeGrant({ grantId: 'g1' })
const expiredGrant = makeGrant({
  grantId: 'g2',
  expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
})
const revokedGrant = makeGrant({ grantId: 'g3', revoked: true })

describe('GrantListView', () => {
  it('shows loading skeletons when loading', () => {
    render(
      <GrantListView
        grants={[]}
        isLoading={true}
        variant="granted"
        emptyIcon={shieldIcon}
        emptyTitle="No grants"
        emptyDescription="No description"
        loadingTestId="test-loading"
      />,
    )
    expect(screen.getByTestId('test-loading')).toBeInTheDocument()
  })

  it('shows empty state when no grants and not loading', () => {
    render(
      <GrantListView
        grants={[]}
        isLoading={false}
        variant="granted"
        emptyIcon={shieldIcon}
        emptyTitle="No grants"
        emptyDescription="Create a grant to get started"
      />,
    )
    expect(screen.getByText('No grants')).toBeInTheDocument()
    expect(screen.getByText('Create a grant to get started')).toBeInTheDocument()
  })

  it('shows empty action button when provided', () => {
    const onClick = vi.fn()
    render(
      <GrantListView
        grants={[]}
        isLoading={false}
        variant="granted"
        emptyIcon={shieldIcon}
        emptyTitle="No grants"
        emptyDescription="desc"
        emptyAction={{ label: 'Create Grant', onClick }}
      />,
    )
    expect(screen.getByRole('button', { name: 'Create Grant' })).toBeInTheDocument()
  })

  it('renders active and inactive sections', () => {
    render(
      <GrantListView
        grants={[activeGrant, expiredGrant, revokedGrant]}
        isLoading={false}
        variant="granted"
        emptyIcon={shieldIcon}
        emptyTitle="No grants"
        emptyDescription="desc"
        onRevoke={vi.fn()}
      />,
    )
    expect(screen.getByText('Active Grants')).toBeInTheDocument()
    expect(screen.getByText('Inactive Grants')).toBeInTheDocument()
  })

  it('renders only active section when no inactive grants', () => {
    render(
      <GrantListView
        grants={[activeGrant]}
        isLoading={false}
        variant="granted"
        emptyIcon={shieldIcon}
        emptyTitle="No grants"
        emptyDescription="desc"
        onRevoke={vi.fn()}
      />,
    )
    expect(screen.getByText('Active Grants')).toBeInTheDocument()
    expect(screen.queryByText('Inactive Grants')).not.toBeInTheDocument()
  })

  it('renders only inactive section when no active grants', () => {
    render(
      <GrantListView
        grants={[expiredGrant]}
        isLoading={false}
        variant="granted"
        emptyIcon={shieldIcon}
        emptyTitle="No grants"
        emptyDescription="desc"
      />,
    )
    expect(screen.queryByText('Active Grants')).not.toBeInTheDocument()
    expect(screen.getByText('Inactive Grants')).toBeInTheDocument()
  })

  it('passes variant to grant cards', () => {
    render(
      <GrantListView
        grants={[activeGrant]}
        isLoading={false}
        variant="received"
        emptyIcon={shieldIcon}
        emptyTitle="No grants"
        emptyDescription="desc"
      />,
    )
    expect(screen.getByTestId('received-grant-card')).toBeInTheDocument()
  })

  it('does not show empty state while loading', () => {
    render(
      <GrantListView
        grants={[]}
        isLoading={true}
        variant="granted"
        emptyIcon={shieldIcon}
        emptyTitle="No grants"
        emptyDescription="desc"
      />,
    )
    expect(screen.queryByText('No grants')).not.toBeInTheDocument()
  })
})
