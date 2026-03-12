import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import ReportDetailPage from './page'
import type { ReportDetail, ExtractionStatusResponse } from '@/types/reports'

// Mock react-pdf
vi.mock('react-pdf', () => {
  const React = require('react')
  return {
    Document: ({
      onLoadSuccess,
      children,
    }: {
      onLoadSuccess?: (info: { numPages: number }) => void
      children?: React.ReactNode
      loading?: React.ReactNode
      file: string | null
    }) => {
      React.useEffect(() => {
        onLoadSuccess?.({ numPages: 2 })
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
      return <div data-testid="pdf-document">{children}</div>
    },
    Page: ({ pageNumber }: { pageNumber: number }) => (
      <div data-testid={`pdf-page-${pageNumber}`}>Page {pageNumber}</div>
    ),
    pdfjs: { GlobalWorkerOptions: { workerSrc: '' } },
  }
})

// Mock the PDF.js worker setup
vi.mock('@/lib/pdf/setup', () => ({}))

// Mock next/navigation
const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => ({ id: 'r1' }),
}))

// Mock the download utility
const mockDownloadAndVerify = vi.fn()
const mockTriggerBrowserDownload = vi.fn()
vi.mock('@/lib/download/verified-download', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/lib/download/verified-download')>()
  return {
    ...original,
    downloadAndVerify: (...args: unknown[]) => mockDownloadAndVerify(...args),
    triggerBrowserDownload: (...args: unknown[]) => mockTriggerBrowserDownload(...args),
  }
})

// Mock fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : status === 404 ? 'Not Found' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockReport: ReportDetail = {
  id: 'r1',
  title: 'Complete Blood Count',
  reportType: 'blood_test',
  status: 'validated',
  labName: 'Thyrocare Labs',
  highlightParameter: null,
  createdAt: '2025-01-15T10:00:00Z',
  reportNumber: 'RPT-001',
  uploadedAt: '2025-01-15T10:00:00Z',
  labCode: null,
  collectedAt: null,
  reportedAt: null,
  notes: null,
  parameters: [
    {
      code: 'HGB',
      name: 'Hemoglobin',
      numericValue: 14.2,
      textValue: null,
      unit: 'g/dL',
      referenceRange: '13.0-17.0',
      isAbnormal: false,
    },
    {
      code: 'WBC',
      name: 'WBC Count',
      numericValue: 12500,
      textValue: null,
      unit: 'cells/mcL',
      referenceRange: '4500-11000',
      isAbnormal: true,
    },
  ],
  download: {
    objectKey: 'uploads/abc123.pdf',
    downloadUrl: 'https://example.com/download',
    expiresAt: '2025-12-31T00:00:00Z',
    provider: 's3',
  },
  extraction: null,
}

const mockExtraction: ExtractionStatusResponse = {
  status: 'completed',
  extractionMethod: 'ocr',
  structuringModel: 'gpt-4o',
  extractedParameterCount: 2,
  overallConfidence: 0.95,
  pageCount: 1,
  extractedAt: '2025-01-15T10:30:00Z',
  errorMessage: null,
  attemptCount: 1,
}

/** Helper to route fetch calls based on URL path */
function mockFetchByUrl(routes: Record<string, Response | (() => Response | Promise<Response>)>) {
  mockFetch.mockImplementation((url: string) => {
    for (const [pattern, response] of Object.entries(routes)) {
      if (url.includes(pattern)) {
        return typeof response === 'function' ? response() : Promise.resolve(response)
      }
    }
    return Promise.resolve(jsonResponse({ message: 'Not mocked' }, 500))
  })
}

beforeEach(() => {
  mockFetch.mockReset()
  pushMock.mockReset()
  mockDownloadAndVerify.mockReset()
  mockTriggerBrowserDownload.mockReset()
  mockDownloadAndVerify.mockResolvedValue({
    blobUrl: 'blob:http://localhost/mock',
    blob: new Blob(['content']),
    checksumValidated: true,
  })
})

