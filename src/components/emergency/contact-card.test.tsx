import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { axe } from 'vitest-axe'
import { ContactCard } from './contact-card'
import type { EmergencyContact } from '@/types/emergency'

function makeContact(overrides: Partial<EmergencyContact> = {}): EmergencyContact {
  return {
    id: 'ec1',
    name: 'Priya Sharma',
    phone: '9876543210',
    relationship: 'spouse',
    isPrimary: false,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('ContactCard', () => {
  it('renders contact name and initials', () => {
    render(<ContactCard contact={makeContact()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
    expect(screen.getByText('PS')).toBeInTheDocument()
  })

  it('shows relationship badge', () => {
    render(<ContactCard contact={makeContact()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Spouse')).toBeInTheDocument()
  })

  it('shows formatted phone number', () => {
    render(<ContactCard contact={makeContact()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument()
  })

  it('shows relationship labels for all types', () => {
    render(
      <ContactCard
        contact={makeContact({ relationship: 'friend' })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByText('Friend')).toBeInTheDocument()
  })

  it('renders Edit and Remove buttons', () => {
    render(<ContactCard contact={makeContact()} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /edit priya sharma/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove priya sharma/i })).toBeInTheDocument()
  })

  it('calls onEdit with contact id when Edit is clicked', async () => {
    const onEdit = vi.fn()
    render(<ContactCard contact={makeContact()} onEdit={onEdit} onDelete={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /edit priya sharma/i }))
    expect(onEdit).toHaveBeenCalledWith('ec1')
  })

  it('calls onDelete with contact id when Remove is clicked', async () => {
    const onDelete = vi.fn()
    render(<ContactCard contact={makeContact()} onEdit={vi.fn()} onDelete={onDelete} />)
    await userEvent.click(screen.getByRole('button', { name: /remove priya sharma/i }))
    expect(onDelete).toHaveBeenCalledWith('ec1')
  })

  it('shows Primary badge when isPrimary is true', () => {
    render(
      <ContactCard
        contact={makeContact({ isPrimary: true })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.getByTestId('primary-badge')).toBeInTheDocument()
    expect(screen.getByText('Primary')).toBeInTheDocument()
  })

  it('does not show Primary badge when isPrimary is false', () => {
    render(
      <ContactCard
        contact={makeContact({ isPrimary: false })}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )
    expect(screen.queryByTestId('primary-badge')).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ContactCard contact={makeContact()} onEdit={vi.fn()} onDelete={vi.fn()} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
