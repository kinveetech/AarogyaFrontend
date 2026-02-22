import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { PDFToolbar, type PDFToolbarProps } from './pdf-toolbar'

const defaultProps: PDFToolbarProps = {
  currentPage: 2,
  numPages: 5,
  zoom: 100,
  fitMode: null,
  onPageChange: vi.fn(),
  onZoomChange: vi.fn(),
  onFitModeChange: vi.fn(),
  onToggleExpand: vi.fn(),
  expanded: false,
}

beforeEach(() => {
  vi.clearAllMocks()
})

function renderToolbar(props: Partial<PDFToolbarProps> = {}) {
  return render(<PDFToolbar {...defaultProps} {...props} />)
}

describe('PDFToolbar', () => {
  it('renders toolbar with page info', () => {
    renderToolbar()
    expect(screen.getByTestId('pdf-toolbar')).toBeInTheDocument()
    expect(screen.getByText('of 5')).toBeInTheDocument()
  })

  it('calls onPageChange when next button clicked', async () => {
    const onPageChange = vi.fn()
    renderToolbar({ onPageChange })

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange when prev button clicked', async () => {
    const onPageChange = vi.fn()
    renderToolbar({ onPageChange })

    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('disables prev button on first page', () => {
    renderToolbar({ currentPage: 1 })
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
  })

  it('disables next button on last page', () => {
    renderToolbar({ currentPage: 5 })
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled()
  })

  it('calls onZoomChange when zoom in clicked', async () => {
    const onZoomChange = vi.fn()
    const onFitModeChange = vi.fn()
    renderToolbar({ onZoomChange, onFitModeChange })

    await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(onZoomChange).toHaveBeenCalledWith(110)
    expect(onFitModeChange).toHaveBeenCalledWith(null)
  })

  it('calls onZoomChange when zoom out clicked', async () => {
    const onZoomChange = vi.fn()
    const onFitModeChange = vi.fn()
    renderToolbar({ onZoomChange, onFitModeChange })

    await userEvent.click(screen.getByRole('button', { name: 'Zoom out' }))
    expect(onZoomChange).toHaveBeenCalledWith(90)
    expect(onFitModeChange).toHaveBeenCalledWith(null)
  })

  it('disables zoom out at minimum zoom', () => {
    renderToolbar({ zoom: 50 })
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDisabled()
  })

  it('disables zoom in at maximum zoom', () => {
    renderToolbar({ zoom: 200 })
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled()
  })

  it('displays current zoom percentage', () => {
    renderToolbar({ zoom: 75 })
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('toggles fit width mode', async () => {
    const onFitModeChange = vi.fn()
    renderToolbar({ onFitModeChange })

    await userEvent.click(screen.getByRole('button', { name: 'Fit width' }))
    expect(onFitModeChange).toHaveBeenCalledWith('width')
  })

  it('toggles off fit width when already active', async () => {
    const onFitModeChange = vi.fn()
    renderToolbar({ fitMode: 'width', onFitModeChange })

    await userEvent.click(screen.getByRole('button', { name: 'Fit width' }))
    expect(onFitModeChange).toHaveBeenCalledWith(null)
  })

  it('toggles fit page mode', async () => {
    const onFitModeChange = vi.fn()
    renderToolbar({ onFitModeChange })

    await userEvent.click(screen.getByRole('button', { name: 'Fit page' }))
    expect(onFitModeChange).toHaveBeenCalledWith('page')
  })

  it('calls onToggleExpand when expand button clicked', async () => {
    const onToggleExpand = vi.fn()
    renderToolbar({ onToggleExpand })

    await userEvent.click(screen.getByRole('button', { name: 'Expand viewer' }))
    expect(onToggleExpand).toHaveBeenCalledTimes(1)
  })

  it('shows collapse label when expanded', () => {
    renderToolbar({ expanded: true })
    expect(screen.getByRole('button', { name: 'Collapse viewer' })).toBeInTheDocument()
  })
})
