import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import SettingsPage from './page'
import type { Profile } from '@/types/profile'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockProfile: Profile = {
  id: 'u1',
  name: 'Arjun Kumar',
  email: 'arjun@example.com',
  phone: '9876543210',
  dateOfBirth: '1990-03-15T00:00:00Z',
  bloodGroup: 'B+',
  gender: 'male',
  city: 'Bengaluru',
  aadhaarVerified: false,
  avatarUrl: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-06-01T00:00:00Z',
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('SettingsPage', () => {
  it('shows loading skeleton on initial render', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<SettingsPage />)
    expect(screen.getByTestId('profile-loading')).toBeInTheDocument()
  })

  it('renders profile section heading', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    })
  })

  it('renders profile data after loading', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('Arjun Kumar')).toBeInTheDocument()
    })
    expect(screen.getByText('arjun@example.com')).toBeInTheDocument()
  })

  it('renders avatar with initials', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('AK')).toBeInTheDocument()
    })
  })

  it('shows email field as readonly', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-email-input')).toHaveAttribute('readonly')
    })
  })

  it('populates form fields from profile data', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-name-input')).toHaveValue('Arjun Kumar')
    })
    expect(screen.getByTestId('profile-phone-input')).toHaveValue('9876543210')
    expect(screen.getByTestId('profile-dob-input')).toHaveValue('1990-03-15')
    expect(screen.getByTestId('profile-blood-group-select')).toHaveValue('B+')
    expect(screen.getByTestId('profile-gender-select')).toHaveValue('male')
    expect(screen.getByTestId('profile-city-input')).toHaveValue('Bengaluru')
  })

  it('shows Aadhaar not verified badge when unverified', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-not-verified')).toBeInTheDocument()
    })
    expect(screen.getByText('Not Verified')).toBeInTheDocument()
  })

  it('shows Aadhaar verified badge when verified', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ ...mockProfile, aadhaarVerified: true }),
    )
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-verified')).toBeInTheDocument()
    })
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('renders consents placeholder section', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Data Consents' })).toBeInTheDocument()
    })
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Research')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
    expect(screen.getByText('Third-party Sharing')).toBeInTheDocument()
  })

  it('renders notifications placeholder section', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument()
    })
    expect(screen.getByText('Push notifications')).toBeInTheDocument()
    expect(screen.getByText('Email notifications')).toBeInTheDocument()
    expect(screen.getByText('SMS notifications')).toBeInTheDocument()
  })

  it('renders account section with sign out', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument()
    })
    expect(screen.getByTestId('sign-out-button')).toBeInTheDocument()
    expect(screen.getByText('Aarogya v0.1.0')).toBeInTheDocument()
  })

  it('enables Save Changes button when form is edited', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-name-input')).toHaveValue('Arjun Kumar')
    })

    const saveButton = screen.getByTestId('profile-save-button')
    expect(saveButton).toBeDisabled()

    await userEvent.clear(screen.getByTestId('profile-name-input'))
    await userEvent.type(screen.getByTestId('profile-name-input'), 'Arjun K')

    expect(saveButton).not.toBeDisabled()
  })

  it('submits profile update with PUT request', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-name-input')).toHaveValue('Arjun Kumar')
    })

    await userEvent.clear(screen.getByTestId('profile-name-input'))
    await userEvent.type(screen.getByTestId('profile-name-input'), 'Arjun Patel')

    mockFetch.mockResolvedValue(
      jsonResponse({ ...mockProfile, name: 'Arjun Patel' }),
    )
    await userEvent.click(screen.getByTestId('profile-save-button'))

    await waitFor(() => {
      const calls = mockFetch.mock.calls
      const putCall = calls.find((call) => {
        const opts = call[1] as RequestInit | undefined
        return opts?.method === 'PUT'
      })
      expect(putCall).toBeTruthy()
    })
  })

  it('shows validation error for empty name', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-name-input')).toHaveValue('Arjun Kumar')
    })

    await userEvent.clear(screen.getByTestId('profile-name-input'))
    await userEvent.click(screen.getByTestId('profile-save-button'))

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid phone', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-phone-input')).toHaveValue('9876543210')
    })

    await userEvent.clear(screen.getByTestId('profile-phone-input'))
    await userEvent.type(screen.getByTestId('profile-phone-input'), '1234567890')
    await userEvent.click(screen.getByTestId('profile-save-button'))

    await waitFor(() => {
      expect(screen.getByText('Must be a valid 10-digit Indian mobile number')).toBeInTheDocument()
    })
  })

  it('opens sign out confirmation dialog', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockProfile))
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('sign-out-button')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('sign-out-button'))

    await waitFor(() => {
      expect(
        screen.getByText(/You will need to log in again/),
      ).toBeInTheDocument()
    })
  })
})
