import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { requestPushPermission } from './push-permission'

const mockGetToken = vi.fn()
const mockGetMessaging = vi.fn()
const mockGetApp = vi.fn()
const mockGetApps = vi.fn()
const mockInitializeApp = vi.fn()

vi.mock('firebase/messaging', () => ({
  getMessaging: (...args: unknown[]) => mockGetMessaging(...args),
  getToken: (...args: unknown[]) => mockGetToken(...args),
}))

vi.mock('firebase/app', () => ({
  getApp: (...args: unknown[]) => mockGetApp(...args),
  getApps: () => mockGetApps(),
  initializeApp: (...args: unknown[]) => mockInitializeApp(...args),
}))

let originalNotification: typeof globalThis.Notification

beforeEach(() => {
  originalNotification = globalThis.Notification
  mockGetToken.mockReset()
  mockGetMessaging.mockReset()
  mockGetApp.mockReset()
  mockGetApps.mockReset()
  mockInitializeApp.mockReset()
})

afterEach(() => {
  Object.defineProperty(globalThis, 'Notification', {
    value: originalNotification,
    writable: true,
    configurable: true,
  })
})

describe('requestPushPermission', () => {
  it('returns unsupported when Notification API is not available', async () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    const result = await requestPushPermission()
    expect(result).toEqual({ status: 'unsupported' })
  })

  it('returns denied when permission is already denied', async () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: { permission: 'denied', requestPermission: vi.fn() },
      writable: true,
      configurable: true,
    })

    const result = await requestPushPermission()
    expect(result).toEqual({ status: 'denied' })
  })

  it('returns denied when user denies permission prompt', async () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('denied'),
      },
      writable: true,
      configurable: true,
    })

    const result = await requestPushPermission()
    expect(result).toEqual({ status: 'denied' })
  })

  it('returns granted with token when permission is granted', async () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('granted'),
      },
      writable: true,
      configurable: true,
    })

    const mockApp = { name: 'test-app' }
    mockGetApps.mockReturnValue([])
    mockInitializeApp.mockReturnValue(mockApp)
    mockGetMessaging.mockReturnValue({ type: 'messaging' })
    mockGetToken.mockResolvedValue('fcm-token-abc')

    const result = await requestPushPermission()
    expect(result).toEqual({ status: 'granted', token: 'fcm-token-abc' })
    expect(mockInitializeApp).toHaveBeenCalled()
    expect(mockGetMessaging).toHaveBeenCalledWith(mockApp)
  })

  it('reuses existing firebase app if already initialized', async () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('granted'),
      },
      writable: true,
      configurable: true,
    })

    const mockApp = { name: 'existing-app' }
    mockGetApps.mockReturnValue([mockApp])
    mockGetApp.mockReturnValue(mockApp)
    mockGetMessaging.mockReturnValue({ type: 'messaging' })
    mockGetToken.mockResolvedValue('fcm-token-xyz')

    const result = await requestPushPermission()
    expect(result).toEqual({ status: 'granted', token: 'fcm-token-xyz' })
    expect(mockInitializeApp).not.toHaveBeenCalled()
    expect(mockGetApp).toHaveBeenCalled()
  })

  it('returns error when firebase throws', async () => {
    Object.defineProperty(globalThis, 'Notification', {
      value: {
        permission: 'default',
        requestPermission: vi.fn().mockResolvedValue('granted'),
      },
      writable: true,
      configurable: true,
    })

    const err = new Error('Firebase init failed')
    mockGetApps.mockReturnValue([])
    mockInitializeApp.mockImplementation(() => {
      throw err
    })

    const result = await requestPushPermission()
    expect(result).toEqual({ status: 'error', error: err })
  })
})
