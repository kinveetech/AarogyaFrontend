import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { ReportsPageHeader } from './reports-page-header'

describe('ReportsPageHeader', () => {
  const defaultProps = {
    search: '',
    onSearchChange: vi.fn(),
    onUploadClick: vi.fn(),
  }

  it('renders the heading', () => {
    render(<ReportsPageHeader {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'My Reports' })).toBeInTheDocument()
  })

  it('renders search input with placeholder', () => {
    render(<ReportsPageHeader {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search reports...')).toBeInTheDocument()
  })

  it('renders upload button', () => {
    render(<ReportsPageHeader {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Upload Report' })).toBeInTheDocument()
  })

  it('displays the current search value', () => {
    render(<ReportsPageHeader {...defaultProps} search="blood" />)
    expect(screen.getByLabelText('Search reports')).toHaveValue('blood')
  })

  it('calls onSearchChange when typing', async () => {
    const onSearchChange = vi.fn()
    render(<ReportsPageHeader {...defaultProps} onSearchChange={onSearchChange} />)
    await userEvent.type(screen.getByLabelText('Search reports'), 'x')
    expect(onSearchChange).toHaveBeenCalledWith('x')
  })

  it('calls onUploadClick when upload button is clicked', async () => {
    const onUploadClick = vi.fn()
    render(<ReportsPageHeader {...defaultProps} onUploadClick={onUploadClick} />)
    await userEvent.click(screen.getByRole('button', { name: 'Upload Report' }))
    expect(onUploadClick).toHaveBeenCalledOnce()
  })
})
