import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { axe } from 'vitest-axe'
import { ConfirmDialog } from './confirm-dialog'

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: 'Delete Report',
    message: 'Are you sure you want to delete this report?',
  }

  it('does not render content when closed', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />)
    expect(screen.queryByText('Delete Report')).not.toBeInTheDocument()
  })

  it('renders title and message when open', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByText('Delete Report')).toBeInTheDocument()
    expect(
      screen.getByText('Are you sure you want to delete this report?'),
    ).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<ConfirmDialog {...defaultProps} subtitle="This cannot be undone" />)
    expect(screen.getByText('This cannot be undone')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />)
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = vi.fn()
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('disables confirm button when loading', () => {
    render(<ConfirmDialog {...defaultProps} loading />)
    // Chakra's loading state hides button text, so find by disabled buttons
    const buttons = screen.getAllByRole('button')
    const disabledButtons = buttons.filter((b) => b.hasAttribute('disabled'))
    expect(disabledButtons).toHaveLength(1)
    expect(disabledButtons[0]).toHaveAttribute('data-loading')
  })

  it('renders custom labels', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="Yes, delete"
        cancelLabel="No, keep"
      />,
    )
    expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'No, keep' })).toBeInTheDocument()
  })

  it('has alertdialog role', () => {
    render(<ConfirmDialog {...defaultProps} />)
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  })

  it('has aria-describedby linking to body', () => {
    render(<ConfirmDialog {...defaultProps} />)
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAttribute('aria-describedby', expect.stringContaining('confirm-dialog-body'))
  })

  it('renders destructive variant with coral styling', () => {
    render(<ConfirmDialog {...defaultProps} destructive confirmLabel="Delete" />)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('renders without subtitle when omitted', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} />)
    // Only title should be present, no subtitle text
    const header = container.querySelector('.chakra-dialog__header')
    expect(header).toBeInTheDocument()
    expect(screen.queryByText('This cannot be undone')).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ConfirmDialog {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
