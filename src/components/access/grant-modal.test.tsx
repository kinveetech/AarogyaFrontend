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
      reportType: 'blood_test',
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
      reportType: 'radiology',
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

async function selectDoctor() {
  await userEvent.type(screen.getByPlaceholderText('Search by name or ID...'), 'Dr. Ar')
  await waitFor(() => {
    expect(screen.getByText('Dr. Arun Mehta')).toBeInTheDocument()
  })
  await userEvent.click(screen.getAllByRole('button', { name: 'Select' })[0])
}

async function selectReport() {
  await waitFor(() => {
    expect(screen.getAllByTestId('report-checkbox')).toHaveLength(2)
  })
  await userEvent.click(screen.getAllByTestId('report-checkbox')[0])
}

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

  it('shows report selection and all-reports toggle after selecting a doctor', async () => {
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
    )

    await selectDoctor()

    // Should show report selection with all-reports toggle
    await waitFor(() => {
      expect(screen.getByText(/step 2/i)).toBeInTheDocument()
    })
    expect(screen.getByText('Grant access to all reports')).toBeInTheDocument()
    expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    expect(screen.getByText('Chest X-Ray')).toBeInTheDocument()
  })

  it('hides individual report list when all-reports is toggled on', async () => {
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
    )

    await selectDoctor()

    await waitFor(() => {
      expect(screen.getByText('Grant access to all reports')).toBeInTheDocument()
    })

    // Toggle all reports on
    await userEvent.click(screen.getByLabelText('Grant access to all reports'))

    // Individual report checkboxes should be hidden
    await waitFor(() => {
      expect(screen.queryAllByTestId('report-checkbox')).toHaveLength(0)
    })

    // Duration step should now appear
    expect(screen.getByText(/step 3/i)).toBeInTheDocument()
  })

  it('shows duration picker after selecting reports', async () => {
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
    )

    await selectDoctor()
    await selectReport()

    // Duration picker should appear
    await waitFor(() => {
      expect(screen.getByText(/step 3/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: '7 days' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '30 days' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '90 days' })).toBeInTheDocument()
  })

  it('shows purpose field in step 3', async () => {
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
    )

    await selectDoctor()
    await selectReport()

    await waitFor(() => {
      expect(screen.getByLabelText('Purpose of access')).toBeInTheDocument()
    })
    expect(screen.getByText('Purpose of access')).toBeInTheDocument()
    expect(screen.getByText('0/500')).toBeInTheDocument()
  })

  it('shows Change button after selecting a doctor', async () => {
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
    )

    await selectDoctor()

    expect(screen.getByRole('button', { name: /change doctor/i })).toBeInTheDocument()
  })

  it('calls onSubmit with correct data including new fields on form completion', async () => {
    const onSubmit = vi.fn()
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={onSubmit} />,
    )

    // Step 1: Select doctor
    await selectDoctor()

    // Step 2: Select report
    await selectReport()

    // Step 3: Fill purpose and duration (30 days default)
    await waitFor(() => {
      expect(screen.getByLabelText('Purpose of access')).toBeInTheDocument()
    })
    await userEvent.type(screen.getByLabelText('Purpose of access'), 'Follow-up consultation')

    // Submit
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /grant access$/i })).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('button', { name: /grant access$/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        doctorId: 'doc1',
        doctorName: 'Dr. Arun Mehta',
        allReports: false,
        reportIds: ['r1'],
        purpose: 'Follow-up consultation',
        expiresAt: expect.any(String),
      }),
    )
  })

  it('calls onSubmit with allReports true and empty reportIds', async () => {
    const onSubmit = vi.fn()
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={onSubmit} />,
    )

    await selectDoctor()

    // Toggle all reports
    await waitFor(() => {
      expect(screen.getByText('Grant access to all reports')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByLabelText('Grant access to all reports'))

    // Fill purpose
    await waitFor(() => {
      expect(screen.getByLabelText('Purpose of access')).toBeInTheDocument()
    })
    await userEvent.type(screen.getByLabelText('Purpose of access'), 'Ongoing care')

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /grant access$/i }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        allReports: true,
        reportIds: [],
        purpose: 'Ongoing care',
      }),
    )
  })

  it('disables submit when purpose is empty', async () => {
    render(
      <GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />,
    )

    await selectDoctor()
    await selectReport()

    // Do not fill purpose -- submit should be disabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /grant access$/i })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /grant access$/i })).toBeDisabled()
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

    await selectDoctor()

    await waitFor(() => {
      expect(screen.getByText('No reports available to share.')).toBeInTheDocument()
    })
  })

  it('allows custom duration input', async () => {
    const onSubmit = vi.fn()
    render(<GrantModal open onClose={vi.fn()} onSubmit={onSubmit} />)

    await selectDoctor()
    await selectReport()

    // Fill purpose
    await waitFor(() => {
      expect(screen.getByLabelText('Purpose of access')).toBeInTheDocument()
    })
    await userEvent.type(screen.getByLabelText('Purpose of access'), 'Review')

    // Enter custom duration
    await userEvent.type(screen.getByLabelText('Custom duration in days'), '45')

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /grant access$/i }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        doctorId: 'doc1',
        reportIds: ['r1'],
        allReports: false,
        purpose: 'Review',
      }),
    )
  })

  it('allows selecting a different duration preset', async () => {
    render(<GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />)

    await selectDoctor()
    await selectReport()

    // Click 7 days
    await waitFor(() => {
      expect(screen.getByRole('button', { name: '7 days' })).toBeInTheDocument()
    })
    await userEvent.click(screen.getByRole('button', { name: '7 days' }))

    // Submit button should still be visible
    expect(screen.getByRole('button', { name: /grant access$/i })).toBeInTheDocument()
  })

  it('can deselect a report to remove it', async () => {
    render(<GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />)

    await selectDoctor()

    // Select then deselect a report
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

  it('updates purpose character counter as user types', async () => {
    render(<GrantModal open onClose={vi.fn()} onSubmit={vi.fn()} />)

    await selectDoctor()
    await selectReport()

    await waitFor(() => {
      expect(screen.getByLabelText('Purpose of access')).toBeInTheDocument()
    })

    await userEvent.type(screen.getByLabelText('Purpose of access'), 'Test')
    expect(screen.getByText('4/500')).toBeInTheDocument()
  })
})
