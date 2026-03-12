import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { UploadStepMetadata } from './upload-step-metadata'

const defaultProps = {
  onSubmit: vi.fn(),
  onBack: vi.fn(),
}

describe('UploadStepMetadata', () => {
  it('renders report type field', () => {
    render(<UploadStepMetadata {...defaultProps} />)

    expect(screen.getByLabelText('Report Type')).toBeInTheDocument()
  })

  it('renders all report type options', () => {
    render(<UploadStepMetadata {...defaultProps} />)
    const select = screen.getByLabelText('Report Type')

    expect(select).toContainHTML('Blood Test')
    expect(select).toContainHTML('Urine Test')
    expect(select).toContainHTML('Radiology')
    expect(select).toContainHTML('Cardiology')
    expect(select).toContainHTML('Other')
  })

  it('calls onSubmit with form data on valid submission', async () => {
    const onSubmit = vi.fn()
    render(<UploadStepMetadata {...defaultProps} onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Upload' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce()
    })

    const submittedData = onSubmit.mock.calls[0][0]
    expect(submittedData.reportType).toBe('blood_test')
    expect(Object.keys(submittedData)).toHaveLength(1)
  })

  it('calls onBack when Back button is clicked', async () => {
    const onBack = vi.fn()
    render(<UploadStepMetadata {...defaultProps} onBack={onBack} />)

    await userEvent.click(screen.getByRole('button', { name: 'Back' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('shows loading state when submitting', () => {
    render(<UploadStepMetadata {...defaultProps} submitting />)

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  })
})
