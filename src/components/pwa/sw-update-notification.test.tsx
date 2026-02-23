import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/render'
import { SwUpdateNotification } from './sw-update-notification'

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }),
}))

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        return ({
          children,
          style,
        }: React.PropsWithChildren<{ style?: React.CSSProperties }>) => {
          if (prop === 'div') {
            return <div style={style}>{children}</div>
          }
          return <>{children}</>
        }
      },
    },
  ),
}))

const mockHookReturn = {
  isRegistered: false,
  isUpdateAvailable: false,
  applyUpdate: vi.fn(),
}

vi.mock('./use-sw-registration', () => ({
  useSwRegistration: () => mockHookReturn,
}))

describe('SwUpdateNotification', () => {
  it('renders nothing when no update is available', () => {
    mockHookReturn.isUpdateAvailable = false
    const { container } = render(<SwUpdateNotification />)
    expect(container.textContent).toBe('')
  })

  it('renders notification when update is available', () => {
    mockHookReturn.isUpdateAvailable = true
    render(<SwUpdateNotification />)
    expect(screen.getByText('A new version is available')).toBeInTheDocument()
  })

  it('renders an Update button', () => {
    mockHookReturn.isUpdateAvailable = true
    render(<SwUpdateNotification />)
    expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument()
  })

  it('calls applyUpdate when Update button is clicked', async () => {
    mockHookReturn.isUpdateAvailable = true
    mockHookReturn.applyUpdate = vi.fn()
    const { userEvent } = await import('@/test/render')
    const user = userEvent.setup()
    render(<SwUpdateNotification />)
    await user.click(screen.getByRole('button', { name: 'Update' }))
    expect(mockHookReturn.applyUpdate).toHaveBeenCalledOnce()
  })
})
