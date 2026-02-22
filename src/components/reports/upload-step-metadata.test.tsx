import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { UploadStepMetadata } from './upload-step-metadata'

const defaultProps = {
  defaultTitle: 'blood-report',
  onSubmit: vi.fn(),
  onBack: vi.fn(),
}

describe('UploadStepMetadata', () => {
  it('renders all form fields', () => {
    render(<UploadStepMetadata {...defaultProps} />)

    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Report Type')).toBeInTheDocument()
    expect(screen.getByLabelText('Report Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Notes')).toBeInTheDocument()
  })

  it('pre-fills title with defaultTitle', () => {
    render(<UploadStepMetadata {...defaultProps} />)
    expect(screen.getByLabelText('Title')).toHaveValue('blood-report')
  })

  it('pre-fills report date with today', () => {
    render(<UploadStepMetadata {...defaultProps} />)
    const today = new Date().toISOString().split('T')[0]
    expect(screen.getByLabelText('Report Date')).toHaveValue(today)
  })

  it('renders all report type options', () => {
    render(<UploadStepMetadata {...defaultProps} />)
    const select = screen.getByLabelText('Report Type')

    expect(select).toContainHTML('Lab Test')
    expect(select).toContainHTML('Prescription')
    expect(select).toContainHTML('Imaging')
    expect(select).toContainHTML('Discharge')
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
    expect(submittedData.title).toBe('blood-report')
    expect(submittedData.reportType).toBe('lab')
    expect(submittedData.reportDate).toBeTruthy()
  })

  it('shows validation error for empty title', async () => {
    const onSubmit = vi.fn()
    render(<UploadStepMetadata {...defaultProps} defaultTitle="" onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Upload' }))

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
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

  it('validates notes max length', async () => {
    const onSubmit = vi.fn()
    render(<UploadStepMetadata {...defaultProps} onSubmit={onSubmit} />)

    const notes = screen.getByLabelText('Notes')
    await userEvent.clear(notes)
    await userEvent.type(notes, 'a'.repeat(501))

    await userEvent.click(screen.getByRole('button', { name: 'Upload' }))

    await waitFor(() => {
      expect(screen.getByText('Notes must be 500 characters or fewer')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
