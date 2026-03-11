import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { DataExportSection } from './data-export-section'
import type { DataExportResponse } from '@/types/data-export'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockExportResponse: DataExportResponse = {
  id: 'export-1',
  status: 'pending',
  requestedAt: '2026-03-11T10:00:00Z',
  completedAt: null,
  downloadUrl: null,
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('DataExportSection', () => {
  it('renders section heading', () => {
    render(<DataExportSection />)
    expect(
      screen.getByRole('heading', { name: 'Export My Data' }),
    ).toBeInTheDocument()
  })

  it('renders description text', () => {
    render(<DataExportSection />)
    expect(
      screen.getByText(/Request a copy of all your health records/),
    ).toBeInTheDocument()
  })

  it('renders export button', () => {
    render(<DataExportSection />)
    expect(screen.getByTestId('export-data-button')).toBeInTheDocument()
    expect(screen.getByTestId('export-data-button')).toHaveTextContent(
      'Request Data Export',
    )
  })

  it('export button is enabled initially', () => {
    render(<DataExportSection />)
    expect(screen.getByTestId('export-data-button')).not.toBeDisabled()
  })

  it('opens confirmation dialog on button click', async () => {
    render(<DataExportSection />)

    await userEvent.click(screen.getByTestId('export-data-button'))

    await waitFor(() => {
      expect(
        screen.getByText(/This will request an export of all your health records/),
      ).toBeInTheDocument()
    })
  })

  it('closes dialog when cancel is clicked', async () => {
    render(<DataExportSection />)

    await userEvent.click(screen.getByTestId('export-data-button'))
    await waitFor(() => {
      expect(
        screen.getByText(/This will request an export of all your health records/),
      ).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(
        screen.queryByText(/This will request an export of all your health records/),
      ).not.toBeInTheDocument()
    })
  })

  it('triggers export on confirm and shows success message', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockExportResponse))

    render(<DataExportSection />)

    await userEvent.click(screen.getByTestId('export-data-button'))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Export' })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Request Export' }))

    await waitFor(() => {
      expect(screen.getByTestId('export-success-message')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/Your data export has been requested/),
    ).toBeInTheDocument()
  })

  it('disables button after successful export', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockExportResponse))

    render(<DataExportSection />)

    await userEvent.click(screen.getByTestId('export-data-button'))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Export' })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Request Export' }))

    await waitFor(() => {
      expect(screen.getByTestId('export-data-button')).toBeDisabled()
    })
    expect(screen.getByTestId('export-data-button')).toHaveTextContent(
      'Export Requested',
    )
  })

  it('shows error message on API failure', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Server Error' }, 500))

    render(<DataExportSection />)

    await userEvent.click(screen.getByTestId('export-data-button'))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Export' })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Request Export' }))

    await waitFor(() => {
      expect(screen.getByTestId('export-error-message')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/Failed to request data export/),
    ).toBeInTheDocument()
  })

  it('keeps button enabled after error so user can retry', async () => {
    mockFetch.mockResolvedValue(jsonResponse({ message: 'Server Error' }, 500))

    render(<DataExportSection />)

    await userEvent.click(screen.getByTestId('export-data-button'))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Request Export' })).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Request Export' }))

    await waitFor(() => {
      expect(screen.getByTestId('export-error-message')).toBeInTheDocument()
    })

    expect(screen.getByTestId('export-data-button')).not.toBeDisabled()
  })

  it('renders within a glass card container', () => {
    render(<DataExportSection />)
    expect(screen.getByTestId('data-export-section')).toBeInTheDocument()
  })

  it('dialog has correct title', async () => {
    render(<DataExportSection />)

    await userEvent.click(screen.getByTestId('export-data-button'))

    await waitFor(() => {
      expect(
        screen.getAllByText('Export My Data').length,
      ).toBeGreaterThanOrEqual(2)
    })
  })
})
