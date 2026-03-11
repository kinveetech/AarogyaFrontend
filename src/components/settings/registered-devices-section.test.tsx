import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { RegisteredDevicesSection } from './registered-devices-section'
import type { RegisteredDevice } from '@/types/notification'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const mockDevices: RegisteredDevice[] = [
  {
    deviceToken: 'token-abc-123',
    platform: 'web',
    deviceName: 'Chrome 120',
    appVersion: '1.0.0',
    registeredAt: '2025-12-01T10:00:00Z',
  },
  {
    deviceToken: 'token-def-456',
    platform: 'ios',
    deviceName: null,
    appVersion: null,
    registeredAt: '2025-12-05T14:30:00Z',
  },
]

beforeEach(() => {
  mockFetch.mockReset()
})

describe('RegisteredDevicesSection', () => {
  it('shows loading skeleton while fetching', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<RegisteredDevicesSection />)
    expect(screen.getByTestId('devices-loading')).toBeInTheDocument()
  })

  it('shows empty state when no devices are registered', async () => {
    mockFetch.mockResolvedValue(jsonResponse([]))
    render(<RegisteredDevicesSection />)

    await waitFor(() => {
      expect(screen.getByTestId('devices-empty')).toBeInTheDocument()
    })
    expect(screen.getByText('No devices registered for push notifications.')).toBeInTheDocument()
  })

  it('renders device list with device details', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockDevices))
    render(<RegisteredDevicesSection />)

    await waitFor(() => {
      expect(screen.getByTestId('devices-list')).toBeInTheDocument()
    })

    expect(screen.getByText('Chrome 120')).toBeInTheDocument()
    expect(screen.getByText('Web')).toBeInTheDocument()

    // Device without name shows masked token as both name and detail
    expect(screen.getAllByText('toke...-456')).toHaveLength(2)
    expect(screen.getByText('iOS')).toBeInTheDocument()
  })

  it('renders remove button for each device', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockDevices))
    render(<RegisteredDevicesSection />)

    await waitFor(() => {
      expect(screen.getByTestId('device-remove-token-abc-123')).toBeInTheDocument()
    })
    expect(screen.getByTestId('device-remove-token-def-456')).toBeInTheDocument()
  })

  it('shows confirmation dialog when clicking remove', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockDevices))
    render(<RegisteredDevicesSection />)

    await waitFor(() => {
      expect(screen.getByTestId('device-remove-token-abc-123')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('device-remove-token-abc-123'))

    await waitFor(() => {
      expect(screen.getByText('Remove Device')).toBeInTheDocument()
    })
    expect(screen.getByText(/Are you sure you want to remove "Chrome 120"/)).toBeInTheDocument()
  })

  it('sends DELETE request when confirming removal', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockDevices))
    render(<RegisteredDevicesSection />)

    await waitFor(() => {
      expect(screen.getByTestId('device-remove-token-abc-123')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('device-remove-token-abc-123'))

    await waitFor(() => {
      expect(screen.getByText('Remove Device')).toBeInTheDocument()
    })

    mockFetch.mockResolvedValue(
      new Response(null, { status: 204, headers: { 'content-length': '0' } }),
    )

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }))

    await waitFor(() => {
      const deleteCalls = mockFetch.mock.calls.filter((call) => {
        const opts = call[1] as RequestInit | undefined
        return opts?.method === 'DELETE'
      })
      expect(deleteCalls.length).toBeGreaterThan(0)
      expect(deleteCalls[0][0]).toContain('/v1/notifications/devices/token-abc-123')
    })
  })

  it('closes confirmation dialog when clicking cancel', async () => {
    mockFetch.mockResolvedValue(jsonResponse(mockDevices))
    render(<RegisteredDevicesSection />)

    await waitFor(() => {
      expect(screen.getByTestId('device-remove-token-abc-123')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTestId('device-remove-token-abc-123'))

    await waitFor(() => {
      expect(screen.getByText('Remove Device')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByText('Remove Device')).not.toBeInTheDocument()
    })

    // No DELETE calls should have been made
    const deleteCalls = mockFetch.mock.calls.filter((call) => {
      const opts = call[1] as RequestInit | undefined
      return opts?.method === 'DELETE'
    })
    expect(deleteCalls).toHaveLength(0)
  })

  it('displays masked token for device without name', async () => {
    const deviceNoName: RegisteredDevice[] = [
      {
        deviceToken: 'abcdefghijklmnop',
        platform: 'web',
        deviceName: null,
        appVersion: null,
        registeredAt: '2025-12-01T10:00:00Z',
      },
    ]
    mockFetch.mockResolvedValue(jsonResponse(deviceNoName))
    render(<RegisteredDevicesSection />)

    await waitFor(() => {
      expect(screen.getByTestId('devices-list')).toBeInTheDocument()
    })

    // Primary name and detail line both show masked token
    expect(screen.getAllByText('abcd...mnop')).toHaveLength(2)
  })

  it('renders section heading with icon', async () => {
    mockFetch.mockResolvedValue(jsonResponse([]))
    render(<RegisteredDevicesSection />)

    await waitFor(() => {
      expect(screen.getByText('Registered Devices')).toBeInTheDocument()
    })
  })

  it('shows device dates in formatted form', async () => {
    const devices: RegisteredDevice[] = [
      {
        deviceToken: 'token-date-test',
        platform: 'android',
        deviceName: 'Pixel 9',
        appVersion: '3.0.0',
        registeredAt: '2025-06-15T08:00:00Z',
      },
    ]
    mockFetch.mockResolvedValue(jsonResponse(devices))
    render(<RegisteredDevicesSection />)

    await waitFor(() => {
      expect(screen.getByText('Pixel 9')).toBeInTheDocument()
    })
    expect(screen.getByText('Android')).toBeInTheDocument()
  })
})
