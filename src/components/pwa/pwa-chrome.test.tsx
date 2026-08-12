import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/render'
import { PwaChrome } from './pwa-chrome'

const mockNavigation = { pathname: '/reports' }

vi.mock('next/navigation', () => ({
  usePathname: () => mockNavigation.pathname,
}))

vi.mock('./install-prompt', () => ({
  InstallPrompt: ({ hidden }: { hidden?: boolean }) => (
    <div data-testid="install-prompt" data-hidden={String(hidden)} />
  ),
}))

vi.mock('./sw-update-notification', () => ({
  SwUpdateNotification: ({ hidden }: { hidden?: boolean }) => (
    <div data-testid="sw-update-notification" data-hidden={String(hidden)} />
  ),
}))

describe('PwaChrome', () => {
  it('shows install prompt and update notification on portal routes', () => {
    mockNavigation.pathname = '/reports'
    render(<PwaChrome />)
    expect(screen.getByTestId('install-prompt')).toHaveAttribute('data-hidden', 'false')
    expect(screen.getByTestId('sw-update-notification')).toHaveAttribute(
      'data-hidden',
      'false',
    )
  })

  it.each(['/login', '/callback', '/register'])(
    'hides the chrome on %s',
    (pathname) => {
      mockNavigation.pathname = pathname
      render(<PwaChrome />)
      expect(screen.getByTestId('install-prompt')).toHaveAttribute('data-hidden', 'true')
      expect(screen.getByTestId('sw-update-notification')).toHaveAttribute(
        'data-hidden',
        'true',
      )
    },
  )

  it('hides the chrome on nested auth routes', () => {
    mockNavigation.pathname = '/register/pending'
    render(<PwaChrome />)
    expect(screen.getByTestId('install-prompt')).toHaveAttribute('data-hidden', 'true')
  })

  it('keeps both components mounted on auth routes so listeners stay registered', () => {
    mockNavigation.pathname = '/login'
    render(<PwaChrome />)
    expect(screen.getByTestId('install-prompt')).toBeInTheDocument()
    expect(screen.getByTestId('sw-update-notification')).toBeInTheDocument()
  })

  it('does not hide the chrome on portal routes that merely share a prefix', () => {
    mockNavigation.pathname = '/registrations-archive'
    render(<PwaChrome />)
    expect(screen.getByTestId('install-prompt')).toHaveAttribute('data-hidden', 'false')
  })
})
