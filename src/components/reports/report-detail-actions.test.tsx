import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { ReportDetailActions } from './report-detail-actions'

describe('ReportDetailActions', () => {
  const defaultProps = {
    onDownload: vi.fn(),
    onDelete: vi.fn(),
    downloading: false,
  }

  it('renders Download, Delete, and Share buttons', () => {
    render(<ReportDetailActions {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Download Report/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Delete Report/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Share/i })).toBeInTheDocument()
  })

  it('Share button is disabled', () => {
    render(<ReportDetailActions {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Share/i })).toBeDisabled()
  })

  it('calls onDownload when Download clicked', async () => {
    const onDownload = vi.fn()
    render(<ReportDetailActions {...defaultProps} onDownload={onDownload} />)
    await userEvent.click(screen.getByRole('button', { name: /Download Report/i }))
    expect(onDownload).toHaveBeenCalledOnce()
  })

  it('calls onDelete when Delete clicked', async () => {
    const onDelete = vi.fn()
    render(<ReportDetailActions {...defaultProps} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /Delete Report/i }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('shows loading state on Download when downloading=true', () => {
    const { container } = render(<ReportDetailActions {...defaultProps} downloading={true} />)
    const loadingBtn = container.querySelector('button[data-loading]')
    expect(loadingBtn).toBeInTheDocument()
    expect(loadingBtn).toBeDisabled()
  })
})
