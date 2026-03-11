import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { AccountSection } from './account-section'

vi.mock('next-auth/react', async () => {
  const actual = await vi.importActual<typeof import('next-auth/react')>('next-auth/react')
  return {
    ...actual,
    signOut: vi.fn(),
  }
})

describe('AccountSection', () => {
  it('renders section heading', () => {
    render(<AccountSection />)
    expect(screen.getByRole('heading', { name: 'Account' })).toBeInTheDocument()
  })

  it('renders sign out button', () => {
    render(<AccountSection />)
    expect(screen.getByTestId('sign-out-button')).toBeInTheDocument()
  })

  it('renders app version', () => {
    render(<AccountSection />)
    expect(screen.getByText('Aarogya v0.1.0')).toBeInTheDocument()
  })

  it('opens sign out confirmation on button click', async () => {
    render(<AccountSection />)

    await userEvent.click(screen.getByTestId('sign-out-button'))

    await waitFor(() => {
      expect(
        screen.getByText(/You will need to log in again/),
      ).toBeInTheDocument()
    })
  })

  it('closes dialog when cancel is clicked', async () => {
    render(<AccountSection />)

    await userEvent.click(screen.getByTestId('sign-out-button'))
    await waitFor(() => {
      expect(screen.getByText(/You will need to log in again/)).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    await waitFor(() => {
      expect(screen.queryByText(/You will need to log in again/)).not.toBeInTheDocument()
    })
  })
})
