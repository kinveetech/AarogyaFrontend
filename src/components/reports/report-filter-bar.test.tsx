import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { axe } from 'vitest-axe'
import { ReportFilterBar } from './report-filter-bar'

describe('ReportFilterBar', () => {
  const defaultProps = {
    selectedType: 'all' as const,
    onTypeChange: vi.fn(),
    selectedStatus: 'all' as const,
    onStatusChange: vi.fn(),
  }

  it('renders all type filter options', () => {
    render(<ReportFilterBar {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'All Types' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Blood Test' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Urine Test' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Radiology' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cardiology' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Other' })).toBeInTheDocument()
  })

  it('renders all status filter options', () => {
    render(<ReportFilterBar {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'All Status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pending' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Processing' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Verified' })).toBeInTheDocument()
  })

  it('calls onTypeChange when a type filter is clicked', async () => {
    const onTypeChange = vi.fn()
    render(<ReportFilterBar {...defaultProps} onTypeChange={onTypeChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Blood Test' }))
    expect(onTypeChange).toHaveBeenCalledWith('blood_test')
  })

  it('calls onStatusChange when a status filter is clicked', async () => {
    const onStatusChange = vi.fn()
    render(<ReportFilterBar {...defaultProps} onStatusChange={onStatusChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Verified' }))
    expect(onStatusChange).toHaveBeenCalledWith('verified')
  })

  it('renders the date range picker', () => {
    render(<ReportFilterBar {...defaultProps} />)
    expect(screen.getByLabelText('Filter by date range')).toBeInTheDocument()
  })

  it('has labeled filter groups', () => {
    render(<ReportFilterBar {...defaultProps} />)
    expect(screen.getByRole('group', { name: /filter by report type/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /filter by status/i })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ReportFilterBar {...defaultProps} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
