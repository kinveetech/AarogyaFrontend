import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { ReportPagination } from './report-pagination'

describe('ReportPagination', () => {
  const defaultProps = {
    page: 1,
    pageSize: 9,
    totalCount: 25,
    totalPages: 3,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  }

  it('renders pagination info text', () => {
    render(<ReportPagination {...defaultProps} />)
    expect(screen.getByTestId('pagination-info').textContent).toBe(
      'Showing 1–9 of 25',
    )
  })

  it('renders correct info on middle page', () => {
    render(<ReportPagination {...defaultProps} page={2} />)
    expect(screen.getByTestId('pagination-info').textContent).toBe(
      'Showing 10–18 of 25',
    )
  })

  it('renders correct info on last page', () => {
    render(<ReportPagination {...defaultProps} page={3} />)
    expect(screen.getByTestId('pagination-info').textContent).toBe(
      'Showing 19–25 of 25',
    )
  })

  it('disables Prev on first page', () => {
    render(<ReportPagination {...defaultProps} page={1} />)
    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled()
  })

  it('disables Next on last page', () => {
    render(<ReportPagination {...defaultProps} page={3} />)
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('enables both buttons on middle page', () => {
    render(<ReportPagination {...defaultProps} page={2} />)
    expect(screen.getByRole('button', { name: 'Prev' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled()
  })

  it('calls onPageChange with next page', async () => {
    const onPageChange = vi.fn()
    render(<ReportPagination {...defaultProps} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageChange with previous page', async () => {
    const onPageChange = vi.fn()
    render(<ReportPagination {...defaultProps} page={2} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: 'Prev' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('calls onPageSizeChange when page size is changed', async () => {
    const onPageSizeChange = vi.fn()
    render(<ReportPagination {...defaultProps} onPageSizeChange={onPageSizeChange} />)
    const select = screen.getByLabelText('Reports per page')
    await userEvent.selectOptions(select, '18')
    expect(onPageSizeChange).toHaveBeenCalledWith(18)
  })

  it('renders nothing when totalCount is 0', () => {
    render(
      <ReportPagination {...defaultProps} totalCount={0} totalPages={0} />,
    )
    expect(screen.queryByTestId('pagination-info')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument()
  })
})
