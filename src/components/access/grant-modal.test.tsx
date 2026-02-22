import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { GrantModal } from './grant-modal'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockDoctors = {
  items: [
    {
      id: 'doc1',
      name: 'Dr. Arun Mehta',
      specialisation: 'Orthopedic',
      registrationNumber: 'MH12345',
    },
    {
      id: 'doc2',
      name: 'Dr. Priya Sharma',
      specialisation: 'Cardiologist',
      registrationNumber: 'MH67890',
    },
  ],
}

const mockReports = {
  items: [
    {
      id: 'r1',
      title: 'Complete Blood Count',
      reportType: 'lab',
      status: 'verified',
      reportDate: '2025-01-15T00:00:00Z',
      labName: 'Thyrocare',
      doctorName: null,
      notes: null,
      highlightParameter: null,
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 'r2',
      title: 'Chest X-Ray',
      reportType: 'imaging',
      status: 'verified',
      reportDate: '2025-02-10T00:00:00Z',
      labName: null,
      doctorName: null,
      notes: null,
      highlightParameter: null,
      createdAt: '2025-02-10T10:00:00Z',
      updatedAt: '2025-02-10T10:00:00Z',
    },
  ],
  page: 1,
  pageSize: 100,
  totalCount: 2,
  totalPages: 1,
}

beforeEach(() => {
  mockFetch.mockReset()
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/v1/doctors/search')) return Promise.resolve(jsonResponse(mockDoctors))
    if (url.includes('/v1/reports')) return Promise.resolve(jsonResponse(mockReports))
    return Promise.resolve(jsonResponse({}))
  })
})

