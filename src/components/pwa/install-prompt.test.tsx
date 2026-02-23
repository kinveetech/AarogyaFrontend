import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/render'
import { InstallPrompt } from './install-prompt'

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
  isInstallable: false,
  isStandalone: false,
  isIOS: false,
  isDismissed: false,
  promptInstall: vi.fn(),
  dismiss: vi.fn(),
}

vi.mock('./use-install-prompt', () => ({
  useInstallPrompt: () => mockHookReturn,
}))

describe('InstallPrompt', () => {
  beforeEach(() => {
    mockHookReturn.isInstallable = false
    mockHookReturn.isStandalone = false
    mockHookReturn.isIOS = false
    mockHookReturn.isDismissed = false
    mockHookReturn.promptInstall = vi.fn()
    mockHookReturn.dismiss = vi.fn()
  })

  it('renders nothing when not installable and not iOS', () => {
    const { container } = render(<InstallPrompt />)
    expect(container.textContent).toBe('')
  })

  it('renders the banner when installable', () => {
    mockHookReturn.isInstallable = true
    render(<InstallPrompt />)
    expect(screen.getByText('Install Aarogya')).toBeInTheDocument()
  })

  it('renders iOS instructions when isIOS', () => {
    mockHookReturn.isIOS = true
    render(<InstallPrompt />)
    expect(screen.getByText(/Add to Home Screen/)).toBeInTheDocument()
  })

  it('renders Install and Not now buttons when installable (not iOS)', () => {
    mockHookReturn.isInstallable = true
    render(<InstallPrompt />)
    expect(screen.getByRole('button', { name: 'Install' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Not now' })).toBeInTheDocument()
  })

  it('calls promptInstall when Install is clicked', async () => {
    mockHookReturn.isInstallable = true
    const { userEvent } = await import('@/test/render')
    const user = userEvent.setup()
    render(<InstallPrompt />)
    await user.click(screen.getByRole('button', { name: 'Install' }))
    expect(mockHookReturn.promptInstall).toHaveBeenCalledOnce()
  })

  it('calls dismiss when Not now is clicked', async () => {
    mockHookReturn.isInstallable = true
    const { userEvent } = await import('@/test/render')
    const user = userEvent.setup()
    render(<InstallPrompt />)
    await user.click(screen.getByRole('button', { name: 'Not now' }))
    expect(mockHookReturn.dismiss).toHaveBeenCalledOnce()
  })

  it('calls dismiss when close icon button is clicked', async () => {
    mockHookReturn.isInstallable = true
    const { userEvent } = await import('@/test/render')
    const user = userEvent.setup()
    render(<InstallPrompt />)
    await user.click(screen.getByRole('button', { name: 'Close install prompt' }))
    expect(mockHookReturn.dismiss).toHaveBeenCalledOnce()
  })

  it('hides when in standalone mode', () => {
    mockHookReturn.isInstallable = true
    mockHookReturn.isStandalone = true
    const { container } = render(<InstallPrompt />)
    expect(container.textContent).toBe('')
  })

  it('hides when dismissed', () => {
    mockHookReturn.isInstallable = true
    mockHookReturn.isDismissed = true
    const { container } = render(<InstallPrompt />)
    expect(container.textContent).toBe('')
  })
})
