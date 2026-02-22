import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/render'
import { StatusBadge } from './status-badge'

describe('StatusBadge', () => {
  it.each(['success', 'warning', 'error', 'info', 'pending'] as const)(
    'renders %s variant with correct text',
    (variant) => {
      render(<StatusBadge variant={variant}>Label</StatusBadge>)
      expect(screen.getByText('Label')).toBeInTheDocument()
    },
  )

  it('shows dot by default for non-pending variants', () => {
    render(<StatusBadge variant="success">Active</StatusBadge>)
    expect(screen.getByTestId('status-dot')).toBeInTheDocument()
  })

  it('hides dot by default for pending variant', () => {
    render(<StatusBadge variant="pending">Pending</StatusBadge>)
    expect(screen.queryByTestId('status-dot')).not.toBeInTheDocument()
  })

  it('hides dot when showDot is false', () => {
    render(
      <StatusBadge variant="success" showDot={false}>
        Active
      </StatusBadge>,
    )
    expect(screen.queryByTestId('status-dot')).not.toBeInTheDocument()
  })

  it('shows dot when showDot is true on pending', () => {
    render(
      <StatusBadge variant="pending" showDot>
        Pending
      </StatusBadge>,
    )
    expect(screen.getByTestId('status-dot')).toBeInTheDocument()
  })

  it('renders as a span element', () => {
    render(<StatusBadge variant="info">Info</StatusBadge>)
    const badge = screen.getByText('Info').closest('span')
    expect(badge).toBeInTheDocument()
    expect(badge?.tagName).toBe('SPAN')
  })
})
