import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { ReportCardGrid } from './report-card-grid'
import type { Report } from '@/types/reports'

const mockReports: Report[] = [
  {
    id: 'r1',
    title: 'Complete Blood Count',
    reportType: 'blood_test',
    status: 'validated',
    labName: 'Lab A',
    highlightParameter: null,
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'r2',
    title: 'X-Ray Report',
    reportType: 'radiology',
    status: 'uploaded',
    labName: null,
    highlightParameter: null,
    createdAt: '2025-02-10T10:00:00Z',
  },
]

describe('ReportCardGrid', () => {
  const defaultProps = {
    reports: mockReports,
    loading: false,
    onView: vi.fn(),
    onDownload: vi.fn(),
    onDelete: vi.fn(),
    onUploadClick: vi.fn(),
  }

  it('renders skeleton cards when loading', () => {
    render(<ReportCardGrid {...defaultProps} loading={true} reports={[]} />)
    expect(screen.getByTestId('report-grid-loading')).toBeInTheDocument()
    expect(screen.getAllByTestId('report-card-skeleton')).toHaveLength(6)
  })

  it('renders empty state when no reports', () => {
    render(<ReportCardGrid {...defaultProps} reports={[]} />)
    expect(screen.getByTestId('report-grid-empty')).toBeInTheDocument()
    expect(screen.getByText('No reports found')).toBeInTheDocument()
  })

  it('renders upload button in empty state', async () => {
    const onUploadClick = vi.fn()
    render(<ReportCardGrid {...defaultProps} reports={[]} onUploadClick={onUploadClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Upload Report' }))
    expect(onUploadClick).toHaveBeenCalledOnce()
  })

  it('renders report cards when data is available', () => {
    render(<ReportCardGrid {...defaultProps} />)
    expect(screen.getByTestId('report-grid')).toBeInTheDocument()
    expect(screen.getAllByTestId('report-card')).toHaveLength(2)
    expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    expect(screen.getByText('X-Ray Report')).toBeInTheDocument()
  })
})
