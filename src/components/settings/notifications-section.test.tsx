import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { NotificationsSection } from './notifications-section'
import type { NotificationPreferences } from '@/types/notification'

const mockRequestPushPermission = vi.fn()
vi.mock('@/lib/fcm', () => ({
  requestPushPermission: (...args: unknown[]) => mockRequestPushPermission(...args),
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockPrefs: NotificationPreferences = {
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

let originalNotification: typeof globalThis.Notification

beforeEach(() => {
  mockFetch.mockReset()
  mockRequestPushPermission.mockReset()
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

describe('NotificationsSection', () => {
  it('shows loading skeleton while fetching', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<NotificationsSection />)
    expect(screen.getByTestId('notifications-loading')).toBeInTheDocument()
  })

  it('renders channel toggles after loading', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByText('Push Notifications')).toBeInTheDocument()
    })
    expect(screen.getByText('Email Notifications')).toBeInTheDocument()
    expect(screen.getByText('SMS Notifications')).toBeInTheDocument()
  })

  it('renders per-category toggles for each channel', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-channel-push')).toBeInTheDocument()
    })

    expect(screen.getByTestId('notification-category-push-report-processed')).toBeInTheDocument()
    expect(screen.getByTestId('notification-category-push-access-activity')).toBeInTheDocument()
    expect(screen.getByTestId('notification-category-push-emergency-alerts')).toBeInTheDocument()
    expect(screen.getByTestId('notification-category-push-system-updates')).toBeInTheDocument()

    expect(screen.getByTestId('notification-category-email-report-processed')).toBeInTheDocument()
    expect(screen.getByTestId('notification-category-sms-report-processed')).toBeInTheDocument()
  })

  it('disables category switches when channel is off', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-channel-push')).toBeInTheDocument()
    })

    // Push is off, so its category switches should be disabled
    const pushCategorySwitch = screen.getByTestId('notification-category-switch-push-report-processed')
    expect(pushCategorySwitch).toHaveAttribute('data-disabled', '')

    // Email is on, so its category switches should be enabled
    const emailCategorySwitch = screen.getByTestId('notification-category-switch-email-report-processed')
    expect(emailCategorySwitch).not.toHaveAttribute('data-disabled')
  })

  it('requests push permission when enabling push channel', async () => {
    mockRequestPushPermission.mockResolvedValue({ status: 'granted', token: 'fcm-token-123' })
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-switch-push')).toBeInTheDocument()
    })

    // Enable push channel
    mockFetch.mockResolvedValue(jsonResponse({ ...mockPrefs, push: { enabled: true, categories: mockPrefs.push.categories } }))
    await userEvent.click(screen.getByTestId('notification-switch-push'))

    await waitFor(() => {
      expect(mockRequestPushPermission).toHaveBeenCalled()
    })
  })

  it('does not enable push if permission is denied', async () => {
    mockRequestPushPermission.mockResolvedValue({ status: 'denied' })
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-switch-push')).toBeInTheDocument()
    })

    const fetchCallCountBefore = mockFetch.mock.calls.length
    await userEvent.click(screen.getByTestId('notification-switch-push'))

    await waitFor(() => {
      expect(mockRequestPushPermission).toHaveBeenCalled()
    })

    // No PUT should have been made
    const putCalls = mockFetch.mock.calls.slice(fetchCallCountBefore).filter((call) => {
      const opts = call[1] as RequestInit | undefined
      return opts?.method === 'PUT'
    })
    expect(putCalls).toHaveLength(0)
  })

  it('registers device token when push permission is granted', async () => {
    mockRequestPushPermission.mockResolvedValue({ status: 'granted', token: 'fcm-token-abc' })
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-switch-push')).toBeInTheDocument()
    })

    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === 'POST' && (url as string).includes('device-token')) {
        return Promise.resolve(new Response(null, { status: 204, headers: { 'content-length': '0' } }))
      }
      return Promise.resolve(jsonResponse({ ...mockPrefs, push: { ...mockPrefs.push, enabled: true } }))
    })

    await userEvent.click(screen.getByTestId('notification-switch-push'))

    await waitFor(() => {
      const postCalls = mockFetch.mock.calls.filter((call) => {
        const url = call[0] as string
        const opts = call[1] as RequestInit | undefined
        return url.includes('device-token') && opts?.method === 'POST'
      })
      expect(postCalls).toHaveLength(1)
      const body = JSON.parse(postCalls[0][1].body as string)
      expect(body.token).toBe('fcm-token-abc')
    })
  })

  it('sets all categories to false when disabling a channel', async () => {
    const prefsWithEmailOn: NotificationPreferences = {
      ...mockPrefs,
      email: {
        enabled: true,
        categories: {
          'report-processed': true,
          'access-activity': true,
          'emergency-alerts': true,
          'system-updates': true,
        },
      },
    }
    mockFetch.mockResolvedValue(jsonResponse(prefsWithEmailOn))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-switch-email')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValue(jsonResponse({
      ...prefsWithEmailOn,
      email: {
        enabled: false,
        categories: {
          'report-processed': false,
          'access-activity': false,
          'emergency-alerts': false,
          'system-updates': false,
        },
      },
    }))

    await userEvent.click(screen.getByTestId('notification-switch-email'))

    await waitFor(() => {
      const putCalls = mockFetch.mock.calls.filter((call) => {
        const opts = call[1] as RequestInit | undefined
        return opts?.method === 'PUT'
      })
      expect(putCalls.length).toBeGreaterThan(0)
      const body = JSON.parse(putCalls[0][1].body as string)
      expect(body.email.enabled).toBe(false)
      expect(body.email.categories['report-processed']).toBe(false)
      expect(body.email.categories['access-activity']).toBe(false)
      expect(body.email.categories['emergency-alerts']).toBe(false)
      expect(body.email.categories['system-updates']).toBe(false)
    })
  })

  it('sends PUT when toggling a single category', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-category-switch-email-system-updates')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValue(jsonResponse({
      ...mockPrefs,
      email: {
        ...mockPrefs.email,
        categories: { ...mockPrefs.email.categories, 'system-updates': true },
      },
    }))

    await userEvent.click(screen.getByTestId('notification-category-switch-email-system-updates'))

    await waitFor(() => {
      const putCalls = mockFetch.mock.calls.filter((call) => {
        const opts = call[1] as RequestInit | undefined
        return opts?.method === 'PUT'
      })
      expect(putCalls.length).toBeGreaterThan(0)
      const body = JSON.parse(putCalls[0][1].body as string)
      expect(body.email.categories['system-updates']).toBe(true)
    })
  })

  it('shows push blocked hint when browser has denied notifications', async () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: { permission: 'denied', requestPermission: vi.fn() },
      writable: true,
      configurable: true,
    })

    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('push-blocked-hint')).toBeInTheDocument()
    })
    expect(screen.getByText('Push notifications are blocked. Enable them in your browser settings.')).toBeInTheDocument()
  })

  it('does not show push blocked hint when permission is not denied', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByText('Push Notifications')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('push-blocked-hint')).not.toBeInTheDocument()
  })
})
