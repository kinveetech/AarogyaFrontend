import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor, fireEvent } from '@/test/render'

// Mock react-pdf
vi.mock('react-pdf', () => {
  const React = require('react')
  return {
    Document: ({
      onLoadSuccess,
      onLoadError,
      children,
      file,
    }: {
      onLoadSuccess?: (info: { numPages: number }) => void
      onLoadError?: () => void
      children?: React.ReactNode
      loading?: React.ReactNode
      file: string | null
    }) => {
      React.useEffect(() => {
        if (file === 'ERROR_URL') {
          onLoadError?.()
        } else {
          onLoadSuccess?.({ numPages: 3 })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [file])
      return <div data-testid="pdf-document">{children}</div>
    },
    Page: ({ pageNumber }: { pageNumber: number }) => (
      <div data-testid={`pdf-page-${pageNumber}`}>Page {pageNumber}</div>
    ),
    pdfjs: { GlobalWorkerOptions: { workerSrc: '' } },
  }
})

// Mock the setup side-effect import
vi.mock('@/lib/pdf/setup', () => ({}))

// Mock usePdfUrl
const mockRefresh = vi.fn()
let mockPdfUrlReturn = {
  url: 'https://cdn.example.com/report.pdf' as string | null,
  isLoading: false,
  error: null as Error | null,
  refresh: mockRefresh,
}

vi.mock('@/hooks/reports/use-pdf-url', () => ({
  usePdfUrl: () => mockPdfUrlReturn,
}))

import { PDFViewer } from './pdf-viewer'

beforeEach(() => {
  vi.clearAllMocks()
  mockPdfUrlReturn = {
    url: 'https://cdn.example.com/report.pdf',
    isLoading: false,
    error: null,
    refresh: mockRefresh,
  }
})

describe('PDFViewer', () => {
  it('shows unsupported message for non-PDF files', () => {
    render(
      <PDFViewer
        reportId="r1"
        fileType="image/jpeg"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )
    expect(screen.getByTestId('pdf-viewer-unsupported')).toBeInTheDocument()
    expect(screen.getByText('Preview not available for this file type.')).toBeInTheDocument()
  })

  it('shows loading state while URL is being fetched', () => {
    mockPdfUrlReturn = { url: null, isLoading: true, error: null, refresh: mockRefresh }

    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )
    expect(screen.getByTestId('pdf-viewer-loading')).toBeInTheDocument()
  })

  it('shows error state when URL fetch fails', () => {
    mockPdfUrlReturn = {
      url: null,
      isLoading: false,
      error: new Error('Failed'),
      refresh: mockRefresh,
    }

    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )
    expect(screen.getByTestId('pdf-viewer-error')).toBeInTheDocument()
    expect(screen.getByText('Could not load PDF')).toBeInTheDocument()
  })

  it('renders retry button on error that calls refresh', async () => {
    mockPdfUrlReturn = {
      url: null,
      isLoading: false,
      error: new Error('Failed'),
      refresh: mockRefresh,
    }

    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  it('renders PDF document with pages when URL is available', () => {
    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )
    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument()
    expect(screen.getByTestId('pdf-document')).toBeInTheDocument()
    expect(screen.getByTestId('pdf-page-1')).toBeInTheDocument()
    expect(screen.getByTestId('pdf-page-2')).toBeInTheDocument()
    expect(screen.getByTestId('pdf-page-3')).toBeInTheDocument()
  })

  it('renders toolbar with correct page count', () => {
    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )
    expect(screen.getByTestId('pdf-toolbar')).toBeInTheDocument()
    expect(screen.getByText('of 3')).toBeInTheDocument()
  })

  it('responds to keyboard shortcut for zoom reset', () => {
    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )

    // Zoom in first
    fireEvent.keyDown(window, { key: '+' })
    expect(screen.getByText('110%')).toBeInTheDocument()

    // Reset with 0
    fireEvent.keyDown(window, { key: '0' })
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('responds to keyboard shortcut for zoom in', () => {
    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )

    fireEvent.keyDown(window, { key: '=' })
    expect(screen.getByText('110%')).toBeInTheDocument()
  })

  it('responds to keyboard shortcut for zoom out', () => {
    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )

    fireEvent.keyDown(window, { key: '-' })
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  it('ignores keyboard shortcuts when input is focused', () => {
    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )

    const input = screen.getByLabelText('Page number')
    input.focus()
    fireEvent.keyDown(input, { key: '+' })

    // Should still be 100% (not zoomed)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('shows error state when url is null without loading', () => {
    mockPdfUrlReturn = {
      url: null,
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    }

    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )
    expect(screen.getByTestId('pdf-viewer-error')).toBeInTheDocument()
  })

  it('responds to ArrowRight keyboard shortcut for next page', () => {
    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )

    // Page should start at 1; navigate forward
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    // Page input should show 2
    const input = screen.getByLabelText('Page number') as HTMLInputElement
    expect(input.value).toBe('2')
  })

  it('responds to ArrowLeft keyboard shortcut for previous page', () => {
    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )

    // Navigate forward first, then back
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    fireEvent.keyDown(window, { key: 'ArrowLeft' })

    const input = screen.getByLabelText('Page number') as HTMLInputElement
    expect(input.value).toBe('1')
  })

  it('shows document error state when PDF fails to load', () => {
    // Set url to ERROR_URL to trigger onLoadError in mock
    mockPdfUrlReturn = {
      url: 'ERROR_URL',
      isLoading: false,
      error: null,
      refresh: mockRefresh,
    }

    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={vi.fn()}
      />,
    )

    expect(screen.getByTestId('pdf-viewer-doc-error')).toBeInTheDocument()
    expect(screen.getByText('Could not render PDF')).toBeInTheDocument()
  })

  it('calls onToggleExpand from toolbar', async () => {
    const onToggleExpand = vi.fn()
    render(
      <PDFViewer
        reportId="r1"
        fileType="application/pdf"
        expanded={false}
        onToggleExpand={onToggleExpand}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Expand viewer' }))
    expect(onToggleExpand).toHaveBeenCalledTimes(1)
  })
})
