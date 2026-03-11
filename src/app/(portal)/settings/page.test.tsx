import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import SettingsPage from './page'
import type { Profile } from '@/types/profile'
import type { ConsentListResponse } from '@/types/consent'
import type { NotificationPreferences } from '@/types/notification'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

vi.mock('@/lib/fcm', () => ({
  requestPushPermission: vi.fn().mockResolvedValue({ status: 'denied' }),
}))

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockProfile: Profile = {
  sub: 'u1',
  firstName: 'Arjun',
  lastName: 'Kumar',
  email: 'arjun@example.com',
  phone: '9876543210',
  dateOfBirth: '1990-03-15T00:00:00Z',
  bloodGroup: 'B+',
  gender: 'male',
  address: 'Bengaluru',
  aadhaarVerified: false,
  registrationStatus: 'approved',
  roles: ['patient'],
}

const mockConsents: ConsentListResponse = {
  items: [
    { id: 'c1', purpose: 'analytics', granted: true, updatedAt: '2025-06-01T00:00:00Z' },
    { id: 'c2', purpose: 'marketing', granted: false, updatedAt: '2025-05-15T00:00:00Z' },
    { id: 'c3', purpose: 'data-sharing', granted: true, updatedAt: '2025-04-20T00:00:00Z' },
    { id: 'c4', purpose: 'research', granted: false, updatedAt: '2025-03-10T00:00:00Z' },
  ],
}

const mockNotificationPrefs: NotificationPreferences = {
  push: {
    enabled: false,
    categories: {
      'report-processed': false,
      'access-activity': false,
      'emergency-alerts': false,
      'system-updates': false,
    },
  },
  email: {
    enabled: true,
    categories: {
      'report-processed': true,
      'access-activity': true,
      'emergency-alerts': true,
      'system-updates': false,
    },
  },
  sms: {
    enabled: false,
    categories: {
      'report-processed': false,
      'access-activity': false,
      'emergency-alerts': false,
      'system-updates': false,
    },
  },
  updatedAt: '2025-06-01T00:00:00Z',
}

function setupFetchMock(overrides?: {
  profile?: Profile
  consents?: ConsentListResponse
  notifications?: NotificationPreferences
}) {
  const profile = overrides?.profile ?? mockProfile
  const consents = overrides?.consents ?? mockConsents
  const notifications = overrides?.notifications ?? mockNotificationPrefs
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('/v1/consents')) return Promise.resolve(jsonResponse(consents))
    if (url.includes('/v1/notification-preferences')) return Promise.resolve(jsonResponse(notifications))
    return Promise.resolve(jsonResponse(profile))
  })
}

let originalNotification: typeof globalThis.Notification

beforeEach(() => {
  mockFetch.mockReset()
  originalNotification = globalThis.Notification
  Object.defineProperty(globalThis, 'Notification', {
    value: { permission: 'default', requestPermission: vi.fn() },
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  Object.defineProperty(globalThis, 'Notification', {
    value: originalNotification,
    writable: true,
    configurable: true,
  })
})

describe('SettingsPage', () => {
  it('shows loading skeleton on initial render', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<SettingsPage />)
    expect(screen.getByTestId('profile-loading')).toBeInTheDocument()
  })

  it('renders profile section heading', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
    })
  })

  it('renders profile data after loading', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('Arjun Kumar')).toBeInTheDocument()
    })
    expect(screen.getByText('arjun@example.com')).toBeInTheDocument()
  })

  it('renders avatar with initials', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('AK')).toBeInTheDocument()
    })
  })

  it('shows email field as readonly', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-email-input')).toHaveAttribute('readonly')
    })
  })

  it('populates form fields from profile data', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-first-name-input')).toHaveValue('Arjun')
    })
    expect(screen.getByTestId('profile-last-name-input')).toHaveValue('Kumar')
    expect(screen.getByTestId('profile-phone-input')).toHaveValue('9876543210')
    expect(screen.getByTestId('profile-dob-input')).toHaveValue('1990-03-15')
    expect(screen.getByTestId('profile-blood-group-select')).toHaveValue('B+')
    expect(screen.getByTestId('profile-gender-select')).toHaveValue('male')
    expect(screen.getByTestId('profile-address-input')).toHaveValue('Bengaluru')
  })

  it('shows Aadhaar not verified badge when unverified', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-not-verified')).toBeInTheDocument()
    })
    expect(screen.getByText('Not Verified')).toBeInTheDocument()
  })

  it('shows Aadhaar verified badge when verified', async () => {
    setupFetchMock({ profile: { ...mockProfile, aadhaarVerified: true } })
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('aadhaar-verified')).toBeInTheDocument()
    })
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('renders consents section with toggle rows', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('Data Processing (Analytics)')).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Data Consents' })).toBeInTheDocument()
    expect(screen.getByText('Marketing Communications')).toBeInTheDocument()
    expect(screen.getByText('Third-party Data Sharing')).toBeInTheDocument()
    expect(screen.getByText('Research Participation')).toBeInTheDocument()
  })

  it('renders notifications section with channel toggles', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByText('Push Notifications')).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument()
    expect(screen.getByText('Email Notifications')).toBeInTheDocument()
    expect(screen.getByText('SMS Notifications')).toBeInTheDocument()
  })

  it('renders account section with sign out', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument()
    })
    expect(screen.getByTestId('sign-out-button')).toBeInTheDocument()
    expect(screen.getByText('Aarogya v0.1.0')).toBeInTheDocument()
  })

  it('enables Save Changes button when form is edited', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-first-name-input')).toHaveValue('Arjun')
    })

    const saveButton = screen.getByTestId('profile-save-button')
    expect(saveButton).toBeDisabled()

    await userEvent.clear(screen.getByTestId('profile-first-name-input'))
    await userEvent.type(screen.getByTestId('profile-first-name-input'), 'Vikram')

    expect(saveButton).not.toBeDisabled()
  })

  it('submits profile update with PUT request', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-first-name-input')).toHaveValue('Arjun')
    })

    await userEvent.clear(screen.getByTestId('profile-first-name-input'))
    await userEvent.type(screen.getByTestId('profile-first-name-input'), 'Vikram')

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/v1/consents')) return Promise.resolve(jsonResponse(mockConsents))
      if (url.includes('/v1/notification-preferences')) return Promise.resolve(jsonResponse(mockNotificationPrefs))
      return Promise.resolve(jsonResponse({ ...mockProfile, firstName: 'Vikram' }))
    })
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

  it('shows validation error for empty first name', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('profile-first-name-input')).toHaveValue('Arjun')
    })

    await userEvent.clear(screen.getByTestId('profile-first-name-input'))
    await userEvent.click(screen.getByTestId('profile-save-button'))

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid phone', async () => {
    setupFetchMock()
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

  it('opens Aadhaar verify dialog when clicking Verify Aadhaar', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('verify-aadhaar-button')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('verify-aadhaar-button'))

    await waitFor(() => {
      expect(
        screen.getByText('Enter your Aadhaar details to verify your identity.'),
      ).toBeInTheDocument()
    })
  })

  it('opens sign out confirmation dialog', async () => {
    setupFetchMock()
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

  it('renders deletion section', async () => {
    setupFetchMock()
    render(<SettingsPage />)

    await waitFor(() => {
      expect(screen.getByTestId('deletion-section')).toBeInTheDocument()
    })
    expect(screen.getByTestId('delete-account-button')).toBeInTheDocument()
  })
})