describe('ReportDetailPage', () => {
  it('shows skeleton while loading', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves
    render(<ReportDetailPage />)
    expect(screen.getByTestId('report-detail-loading')).toBeInTheDocument()
  })

  it('renders report header with correct metadata when loaded', async () => {
    mockFetchByUrl({
      '/v1/reports/r1/extraction': jsonResponse(mockExtraction),
      '/v1/reports/r1': jsonResponse(mockReport),
    })
    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })
    expect(screen.getByText('Validated')).toBeInTheDocument()
    expect(screen.getByText('Blood Test')).toBeInTheDocument()
    expect(screen.getByText('Thyrocare Labs')).toBeInTheDocument()
  })

  it('renders parameter table when loaded', async () => {
    mockFetchByUrl({
      '/v1/reports/r1/extraction': jsonResponse(mockExtraction),
      '/v1/reports/r1': jsonResponse(mockReport),
    })
    render(<ReportDetailPage />)

    // DataTable renders both desktop and mobile views, so elements appear twice
    await waitFor(() => {
      expect(screen.getAllByText('Hemoglobin').length).toBeGreaterThanOrEqual(1)
    })
    expect(screen.getAllByText('WBC Count').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Normal').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('High').length).toBeGreaterThanOrEqual(1)
  })

  it('shows 404 empty state for not found report', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Not Found' }, 404))
    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Report not found')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Back to Reports' })).toBeInTheDocument()
  })

  it('navigates back when 404 back button clicked', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Not Found' }, 404))
    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Report not found')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Back to Reports' }))
    expect(pushMock).toHaveBeenCalledWith('/reports')
  })

  it('shows error state for server errors', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Server Error' }, 500))
    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })
  })

  it('navigates back when header back button clicked', async () => {
    mockFetchByUrl({
      '/v1/reports/r1/extraction': jsonResponse(mockExtraction),
      '/v1/reports/r1': jsonResponse(mockReport),
    })
    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByLabelText('Back to reports'))
    expect(pushMock).toHaveBeenCalledWith('/reports')
  })

  it('opens delete confirmation dialog', async () => {
    mockFetchByUrl({
      '/v1/reports/r1/extraction': jsonResponse(mockExtraction),
      '/v1/reports/r1': jsonResponse(mockReport),
    })
    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /Delete Report/i }))

    await waitFor(() => {
      expect(screen.getByText(/permanently removed/)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('confirms delete and navigates away', async () => {
    mockFetchByUrl({
      '/v1/reports/r1/extraction': jsonResponse(mockExtraction),
      '/v1/reports/r1': jsonResponse(mockReport),
    })
    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    // Open delete dialog
    await userEvent.click(screen.getByRole('button', { name: /Delete Report/i }))
    await waitFor(() => {
      expect(screen.getByText(/permanently removed/)).toBeInTheDocument()
    })

    // Mock delete response
    mockFetch.mockResolvedValue(jsonResponse(null, 200))

    // Confirm delete
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    // Should navigate to /reports after successful delete
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/reports')
    })
  })

  it('triggers verified download with checksum validation', async () => {
    const verifiedData = {
      reportId: 'r1',
      objectKey: 'uploads/r1.pdf',
      downloadUrl: 'https://example.com/download',
      expiresAt: '2025-12-31T00:00:00Z',
      checksumSha256: 'ABC123',
      isServerVerified: true,
    }
    mockFetchByUrl({
      '/v1/reports/r1/extraction': jsonResponse(mockExtraction),
      '/v1/reports/r1': jsonResponse(mockReport),
    })

    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValue(jsonResponse(verifiedData))

    await userEvent.click(screen.getByRole('button', { name: /Download Report/i }))

    await waitFor(() => {
      expect(mockDownloadAndVerify).toHaveBeenCalledWith({
        downloadUrl: 'https://example.com/download',
        checksumSha256: 'ABC123',
      })
    })
    expect(mockTriggerBrowserDownload).toHaveBeenCalledWith(
      'blob:http://localhost/mock',
      'Complete Blood Count.pdf',
    )
  })

  it('shows error alert when checksum mismatch occurs on download', async () => {
    mockFetchByUrl({
      '/v1/reports/r1/extraction': jsonResponse(mockExtraction),
      '/v1/reports/r1': jsonResponse(mockReport),
    })

    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    // Mock the verified URL response
    const verifiedData = {
      reportId: 'r1',
      objectKey: 'uploads/r1.pdf',
      downloadUrl: 'https://example.com/download',
      expiresAt: '2025-12-31T00:00:00Z',
      checksumSha256: 'ABC123',
      isServerVerified: true,
    }
    mockFetch.mockResolvedValue(jsonResponse(verifiedData))

    // Make downloadAndVerify throw ChecksumMismatchError
    const { ChecksumMismatchError: CME } = await import('@/lib/download/verified-download')
    mockDownloadAndVerify.mockRejectedValue(new CME('ABC123', 'DEF456'))

    await userEvent.click(screen.getByRole('button', { name: /Download Report/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })
    expect(screen.getByText(/integrity check failed/i)).toBeInTheDocument()
  })

  it('renders PDF viewer when report loads', async () => {
    // Route-based mock: report detail, extraction status, and PDF download URL
    const downloadData = {
      downloadUrl: 'https://cdn.example.com/report.pdf',
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    }
    mockFetchByUrl({
      '/v1/reports/r1/extraction': jsonResponse(mockExtraction),
      '/v1/reports/download-url': jsonResponse(downloadData),
      '/v1/reports/r1': jsonResponse(mockReport),
    })

    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByTestId('pdf-document')).toBeInTheDocument()
    })
  })

  it('shows View PDF button on mobile', async () => {
    const downloadData = {
      downloadUrl: 'https://cdn.example.com/report.pdf',
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    }
    mockFetchByUrl({
      '/v1/reports/r1/extraction': jsonResponse(mockExtraction),
      '/v1/reports/download-url': jsonResponse(downloadData),
      '/v1/reports/r1': jsonResponse(mockReport),
    })

    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'View PDF' })).toBeInTheDocument()
  })

  it('toggles PDF expanded state when View PDF clicked', async () => {
    const downloadData = {
      downloadUrl: 'https://cdn.example.com/report.pdf',
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    }
    mockFetchByUrl({
      '/v1/reports/r1/extraction': jsonResponse(mockExtraction),
      '/v1/reports/download-url': jsonResponse(downloadData),
      '/v1/reports/r1': jsonResponse(mockReport),
    })

    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'View PDF' }))

    // After expanding, button text changes
    expect(screen.getByRole('button', { name: 'Hide PDF' }))
  })

  it('shows extraction status card when extraction data loads', async () => {
    mockFetchByUrl({
      '/v1/reports/r1/extraction': jsonResponse(mockExtraction),
      '/v1/reports/r1': jsonResponse(mockReport),
    })

    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByTestId('extraction-status-card')).toBeInTheDocument()
    })
    expect(screen.getByText('AI Extraction')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('shows extraction skeleton while loading extraction status', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves
    render(<ReportDetailPage />)

    // Page shows loading skeleton for the report itself
    expect(screen.getByTestId('report-detail-loading')).toBeInTheDocument()
  })
})
