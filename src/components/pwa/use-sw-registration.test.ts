import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@/test/render'
import { act } from '@testing-library/react'
import { useSwRegistration } from './use-sw-registration'

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }),
}))


describe('useSwRegistration', () => {
  let mockRegistration: {
    installing: { state: string; addEventListener: ReturnType<typeof vi.fn>; postMessage: ReturnType<typeof vi.fn> } | null
    waiting: { postMessage: ReturnType<typeof vi.fn> } | null
    update: ReturnType<typeof vi.fn>
    addEventListener: ReturnType<typeof vi.fn>
  }
  let readyResolve: (reg: typeof mockRegistration) => void
  let originalServiceWorker: ServiceWorkerContainer

  beforeEach(() => {
    vi.useFakeTimers()

    mockRegistration = {
      installing: null,
      waiting: null,
      update: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
    }

    const readyPromise = new Promise<typeof mockRegistration>((resolve) => {
      readyResolve = resolve
    })

    originalServiceWorker = navigator.serviceWorker

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        ready: readyPromise,
        controller: {},
        addEventListener: vi.fn(),
      },
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    Object.defineProperty(navigator, 'serviceWorker', {
      value: originalServiceWorker,
      writable: true,
      configurable: true,
    })
  })

  it('starts not registered', () => {
    const { result } = renderHook(() => useSwRegistration())
    expect(result.current.isRegistered).toBe(false)
    expect(result.current.isUpdateAvailable).toBe(false)
  })

  it('becomes registered once SW is ready', async () => {
    const { result } = renderHook(() => useSwRegistration())

    await act(async () => {
      readyResolve(mockRegistration)
    })

    expect(result.current.isRegistered).toBe(true)
  })

  it('detects update when new worker installs', async () => {
    const { result } = renderHook(() => useSwRegistration())

    const newWorker = {
      state: 'installing',
      addEventListener: vi.fn(),
      postMessage: vi.fn(),
    }
    mockRegistration.installing = newWorker

    await act(async () => {
      readyResolve(mockRegistration)
    })

    // Simulate updatefound
    const updateFoundHandler = mockRegistration.addEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'updatefound',
    )?.[1] as () => void

    act(() => {
      updateFoundHandler()
    })

    // Simulate statechange to installed
    const stateChangeHandler = newWorker.addEventListener.mock.calls.find(
      (call: any[]) => call[0] === 'statechange',
    )?.[1] as () => void

    newWorker.state = 'installed'
    act(() => {
      stateChangeHandler()
    })

    expect(result.current.isUpdateAvailable).toBe(true)
  })

  it('checks for updates periodically', async () => {
    renderHook(() => useSwRegistration())

    await act(async () => {
      readyResolve(mockRegistration)
    })

    expect(mockRegistration.update).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(60 * 60 * 1000) // 60 minutes
    })

    expect(mockRegistration.update).toHaveBeenCalledOnce()
  })

  it('applyUpdate posts SKIP_WAITING to waiting worker', async () => {
    const waitingWorker = { postMessage: vi.fn() }
    mockRegistration.waiting = waitingWorker

    const { result } = renderHook(() => useSwRegistration())

    await act(async () => {
      readyResolve(mockRegistration)
    })

    act(() => {
      result.current.applyUpdate()
    })

    expect(waitingWorker.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
  })

  it('applyUpdate is no-op without waiting worker', async () => {
    const { result } = renderHook(() => useSwRegistration())

    await act(async () => {
      readyResolve(mockRegistration)
    })

    // Should not throw
    act(() => {
      result.current.applyUpdate()
    })
  })

  it('handles missing serviceWorker gracefully', () => {
    // Delete the property so 'serviceWorker' in navigator returns false
    delete (navigator as unknown as Record<string, unknown>).serviceWorker

    const { result } = renderHook(() => useSwRegistration())
    expect(result.current.isRegistered).toBe(false)
  })
})
