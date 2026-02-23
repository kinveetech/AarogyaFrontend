import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { ReportDetailHeader } from './report-detail-header'
import type { ReportDetail } from '@/types/reports'

const mockReport: ReportDetail = {
  id: 'r1',
  title: 'Complete Blood Count',
  reportType: 'lab',
  status: 'verified',
  reportDate: '2025-01-15T00:00:00Z',
  labName: 'Thyrocare Labs',
  doctorName: 'Dr. Patel',
  notes: null,
  highlightParameter: null,
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
  parameters: [],
  fileKey: 'uploads/abc123.pdf',
  fileType: 'application/pdf',
  fileSizeBytes: 204800,
}

describe('ReportDetailHeader', () => {
  const defaultProps = {
    report: mockReport,
    onBack: vi.fn(),
  }

  it('renders report title', () => {
    render(<ReportDetailHeader {...defaultProps} />)
    expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
  })

  it('renders report type label', () => {
    render(<ReportDetailHeader {...defaultProps} />)
    expect(screen.getByText('Lab Test')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<ReportDetailHeader {...defaultProps} />)
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('renders formatted date', () => {
    render(<ReportDetailHeader {...defaultProps} />)
    expect(screen.getByText(/2025/)).toBeInTheDocument()
  })

  it('renders lab name when present', () => {
    render(<ReportDetailHeader {...defaultProps} />)
    expect(screen.getByText('Thyrocare Labs')).toBeInTheDocument()
  })

  it('renders doctor name when present', () => {
    render(<ReportDetailHeader {...defaultProps} />)
    expect(screen.getByText('Dr. Patel')).toBeInTheDocument()
  })

  it('hides lab name when null', () => {
    const report = { ...mockReport, labName: null }
    render(<ReportDetailHeader {...defaultProps} report={report} />)
    expect(screen.queryByText('Thyrocare Labs')).not.toBeInTheDocument()
  })

  it('hides doctor name when null', () => {
    const report = { ...mockReport, doctorName: null }
    render(<ReportDetailHeader {...defaultProps} report={report} />)
    expect(screen.queryByText('Dr. Patel')).not.toBeInTheDocument()
  })

  it('calls onBack when back button clicked', async () => {
    const onBack = vi.fn()
    render(<ReportDetailHeader {...defaultProps} onBack={onBack} />)
    await userEvent.click(screen.getByLabelText('Back to reports'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('renders title as an h1 heading', () => {
    render(<ReportDetailHeader {...defaultProps} />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Complete Blood Count')
  })
})
