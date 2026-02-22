import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { UploadStepProgress } from './upload-step-progress'

const defaultProps = {
  fileName: 'blood-report.pdf',
  status: 'uploading' as const,
  progress: 50,
  errorMessage: null,
  onRetry: vi.fn(),
  onCancel: vi.fn(),
  onViewReport: vi.fn(),
}

describe('UploadStepProgress', () => {
  it('renders uploading state with progress bar', () => {
    render(<UploadStepProgress {...defaultProps} />)

    expect(screen.getByText('Uploading...')).toBeInTheDocument()
    expect(screen.getByText('blood-report.pdf')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('renders creating state with full progress bar', () => {
    render(<UploadStepProgress {...defaultProps} status="creating" progress={100} />)

    expect(screen.getByText('Saving report...')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('renders success state with View Report button', () => {
    render(<UploadStepProgress {...defaultProps} status="success" progress={100} />)

    expect(screen.getByText('Report uploaded!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View Report' })).toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('renders error state with Retry and Cancel buttons', () => {
    render(
      <UploadStepProgress
        {...defaultProps}
        status="error"
        errorMessage="Upload failed with status 403"
      />,
    )

    expect(screen.getByText('Upload failed')).toBeInTheDocument()
    expect(screen.getByText('Upload failed with status 403')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('calls onViewReport when View Report clicked', async () => {
    const onViewReport = vi.fn()
    render(
      <UploadStepProgress {...defaultProps} status="success" onViewReport={onViewReport} />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'View Report' }))
    expect(onViewReport).toHaveBeenCalledOnce()
  })

  it('calls onRetry when Retry clicked', async () => {
    const onRetry = vi.fn()
    render(
      <UploadStepProgress
        {...defaultProps}
        status="error"
        errorMessage="Network error"
        onRetry={onRetry}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('calls onCancel when Cancel clicked in error state', async () => {
    const onCancel = vi.fn()
    render(
      <UploadStepProgress
        {...defaultProps}
        status="error"
        errorMessage="Network error"
        onCancel={onCancel}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('does not show error message when not provided', () => {
    render(<UploadStepProgress {...defaultProps} status="error" errorMessage={null} />)

    expect(screen.getByText('Upload failed')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
