import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import ReportsPage from './page'
import type { ReportListResponse } from '@/types/reports'

// Mock next/navigation
const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
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
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockData: ReportListResponse = {
  items: [
    {
      id: 'r1',
      title: 'Complete Blood Count',
      reportType: 'blood_test',
      status: 'verified',
      labName: 'Thyrocare Labs',
      highlightParameter: 'Hemoglobin: 14.2 g/dL',
      createdAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 'r2',
      title: 'Chest X-Ray',
      reportType: 'radiology',
      status: 'pending',
      labName: null,
      highlightParameter: null,
      createdAt: '2025-02-10T10:00:00Z',
    },
  ],
  page: 1,
  pageSize: 9,
  totalCount: 2,
  totalPages: 1,
}

const emptyData: ReportListResponse = {
  items: [],
  page: 1,
  pageSize: 9,
  totalCount: 0,
  totalPages: 0,
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

describe('ReportsPage', () => {
  it('shows loading skeleton on initial render', () => {
    mockFetch.mockReturnValue(new Promise(() => {})) // never resolves
    render(<ReportsPage />)
    expect(screen.getByTestId('report-grid-loading')).toBeInTheDocument()
  })

  it('renders report cards after data loads', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockData))
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })
    expect(screen.getByText('Chest X-Ray')).toBeInTheDocument()
    expect(screen.getAllByTestId('report-card')).toHaveLength(2)
  })

  it('renders page heading and search input', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockData))
    render(<ReportsPage />)

    expect(screen.getByRole('heading', { name: 'My Reports' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search reports...')).toBeInTheDocument()
  })

  it('shows empty state when no reports exist', async () => {
    mockFetch.mockResolvedValue(jsonResponse(emptyData))
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByText('No reports found')).toBeInTheDocument()
    })
  })

  it('navigates to upload page when Upload Report is clicked', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockData))
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    // Click the header upload button
    const uploadButtons = screen.getAllByRole('button', { name: 'Upload Report' })
    await userEvent.click(uploadButtons[0])
    expect(pushMock).toHaveBeenCalledWith('/reports/upload')
  })

  it('navigates to report detail when card is clicked', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockData))
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    await userEvent.click(screen.getAllByTestId('report-card')[0])
    expect(pushMock).toHaveBeenCalledWith('/reports/r1')
  })

  it('filters by type when type pill is clicked', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockData))
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    // Click "Blood Test" type filter — this triggers a new API call with category
    await userEvent.click(screen.getByRole('button', { name: 'Blood Test' }))

    // The fetch should be called again with category=blood_test
    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const lastCallUrl = calls[calls.length - 1][0] as string
      expect(lastCallUrl).toContain('category=blood_test')
    })
  })

  it('filters by status client-side', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockData))
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getAllByTestId('report-card')).toHaveLength(2)
    })

    // Click "Verified" status filter — client-side only
    await userEvent.click(screen.getByRole('button', { name: 'Verified' }))

    // Only the verified report should show
    await waitFor(() => {
      expect(screen.getAllByTestId('report-card')).toHaveLength(1)
    })
    expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    expect(screen.queryByText('Chest X-Ray')).not.toBeInTheDocument()
  })

  it('renders pagination info', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockData))
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('pagination-info')).toBeInTheDocument()
    })
    expect(screen.getByTestId('pagination-info').textContent).toBe(
      'Showing 1–2 of 2',
    )
  })

  it('opens delete confirmation dialog', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockData))
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    // Click delete button on first card
    const deleteButtons = screen.getAllByLabelText('Delete report')
    await userEvent.click(deleteButtons[0])

    // Dialog should appear
    await waitFor(() => {
      expect(screen.getByText('Delete Report')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/permanently removed/),
    ).toBeInTheDocument()
  })

  it('confirms delete and sends DELETE request', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockData))
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    // Open delete dialog
    await userEvent.click(screen.getAllByLabelText('Delete report')[0])
    await waitFor(() => {
      expect(screen.getByText('Delete Report')).toBeInTheDocument()
    })

    // Reset fetch to track delete call
    mockFetch.mockResolvedValue(jsonResponse(null, 200))

    // Click Delete confirm button
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    // Should have called fetch with DELETE method
    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const deleteCall = calls.find((call) => {
        const url = call[0] as string
        return url.includes('/v1/reports/r1')
      })
      expect(deleteCall).toBeTruthy()
    })
  })

  it('triggers verified download when download button is clicked', async () => {
    const verifiedData = {
      reportId: 'r1',
      objectKey: 'uploads/r1.pdf',
      downloadUrl: 'https://example.com/download',
      expiresAt: '2025-12-31T00:00:00Z',
      checksumSha256: 'ABC123',
      isServerVerified: true,
    }
    mockFetch.mockResolvedValue(jsonResponse(mockData))

    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValue(jsonResponse(verifiedData))

    // Click download button on first card
    await userEvent.click(screen.getAllByLabelText('Download report')[0])

    // Should call downloadAndVerify with the URL and checksum
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

  it('changes page size and resets page', async () => {
    const paginatedData: ReportListResponse = {
      ...mockData,
      totalCount: 20,
      totalPages: 3,
    }
    mockFetch.mockResolvedValue(jsonResponse(paginatedData))
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('pagination-info')).toBeInTheDocument()
    })

    // Change page size
    const select = screen.getByLabelText('Reports per page')
    await userEvent.selectOptions(select, '18')

    // Fetch should be called with new pageSize
    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const lastCallUrl = calls[calls.length - 1][0] as string
      expect(lastCallUrl).toContain('pageSize=18')
    })
  })

  it('resets page to 1 when search changes', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockData))
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    // Type in search — should reset page
    await userEvent.type(screen.getByLabelText('Search reports'), 'blood')

    // The page should be reset (page=1 in the fetch call)
    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const lastCallUrl = calls[calls.length - 1][0] as string
      expect(lastCallUrl).toContain('page=1')
    })
  })

  it('closes delete dialog when cancel is clicked', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockData))
    render(<ReportsPage />)

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    })

    // Open delete dialog
    await userEvent.click(screen.getAllByLabelText('Delete report')[0])
    await waitFor(() => {
      expect(screen.getByText('Delete Report')).toBeInTheDocument()
    })

    // Click Cancel
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText(/permanently removed/)).not.toBeInTheDocument()
    })
  })
})
