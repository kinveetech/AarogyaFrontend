import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/render'

// Mock react-pdf Page component
vi.mock('react-pdf', () => ({
  Page: ({ pageNumber, onRenderSuccess }: { pageNumber: number; onRenderSuccess?: () => void }) => {
    // Simulate immediate render success
    if (onRenderSuccess) {
      setTimeout(onRenderSuccess, 0)
    }
    return <div data-testid={`pdf-page-${pageNumber}`}>Page {pageNumber}</div>
  },
  pdfjs: { GlobalWorkerOptions: { workerSrc: '' } },
}))

import { PDFPageRenderer } from './pdf-page-renderer'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PDFPageRenderer', () => {
  it('renders page when visible (IntersectionObserver fires)', () => {
    // Our test setup mock immediately fires isIntersecting: true
    render(<PDFPageRenderer pageNumber={1} width={600} />)
    expect(screen.getByTestId('pdf-page-1')).toBeInTheDocument()
  })

  it('renders correct container with data-testid', () => {
    render(<PDFPageRenderer pageNumber={3} width={400} />)
    expect(screen.getByTestId('pdf-page-container-3')).toBeInTheDocument()
  })

  it('renders page with correct page number', () => {
    render(<PDFPageRenderer pageNumber={5} width={600} />)
    expect(screen.getByTestId('pdf-page-5')).toHaveTextContent('Page 5')
  })

  it('shows placeholder skeleton when not visible', () => {
    // Override IntersectionObserver to NOT trigger for this test
    const originalIO = globalThis.IntersectionObserver
    globalThis.IntersectionObserver = class MockIO {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    } as unknown as typeof IntersectionObserver

    render(<PDFPageRenderer pageNumber={2} width={600} />)
    expect(screen.getByTestId('pdf-page-placeholder-2')).toBeInTheDocument()
    expect(screen.queryByTestId('pdf-page-2')).not.toBeInTheDocument()

    globalThis.IntersectionObserver = originalIO
  })
})
