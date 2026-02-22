import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import ReportDetailPage from './page'
import type { ReportDetail } from '@/types/reports'

// Mock next/navigation
const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => ({ id: 'r1' }),
}))

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
  reportType: 'lab',
  status: 'verified',
  reportDate: '2025-01-15T00:00:00Z',
  labName: 'Thyrocare Labs',
  doctorName: 'Dr. Patel',
  notes: null,
  highlightParameter: null,
  createdAt: '2025-01-15T10:00:00Z',
  updatedAt: '2025-01-15T10:00:00Z',
  parameters: [
    {
      name: 'Hemoglobin',
      value: '14.2',
      unit: 'g/dL',
      referenceRange: '13.0-17.0',
      status: 'normal',
    },
    {
      name: 'WBC Count',
      value: '12500',
      unit: 'cells/mcL',
      referenceRange: '4500-11000',
      status: 'high',
    },
  ],
  fileKey: 'uploads/abc123.pdf',
  fileType: 'application/pdf',
  fileSizeBytes: 204800,
}

beforeEach(() => {
  mockFetch.mockReset()
  pushMock.mockReset()
})

describe('ReportDetailPage', () => {
  it('shows skeleton while loading', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves
    render(<ReportDetailPage />)
    expect(screen.getByTestId('report-detail-loading')).toBeInTheDocument()
  })

  it('renders report header with correct metadata when loaded', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockReport))
    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })
    expect(screen.getByText('Verified')).toBeInTheDocument()
    expect(screen.getByText('Lab Test')).toBeInTheDocument()
    expect(screen.getByText('Thyrocare Labs')).toBeInTheDocument()
    expect(screen.getByText('Dr. Patel')).toBeInTheDocument()
  })

  it('renders parameter table when loaded', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockReport))
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
    mockFetch.mockResolvedValue(jsonResponse(mockReport))
    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByLabelText('Back to reports'))
    expect(pushMock).toHaveBeenCalledWith('/reports')
  })

  it('opens delete confirmation dialog', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockReport))
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
    mockFetch.mockResolvedValue(jsonResponse(mockReport))
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

  it('triggers download and opens URL', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockReport))
    const openMock = vi.fn()
    vi.stubGlobal('open', openMock)

    render(<ReportDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    const downloadData = {
      downloadUrl: 'https://example.com/download',
      expiresAt: '2025-12-31T00:00:00Z',
    }
    mockFetch.mockResolvedValue(jsonResponse(downloadData))

    await userEvent.click(screen.getByRole('button', { name: /Download Report/i }))

    await waitFor(() => {
      expect(openMock).toHaveBeenCalledWith('https://example.com/download', '_blank')
    })

    vi.unstubAllGlobals()
    vi.stubGlobal('fetch', mockFetch)
  })
})
