import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { ConsentsStep } from './consents-step'

vi.mock('next/navigation', () => ({
  usePathname: () => '/register',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

const defaultConsents = [
  { purpose: 'profile_management', isGranted: true },
  { purpose: 'emergency_contact_management', isGranted: false },
  { purpose: 'medical_data_sharing', isGranted: false },
  { purpose: 'medical_records_processing', isGranted: false },
]

describe('ConsentsStep', () => {
  it('renders the heading text', () => {
    render(<ConsentsStep consents={defaultConsents} onChange={vi.fn()} />)
    expect(screen.getByText('Consent preferences')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<ConsentsStep consents={defaultConsents} onChange={vi.fn()} />)
    expect(
      screen.getByText(/Review and grant consent for how your data is used/),
    ).toBeInTheDocument()
  })

  it('renders all 4 consent items', () => {
    render(<ConsentsStep consents={defaultConsents} onChange={vi.fn()} />)
    expect(screen.getByText('Profile Management')).toBeInTheDocument()
    expect(screen.getByText('Emergency Contact Management')).toBeInTheDocument()
    expect(screen.getByText('Medical Data Sharing')).toBeInTheDocument()
    expect(screen.getByText('Medical Records Processing')).toBeInTheDocument()
  })

  it('renders descriptions for all consent items', () => {
    render(<ConsentsStep consents={defaultConsents} onChange={vi.fn()} />)
    expect(
      screen.getByText(/Allow us to store and manage your profile information/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Allow us to store your emergency contacts/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Allow sharing your medical records/),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Allow processing of your medical records/),
    ).toBeInTheDocument()
  })

  it('shows "Required" badge for required items', () => {
    render(<ConsentsStep consents={defaultConsents} onChange={vi.fn()} />)
    const requiredBadges = screen.getAllByText('Required')
    expect(requiredBadges).toHaveLength(1)
  })

  it('does not call onChange when clicking a required consent item', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ConsentsStep consents={defaultConsents} onChange={onChange} />)

    await user.click(screen.getByText('Profile Management'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('calls onChange when clicking an optional consent item', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ConsentsStep consents={defaultConsents} onChange={onChange} />)

    await user.click(screen.getByText('Emergency Contact Management'))
    expect(onChange).toHaveBeenCalledOnce()

    const updatedConsents = onChange.mock.calls[0][0]
    const emergencyConsent = updatedConsents.find(
      (c: { purpose: string }) => c.purpose === 'emergency_contact_management',
    )
    expect(emergencyConsent.isGranted).toBe(true)
  })

  it('toggles optional consent from granted to not granted', async () => {
    const grantedConsents = [
      { purpose: 'profile_management', isGranted: true },
      { purpose: 'emergency_contact_management', isGranted: true },
      { purpose: 'medical_data_sharing', isGranted: false },
      { purpose: 'medical_records_processing', isGranted: false },
    ]
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ConsentsStep consents={grantedConsents} onChange={onChange} />)

    await user.click(screen.getByText('Emergency Contact Management'))
    expect(onChange).toHaveBeenCalledOnce()

    const updatedConsents = onChange.mock.calls[0][0]
    const emergencyConsent = updatedConsents.find(
      (c: { purpose: string }) => c.purpose === 'emergency_contact_management',
    )
    expect(emergencyConsent.isGranted).toBe(false)
  })

  it('does not modify other consents when toggling one', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<ConsentsStep consents={defaultConsents} onChange={onChange} />)

    await user.click(screen.getByText('Medical Data Sharing'))
    expect(onChange).toHaveBeenCalledOnce()

    const updatedConsents = onChange.mock.calls[0][0]
    const profileConsent = updatedConsents.find(
      (c: { purpose: string }) => c.purpose === 'profile_management',
    )
    expect(profileConsent.isGranted).toBe(true)

    const emergencyConsent = updatedConsents.find(
      (c: { purpose: string }) => c.purpose === 'emergency_contact_management',
    )
    expect(emergencyConsent.isGranted).toBe(false)

    const medicalConsent = updatedConsents.find(
      (c: { purpose: string }) => c.purpose === 'medical_data_sharing',
    )
    expect(medicalConsent.isGranted).toBe(true)
  })

  it('renders 4 clickable buttons', () => {
    render(<ConsentsStep consents={defaultConsents} onChange={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
  })
})
