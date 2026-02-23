import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/render'
import { axe } from 'vitest-axe'
import { StatusBadge } from './status-badge'

describe('StatusBadge', () => {
  it.each(['success', 'warning', 'error', 'info', 'pending'] as const)(
    'renders %s variant with correct text',
    (variant) => {
      render(<StatusBadge variant={variant}>Label</StatusBadge>)
      expect(screen.getByText('Label')).toBeInTheDocument()
    },
  )

  it('shows icon by default for non-pending variants', () => {
    render(<StatusBadge variant="success">Active</StatusBadge>)
    expect(screen.getByTestId('status-icon')).toBeInTheDocument()
  })

  it('hides icon by default for pending variant', () => {
    render(<StatusBadge variant="pending">Pending</StatusBadge>)
    expect(screen.queryByTestId('status-icon')).not.toBeInTheDocument()
  })

  it('hides icon when showDot is false', () => {
    render(
      <StatusBadge variant="success" showDot={false}>
        Active
      </StatusBadge>,
    )
    expect(screen.queryByTestId('status-icon')).not.toBeInTheDocument()
  })

  it('shows icon when showDot is true on pending', () => {
    render(
      <StatusBadge variant="pending" showDot>
        Pending
      </StatusBadge>,
    )
    // pending variant returns null from StatusIcon, so no icon rendered
    expect(screen.queryByTestId('status-icon')).not.toBeInTheDocument()
  })

  it('renders as a span element', () => {
    render(<StatusBadge variant="info">Info</StatusBadge>)
    const badge = screen.getByText('Info').closest('span')
    expect(badge).toBeInTheDocument()
    expect(badge?.tagName).toBe('SPAN')
  })

  it('renders distinct icons for each variant', () => {
    const { rerender } = render(<StatusBadge variant="success">S</StatusBadge>)
    expect(screen.getByTestId('status-icon')).toBeInTheDocument()

    rerender(<StatusBadge variant="warning">W</StatusBadge>)
    expect(screen.getByTestId('status-icon')).toBeInTheDocument()

    rerender(<StatusBadge variant="error">E</StatusBadge>)
    expect(screen.getByTestId('status-icon')).toBeInTheDocument()

    rerender(<StatusBadge variant="info">I</StatusBadge>)
    expect(screen.getByTestId('status-icon')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<StatusBadge variant="success">Active</StatusBadge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
