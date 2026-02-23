import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@/test/render'
import { act } from '@testing-library/react'
import { useInstallPrompt } from './use-install-prompt'

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }),
}))

describe('useInstallPrompt', () => {
  let originalNavigator: Navigator

  beforeEach(() => {
    originalNavigator = window.navigator
    localStorage.clear()
  })

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
    })
  })

  it('starts with isInstallable false', () => {
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isInstallable).toBe(false)
  })

  it('starts with isStandalone false when not in standalone mode', () => {
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isStandalone).toBe(false)
  })

  it('detects beforeinstallprompt event', () => {
    const { result } = renderHook(() => useInstallPrompt())

    const event = new Event('beforeinstallprompt')
    Object.assign(event, {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(result.current.isInstallable).toBe(true)
  })

  it('promptInstall calls prompt on the deferred event', async () => {
    const { result } = renderHook(() => useInstallPrompt())

    const promptMock = vi.fn()
    const event = new Event('beforeinstallprompt')
    Object.assign(event, {
      prompt: promptMock,
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    })

    act(() => {
      window.dispatchEvent(event)
    })

    await act(async () => {
      await result.current.promptInstall()
    })

    expect(promptMock).toHaveBeenCalledOnce()
  })

  it('clears deferred prompt when user accepts', async () => {
    const { result } = renderHook(() => useInstallPrompt())

    const event = new Event('beforeinstallprompt')
    Object.assign(event, {
      prompt: vi.fn(),
      userChoice: Promise.resolve({ outcome: 'accepted' }),
    })

    act(() => {
      window.dispatchEvent(event)
    })

    await act(async () => {
      await result.current.promptInstall()
    })

    expect(result.current.isInstallable).toBe(false)
  })

  it('dismiss sets isDismissed and persists to localStorage', () => {
    const { result } = renderHook(() => useInstallPrompt())

    act(() => {
      result.current.dismiss()
    })

    expect(result.current.isDismissed).toBe(true)
    expect(localStorage.getItem('pwa-install-dismissed')).toBeTruthy()
  })

  it('reads dismissed state from localStorage on mount', () => {
    localStorage.setItem('pwa-install-dismissed', String(Date.now()))
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isDismissed).toBe(true)
  })

  it('ignores expired dismiss timestamp', () => {
    // Set a timestamp older than 7 days
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000
    localStorage.setItem('pwa-install-dismissed', String(eightDaysAgo))
    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isDismissed).toBe(false)
  })

  it('detects iOS user agent', () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        ...window.navigator,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      },
      writable: true,
    })

    const { result } = renderHook(() => useInstallPrompt())
    expect(result.current.isIOS).toBe(true)
  })

  it('detects appinstalled event', () => {
    const { result } = renderHook(() => useInstallPrompt())

    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })

    expect(result.current.isStandalone).toBe(true)
  })

  it('promptInstall is no-op when no deferred prompt', async () => {
    const { result } = renderHook(() => useInstallPrompt())
    // Should not throw
    await act(async () => {
      await result.current.promptInstall()
    })
    expect(result.current.isInstallable).toBe(false)
  })
})
