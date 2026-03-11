import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import EmergencyPage from './page'
import type { EmergencyContactListResponse } from '@/types/emergency'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const contact1 = {
  id: 'ec1',
  name: 'Priya Sharma',
  phone: '9876543210',
  relationship: 'spouse' as const,
  isPrimary: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

const contact2 = {
  id: 'ec2',
  name: 'Rajesh Kumar',
  phone: '9123456789',
  relationship: 'parent' as const,
  isPrimary: false,
  createdAt: '2025-01-05T00:00:00Z',
  updatedAt: '2025-01-05T00:00:00Z',
}

const contact3 = {
  id: 'ec3',
  name: 'Anita Desai',
  phone: '8765432109',
  relationship: 'sibling' as const,
  isPrimary: false,
  createdAt: '2025-01-10T00:00:00Z',
  updatedAt: '2025-01-10T00:00:00Z',
}

const mockContacts: EmergencyContactListResponse = {
  items: [contact1, contact2],
}

const fullContacts: EmergencyContactListResponse = {
  items: [contact1, contact2, contact3],
}

const emptyContacts: EmergencyContactListResponse = {
  items: [],
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('EmergencyPage', () => {
  it('shows loading skeleton on initial render', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<EmergencyPage />)
    expect(screen.getByTestId('emergency-loading')).toBeInTheDocument()
  })

  it('renders page heading and Add Contact button', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockContacts))
    render(<EmergencyPage />)

    expect(screen.getByRole('heading', { name: 'Emergency Contacts' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add contact/i })).toBeInTheDocument()
  })

  it('renders contact cards after loading', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
    })
    expect(screen.getByText('Rajesh Kumar')).toBeInTheDocument()
    expect(screen.getAllByTestId('contact-card')).toHaveLength(2)
  })

  it('shows callout banner when contacts exist', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(
        screen.getByText(/emergency medical profile/),
      ).toBeInTheDocument()
    })
  })

  it('shows empty state when no contacts exist', async () => {
    mockFetch.mockResolvedValue(jsonResponse(emptyContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(screen.getByText('No emergency contacts')).toBeInTheDocument()
    })
    expect(
      screen.getByText('Add people who should be contacted in case of emergency'),
    ).toBeInTheDocument()
  })

  it('shows dashed add-card with remaining count', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(screen.getByTestId('add-contact-card')).toBeInTheDocument()
    })
    expect(screen.getByText(/1 remaining/)).toBeInTheDocument()
  })

  it('hides dashed add-card when at limit', async () => {
    mockFetch.mockResolvedValue(jsonResponse(fullContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('add-contact-card')).not.toBeInTheDocument()
  })

  it('shows maximum contacts hint', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(screen.getByText(/maximum 3 emergency contacts/i)).toBeInTheDocument()
    })
  })

  it('opens add modal when Add Contact button is clicked', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /add contact/i }))

    await waitFor(() => {
      expect(screen.getByText('Add Emergency Contact')).toBeInTheDocument()
    })
  })

  it('opens add modal from empty state CTA', async () => {
    mockFetch.mockResolvedValue(jsonResponse(emptyContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(screen.getByText('No emergency contacts')).toBeInTheDocument()
    })

    const buttons = screen.getAllByRole('button', { name: /add contact/i })
    await userEvent.click(buttons[buttons.length - 1])

    await waitFor(() => {
      expect(screen.getByText('Add Emergency Contact')).toBeInTheDocument()
    })
  })

  it('opens add modal from dashed card', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(screen.getByTestId('add-contact-card')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('add-contact-card'))

    await waitFor(() => {
      expect(screen.getByText('Add Emergency Contact')).toBeInTheDocument()
    })
  })

  it('opens edit modal when Edit is clicked on a contact', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /edit priya sharma/i }))

    await waitFor(() => {
      expect(screen.getByText('Edit Emergency Contact')).toBeInTheDocument()
    })
    expect(screen.getByPlaceholderText('Enter full name')).toHaveValue('Priya Sharma')
  })

  it('opens delete dialog when Remove is clicked', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /remove priya sharma/i }))

    await waitFor(() => {
      expect(screen.getByText('Remove Contact')).toBeInTheDocument()
    })
    expect(
      screen.getByText(/will no longer be listed/),
    ).toBeInTheDocument()
  })

  it('confirms delete and sends DELETE request', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /remove priya sharma/i }))
    await waitFor(() => {
      expect(screen.getByText('Remove Contact')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValue(jsonResponse(null, 200))
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))

    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const deleteCall = calls.find((call) => {
        const url = call[0] as string
        return url.includes('/v1/emergency-contacts/ec1')
      })
      expect(deleteCall).toBeTruthy()
    })
  })

  it('closes delete dialog when Cancel is clicked', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /remove priya sharma/i }))
    await waitFor(() => {
      expect(screen.getByText('Remove Contact')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByText(/will no longer be listed/)).not.toBeInTheDocument()
    })
  })

  it('submits add form with POST request', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockContacts))
    render(<EmergencyPage />)

    await waitFor(() => {
      expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /add contact/i }))
    await waitFor(() => {
      expect(screen.getByText('Add Emergency Contact')).toBeInTheDocument()
    })

    await userEvent.type(screen.getByPlaceholderText('Enter full name'), 'New Person')
    await userEvent.type(screen.getByPlaceholderText('Enter phone number'), '9999988888')

    mockFetch.mockResolvedValue(
      jsonResponse({
        id: 'ec-new',
        name: 'New Person',
        phone: '9999988888',
        relationship: 'spouse',
        isPrimary: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save Contact' }))

    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const postCall = calls.find((call) => {
        const opts = call[1] as RequestInit | undefined
        return opts?.method === 'POST'
      })
      expect(postCall).toBeTruthy()
    })
  })
})