describe('GrantModal', () => {
  it('renders modal title and subtitle when open', () => {
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
    )
    expect(screen.getByText('Grant Doctor Access')).toBeInTheDocument()
    expect(
      screen.getByText('Search for a doctor and choose which reports to share.'),
    ).toBeInTheDocument()
  })

  it('shows search input on initial open', () => {
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
    )
    expect(screen.getByPlaceholderText('Search by name or ID...')).toBeInTheDocument()
  })

  it('shows step 1 label', () => {
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
    )
    expect(screen.getByText(/step 1/i)).toBeInTheDocument()
  })

  it('shows doctor search results after typing', async () => {
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
    )

    const searchInput = screen.getByPlaceholderText('Search by name or ID...')
    await userEvent.type(searchInput, 'Dr. Ar')

    await waitFor(() => {
      expect(screen.getByText('Dr. Arun Mehta')).toBeInTheDocument()
    })
    expect(screen.getAllByTestId('doctor-search-result')).toHaveLength(2)
  })

  it('shows report selection after selecting a doctor', async () => {
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
    )

    await userEvent.type(screen.getByPlaceholderText('Search by name or ID...'), 'Dr. Ar')

    await waitFor(() => {
      expect(screen.getByText('Dr. Arun Mehta')).toBeInTheDocument()
    })

    // Select the doctor
    const selectButtons = screen.getAllByRole('button', { name: 'Select' })
    await userEvent.click(selectButtons[0])

    // Should show report selection
    await waitFor(() => {
      expect(screen.getByText(/step 2/i)).toBeInTheDocument()
    })
    expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    expect(screen.getByText('Chest X-Ray')).toBeInTheDocument()
  })

  it('shows duration picker after selecting reports', async () => {
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
    )

    // Search and select doctor
    await userEvent.type(screen.getByPlaceholderText('Search by name or ID...'), 'Dr. Ar')
    await waitFor(() => {
      expect(screen.getByText('Dr. Arun Mehta')).toBeInTheDocument()
    })
    await userEvent.click(screen.getAllByRole('button', { name: 'Select' })[0])

    // Select a report
    await waitFor(() => {
      expect(screen.getAllByTestId('report-checkbox')).toHaveLength(2)
    })
    await userEvent.click(screen.getAllByTestId('report-checkbox')[0])

    // Duration picker should appear
    await waitFor(() => {
      expect(screen.getByText(/step 3/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: '7 days' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '30 days' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '90 days' })).toBeInTheDocument()
  })

  it('shows Change button after selecting a doctor', async () => {
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
    )

    await userEvent.type(screen.getByPlaceholderText('Search by name or ID...'), 'Dr. Ar')
    await waitFor(() => {
      expect(screen.getByText('Dr. Arun Mehta')).toBeInTheDocument()
    })
    await userEvent.click(screen.getAllByRole('button', { name: 'Select' })[0])

    expect(screen.getByRole('button', { name: /change doctor/i })).toBeInTheDocument()
  })

  it('calls onSubmit with correct data on form completion', async () => {
    const onSubmit = vi.fn()
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={onSubmit} />,
    )

    // Step 1: Select doctor
    await userEvent.type(screen.getByPlaceholderText('Search by name or ID...'), 'Dr. Ar')
    await waitFor(() => {
      expect(screen.getByText('Dr. Arun Mehta')).toBeInTheDocument()
    })
    await userEvent.click(screen.getAllByRole('button', { name: 'Select' })[0])

    // Step 2: Select report
    await waitFor(() => {
      expect(screen.getAllByTestId('report-checkbox')).toHaveLength(2)
    })
    await userEvent.click(screen.getAllByTestId('report-checkbox')[0])

    // Step 3: Duration (30 days is default)
    // Submit
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /grant access$/i })).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('button', { name: /grant access$/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        doctorId: 'doc1',
        doctorName: 'Dr. Arun Mehta',
        reportIds: ['r1'],
        expiresAt: expect.any(String),
      }),
    )
  })

  it('does not render modal content when closed', () => {
    render(
      <GrantModal open={false} onClose={vi.fn()} onSubmit={vi.fn()} />,
    )
    expect(screen.queryByText('Grant Doctor Access')).not.toBeInTheDocument()
  })

  it('shows empty message when no reports available', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/v1/doctors/search')) return Promise.resolve(jsonResponse(mockDoctors))
      if (url.includes('/v1/reports')) {
        return Promise.resolve(
          jsonResponse({ items: [], page: 1, pageSize: 100, totalCount: 0, totalPages: 0 }),
        )
      }
      return Promise.resolve(jsonResponse({}))
    })

    render(<GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />)

    await userEvent.type(screen.getByPlaceholderText('Search by name or ID...'), 'Dr. Ar')
    await waitFor(() => {
      expect(screen.getByText('Dr. Arun Mehta')).toBeInTheDocument()
    })
    await userEvent.click(screen.getAllByRole('button', { name: 'Select' })[0])

    await waitFor(() => {
      expect(screen.getByText('No reports available to share.')).toBeInTheDocument()
    })
  })

  it('allows custom duration input', async () => {
    const onSubmit = vi.fn()
    render(<GrantModal open onClose={vi.fn()} onSubmit={onSubmit} />)

    // Step 1: Select doctor
    await userEvent.type(screen.getByPlaceholderText('Search by name or ID...'), 'Dr. Ar')
    await waitFor(() => {
      expect(screen.getByText('Dr. Arun Mehta')).toBeInTheDocument()
    })
    await userEvent.click(screen.getAllByRole('button', { name: 'Select' })[0])

    // Step 2: Select report
    await waitFor(() => {
      expect(screen.getAllByTestId('report-checkbox')).toHaveLength(2)
    })
    await userEvent.click(screen.getAllByTestId('report-checkbox')[0])

    // Step 3: Enter custom duration
    await waitFor(() => {
      expect(screen.getByLabelText('Custom duration in days')).toBeInTheDocument()
    })
    await userEvent.type(screen.getByLabelText('Custom duration in days'), '45')

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /grant access$/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        doctorId: 'doc1',
        reportIds: ['r1'],
      }),
    )
  })

  it('allows selecting a different duration preset', async () => {
    render(<GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />)

    // Step 1: Select doctor
    await userEvent.type(screen.getByPlaceholderText('Search by name or ID...'), 'Dr. Ar')
    await waitFor(() => {
      expect(screen.getByText('Dr. Arun Mehta')).toBeInTheDocument()
    })
    await userEvent.click(screen.getAllByRole('button', { name: 'Select' })[0])

    // Step 2: Select report
    await waitFor(() => {
      expect(screen.getAllByTestId('report-checkbox')).toHaveLength(2)
    })
    await userEvent.click(screen.getAllByTestId('report-checkbox')[0])

    // Step 3: Click 7 days
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '7 days' })).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('button', { name: '7 days' }))

    // Submit button should still be visible
    expect(screen.getByRole('button', { name: /grant access$/i })).toBeInTheDocument()
  })

  it('can deselect a report to remove it', async () => {
    render(<GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />)

    // Step 1: Select doctor
    await userEvent.type(screen.getByPlaceholderText('Search by name or ID...'), 'Dr. Ar')
    await waitFor(() => {
      expect(screen.getByText('Dr. Arun Mehta')).toBeInTheDocument()
    })
    await userEvent.click(screen.getAllByRole('button', { name: 'Select' })[0])

    // Step 2: Select then deselect a report
    await waitFor(() => {
      expect(screen.getAllByTestId('report-checkbox')).toHaveLength(2)
    })
    const firstCheckbox = screen.getAllByTestId('report-checkbox')[0]
    await userEvent.click(firstCheckbox)

    // Duration should appear
    await waitFor(() => {
      expect(screen.getByText(/step 3/i)).toBeInTheDocument()
    })

    // Deselect
    await userEvent.click(firstCheckbox)

    // Duration should disappear (no reports selected)
    await waitFor(() => {
      expect(screen.queryByText(/step 3/i)).not.toBeInTheDocument()
    })
  })

  it('resets state when dialog is closed', async () => {
    const onClose = vi.fn()
    render(<GrantModal open onClose={onClose} onSubmit={vi.fn()} />)

    // Type in search
    await userEvent.type(screen.getByPlaceholderText('Search by name or ID...'), 'Dr. Ar')
    await waitFor(() => {
      expect(screen.getByText('Dr. Arun Mehta')).toBeInTheDocument()
    })

    // Select doctor
    await userEvent.click(screen.getAllByRole('button', { name: 'Select' })[0])
    expect(screen.getByRole('button', { name: /change doctor/i })).toBeInTheDocument()
  })
})
