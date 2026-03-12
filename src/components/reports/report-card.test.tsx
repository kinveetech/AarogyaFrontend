import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { axe } from 'vitest-axe'
import { ReportCard } from './report-card'
import type { Report } from '@/types/reports'

const mockReport: Report = {
  id: 'r1',
  title: 'Complete Blood Count',
  reportType: 'blood_test',
  status: 'verified',
  labName: 'Thyrocare Labs',
  highlightParameter: 'Hemoglobin: 14.2 g/dL',
  createdAt: '2025-01-15T10:00:00Z',
}

describe('ReportCard', () => {
  const defaultProps = {
    report: mockReport,
    onView: vi.fn(),
    onDownload: vi.fn(),
    onDelete: vi.fn(),
  }

  it('renders report title', () => {
    render(<ReportCard {...defaultProps} />)
    expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
  })

  it('renders report type label', () => {
    render(<ReportCard {...defaultProps} />)
    expect(screen.getByText('Blood Test')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<ReportCard {...defaultProps} />)
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('renders formatted date', () => {
    render(<ReportCard {...defaultProps} />)
    // The date "2025-01-15" should be formatted and visible
    expect(screen.getByText(/2025/)).toBeInTheDocument()
  })

  it('renders lab name when present', () => {
    render(<ReportCard {...defaultProps} />)
    expect(screen.getByText('Thyrocare Labs')).toBeInTheDocument()
  })

  it('renders highlight parameter when present', () => {
    render(<ReportCard {...defaultProps} />)
    expect(screen.getByText('Hemoglobin: 14.2 g/dL')).toBeInTheDocument()
  })

  it('does not render lab name when null', () => {
    const report = { ...mockReport, labName: null }
    render(<ReportCard {...defaultProps} report={report} />)
    expect(screen.queryByText('Thyrocare Labs')).not.toBeInTheDocument()
  })

  it('renders as a link to the report detail page', () => {
    render(<ReportCard {...defaultProps} />)
    const link = screen.getByTestId('report-card')
    expect(link.tagName).toBe('A')
    expect(link).toHaveAttribute('href', '/reports/r1')
  })

  it('calls onView when card is clicked', async () => {
    const onView = vi.fn()
    render(<ReportCard {...defaultProps} onView={onView} />)
    await userEvent.click(screen.getByTestId('report-card'))
    expect(onView).toHaveBeenCalledWith('r1')
  })

  it('calls onDownload when download button is clicked', async () => {
    const onDownload = vi.fn()
    const onView = vi.fn()
    render(<ReportCard {...defaultProps} onView={onView} onDownload={onDownload} />)
    await userEvent.click(screen.getByLabelText('Download report'))
    expect(onDownload).toHaveBeenCalledWith('r1')
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    const onView = vi.fn()
    render(<ReportCard {...defaultProps} onView={onView} onDelete={onDelete} />)
    await userEvent.click(screen.getByLabelText('Delete report'))
    expect(onDelete).toHaveBeenCalledWith('r1')
  })

  it('renders pending status correctly', () => {
    const report = { ...mockReport, status: 'pending' as const }
    render(<ReportCard {...defaultProps} report={report} />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ReportCard {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
