import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { UploadStepFile } from './upload-step-file'

const defaultProps = {
  file: null as File | null,
  onFileSelect: vi.fn(),
  onFileRemove: vi.fn(),
  onNext: vi.fn(),
  onCancel: vi.fn(),
}

describe('UploadStepFile', () => {
  it('renders dropzone when no file is selected', () => {
    render(<UploadStepFile {...defaultProps} />)
    expect(screen.getByText('Drag & drop your file here')).toBeInTheDocument()
    expect(screen.getByText('Browse files')).toBeInTheDocument()
  })

  it('disables Next button when no file is selected', () => {
    render(<UploadStepFile {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('renders file preview when file is selected', () => {
    const file = new File(['test'], 'blood-report.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 })

    render(<UploadStepFile {...defaultProps} file={file} />)

    expect(screen.getByText('blood-report.pdf')).toBeInTheDocument()
    expect(screen.getByText('2.0 MB')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remove file' })).toBeInTheDocument()
  })

  it('enables Next button when file is selected', () => {
    const file = new File(['test'], 'report.pdf', { type: 'application/pdf' })

    render(<UploadStepFile {...defaultProps} file={file} />)
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
  })

  it('calls onFileRemove when Remove button is clicked', async () => {
    const onFileRemove = vi.fn()
    const file = new File(['test'], 'report.pdf', { type: 'application/pdf' })

    render(<UploadStepFile {...defaultProps} file={file} onFileRemove={onFileRemove} />)
    await userEvent.click(screen.getByRole('button', { name: 'Remove file' }))

    expect(onFileRemove).toHaveBeenCalledOnce()
  })

  it('calls onNext when Next button is clicked', async () => {
    const onNext = vi.fn()
    const file = new File(['test'], 'report.pdf', { type: 'application/pdf' })

    render(<UploadStepFile {...defaultProps} file={file} onNext={onNext} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(onNext).toHaveBeenCalledOnce()
  })

  it('calls onCancel when Cancel button is clicked', async () => {
    const onCancel = vi.fn()

    render(<UploadStepFile {...defaultProps} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onCancel).toHaveBeenCalledOnce()
  })
})
