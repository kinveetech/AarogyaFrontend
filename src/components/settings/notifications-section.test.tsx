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
  reportUploaded: {
    push: false,
    email: true,
    sms: false,
  },
  accessGranted: {
    push: false,
    email: true,
    sms: false,
  },
  emergencyAccess: {
    push: false,
    email: true,
    sms: false,
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

  it('renders per-event toggles for each channel', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-channel-push')).toBeInTheDocument()
    })

    expect(screen.getByTestId('notification-event-push-reportUploaded')).toBeInTheDocument()
    expect(screen.getByTestId('notification-event-push-accessGranted')).toBeInTheDocument()
    expect(screen.getByTestId('notification-event-push-emergencyAccess')).toBeInTheDocument()

    expect(screen.getByTestId('notification-event-email-reportUploaded')).toBeInTheDocument()
    expect(screen.getByTestId('notification-event-sms-reportUploaded')).toBeInTheDocument()
  })

  it('shows correct switch states for event-channel combinations', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-channel-push')).toBeInTheDocument()
    })

    // Push is off for reportUploaded (mockPrefs has push: false)
    const pushReportSwitch = screen.getByTestId('notification-event-switch-push-reportUploaded')
    expect(pushReportSwitch).not.toHaveAttribute('data-checked')

    // Email is on for reportUploaded (mockPrefs has email: true)
    const emailReportSwitch = screen.getByTestId('notification-event-switch-email-reportUploaded')
    const emailInput = emailReportSwitch.querySelector('input[type="checkbox"]')
    expect(emailInput).toBeChecked()
  })

  it('requests push permission when enabling push for any event', async () => {
    mockRequestPushPermission.mockResolvedValue({ status: 'granted', token: 'fcm-token-123' })
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-event-switch-push-reportUploaded')).toBeInTheDocument()
    })

    // Enable push for reportUploaded event
    mockFetch.mockResolvedValue(jsonResponse({ ...mockPrefs, reportUploaded: { ...mockPrefs.reportUploaded, push: true } }))
    await userEvent.click(screen.getByTestId('notification-event-switch-push-reportUploaded'))

    await waitFor(() => {
      expect(mockRequestPushPermission).toHaveBeenCalled()
    })
  })

  it('does not enable push if permission is denied', async () => {
    mockRequestPushPermission.mockResolvedValue({ status: 'denied' })
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-event-switch-push-reportUploaded')).toBeInTheDocument()
    })

    const fetchCallCountBefore = mockFetch.mock.calls.length
    await userEvent.click(screen.getByTestId('notification-event-switch-push-reportUploaded'))

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
      expect(screen.getByTestId('notification-event-switch-push-reportUploaded')).toBeInTheDocument()
    })

    mockFetch.mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === 'POST' && (url as string).includes('notifications/devices')) {
        return Promise.resolve(new Response(null, { status: 204, headers: { 'content-length': '0' } }))
      }
      return Promise.resolve(jsonResponse({ ...mockPrefs, reportUploaded: { ...mockPrefs.reportUploaded, push: true } }))
    })

    await userEvent.click(screen.getByTestId('notification-event-switch-push-reportUploaded'))

    await waitFor(() => {
      const postCalls = mockFetch.mock.calls.filter((call) => {
        const url = call[0] as string
        const opts = call[1] as RequestInit | undefined
        return url.includes('notifications/devices') && opts?.method === 'POST'
      })
      expect(postCalls).toHaveLength(1)
      const body = JSON.parse(postCalls[0][1].body as string)
      expect(body.deviceToken).toBe('fcm-token-abc')
    })
  })

  it('updates email preference for specific event', async () => {
    const prefsWithEmailOn: NotificationPreferences = {
      reportUploaded: { push: false, email: true, sms: false },
      accessGranted: { push: false, email: true, sms: false },
      emergencyAccess: { push: false, email: true, sms: false },
      updatedAt: '2025-06-01T00:00:00Z',
    }
    mockFetch.mockResolvedValue(jsonResponse(prefsWithEmailOn))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-event-switch-email-reportUploaded')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValue(jsonResponse({
      ...prefsWithEmailOn,
      reportUploaded: { ...prefsWithEmailOn.reportUploaded, email: false },
    }))

    await userEvent.click(screen.getByTestId('notification-event-switch-email-reportUploaded'))

    await waitFor(() => {
      const putCalls = mockFetch.mock.calls.filter((call) => {
        const opts = call[1] as RequestInit | undefined
        return opts?.method === 'PUT'
      })
      expect(putCalls.length).toBeGreaterThan(0)
      const body = JSON.parse(putCalls[0][1].body as string)
      expect(body.reportUploaded.email).toBe(false)
      expect(body.accessGranted.email).toBe(true)
      expect(body.emergencyAccess.email).toBe(true)
    })
  })

  it('sends PUT when toggling a single event-channel combination', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockPrefs))
    render(<NotificationsSection />)

    await waitFor(() => {
      expect(screen.getByTestId('notification-event-switch-email-reportUploaded')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValue(jsonResponse({
      ...mockPrefs,
      reportUploaded: { ...mockPrefs.reportUploaded, email: false },
    }))

    await userEvent.click(screen.getByTestId('notification-event-switch-email-reportUploaded'))

    await waitFor(() => {
      const putCalls = mockFetch.mock.calls.filter((call) => {
        const opts = call[1] as RequestInit | undefined
        return opts?.method === 'PUT'
      })
      expect(putCalls.length).toBeGreaterThan(0)
      const body = JSON.parse(putCalls[0][1].body as string)
      expect(body.reportUploaded.email).toBe(false)
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
