import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { ContactModal } from './contact-modal'
import type { EmergencyContact } from '@/types/emergency'

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  loading: false,
  initialData: null,
}

const existingContact: EmergencyContact = {
  id: 'ec1',
  name: 'Priya Sharma',
  phone: '9876543210',
  relationship: 'spouse',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
}

describe('ContactModal', () => {
  it('renders "Add Emergency Contact" title when creating', () => {
    render(<ContactModal {...defaultProps} />)
    expect(screen.getByText('Add Emergency Contact')).toBeInTheDocument()
  })

  it('renders "Edit Emergency Contact" title when editing', () => {
    render(<ContactModal {...defaultProps} initialData={existingContact} />)
    expect(screen.getByText('Edit Emergency Contact')).toBeInTheDocument()
  })

  it('shows all form fields', () => {
    render(<ContactModal {...defaultProps} />)
    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('Relationship')).toBeInTheDocument()
    expect(screen.getByText('Phone Number')).toBeInTheDocument()
  })

  it('shows +91 prefix', () => {
    render(<ContactModal {...defaultProps} />)
    expect(screen.getByText('+91')).toBeInTheDocument()
  })

  it('pre-fills form fields when editing', async () => {
    render(<ContactModal {...defaultProps} initialData={existingContact} />)

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter full name')).toHaveValue('Priya Sharma')
    })
    expect(screen.getByPlaceholderText('Enter phone number')).toHaveValue('9876543210')
  })

  it('shows "Save Contact" button when adding', () => {
    render(<ContactModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Save Contact' })).toBeInTheDocument()
  })

  it('shows "Save Changes" button when editing', () => {
    render(<ContactModal {...defaultProps} initialData={existingContact} />)
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })

  it('shows Cancel button', () => {
    render(<ContactModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('calls onSubmit with form data on valid submission', async () => {
    const onSubmit = vi.fn()
    render(<ContactModal {...defaultProps} onSubmit={onSubmit} />)

    await userEvent.type(screen.getByPlaceholderText('Enter full name'), 'Rajesh Kumar')
    await userEvent.type(screen.getByPlaceholderText('Enter phone number'), '9123456789')

    await userEvent.click(screen.getByRole('button', { name: 'Save Contact' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Rajesh Kumar',
          phone: '9123456789',
          relationship: 'spouse',
        }),
        expect.anything(),
      )
    })
  })

  it('shows validation error for empty name', async () => {
    render(<ContactModal {...defaultProps} />)

    await userEvent.type(screen.getByPlaceholderText('Enter phone number'), '9123456789')
    await userEvent.click(screen.getByRole('button', { name: 'Save Contact' }))

    await waitFor(() => {
      expect(screen.getByText('Required')).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid phone', async () => {
    render(<ContactModal {...defaultProps} />)

    await userEvent.type(screen.getByPlaceholderText('Enter full name'), 'Test User')
    await userEvent.type(screen.getByPlaceholderText('Enter phone number'), '123')
    await userEvent.click(screen.getByRole('button', { name: 'Save Contact' }))

    await waitFor(() => {
      expect(screen.getByText('Must be a valid 10-digit Indian mobile number')).toBeInTheDocument()
    })
  })

  it('resets form when opened for adding after editing', async () => {
    const { rerender } = render(
      <ContactModal {...defaultProps} initialData={existingContact} />,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter full name')).toHaveValue('Priya Sharma')
    })

    rerender(
      <ContactModal {...defaultProps} open={false} initialData={null} />,
    )
    rerender(
      <ContactModal {...defaultProps} open={true} initialData={null} />,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter full name')).toHaveValue('')
    })
  })

  it('shows all relationship options in dropdown', () => {
    render(<ContactModal {...defaultProps} />)
    const options = screen.getAllByRole('option')
    const optionTexts = options.map((opt) => opt.textContent)
    expect(optionTexts).toContain('Spouse')
    expect(optionTexts).toContain('Parent')
    expect(optionTexts).toContain('Sibling')
    expect(optionTexts).toContain('Child')
    expect(optionTexts).toContain('Friend')
    expect(optionTexts).toContain('Other')
  })
})
