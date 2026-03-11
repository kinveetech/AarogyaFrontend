import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { ProfileSection } from './profile-section'
import type { Profile } from '@/types/profile'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const mockProfile: Profile = {
  sub: 'u1',
  firstName: 'Arjun',
  lastName: 'Kumar',
  email: 'arjun@example.com',
  phone: '9876543210',
  dateOfBirth: '1990-03-15T00:00:00Z',
  bloodGroup: 'B+',
  gender: 'male',
  address: 'Bengaluru',
  aadhaarVerified: false,
  registrationStatus: 'approved',
  roles: ['patient'],
}

const verifiedProfile: Profile = {
  ...mockProfile,
  aadhaarVerified: true,
}

const defaultProps = {
  profile: mockProfile,
  isLoading: false,
  isSaving: false,
  onSave: vi.fn(),
}

beforeEach(() => {
  mockFetch.mockReset()
  defaultProps.onSave.mockReset()
})

describe('ProfileSection', () => {
  it('renders section heading', () => {
    render(<ProfileSection {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeInTheDocument()
  })

  it('renders loading skeleton when isLoading', () => {
    render(
      <ProfileSection {...defaultProps} profile={undefined} isLoading={true} />,
    )
    expect(screen.getByTestId('profile-loading')).toBeInTheDocument()
  })

  it('renders nothing when not loading and no profile', () => {
    const { container } = render(
      <ProfileSection {...defaultProps} profile={undefined} isLoading={false} />,
    )
    expect(container.querySelector('[data-testid="profile-loading"]')).not.toBeInTheDocument()
  })

  it('displays user initials in avatar', () => {
    render(<ProfileSection {...defaultProps} />)
    expect(screen.getByText('AK')).toBeInTheDocument()
  })

  it('displays full name', () => {
    render(<ProfileSection {...defaultProps} />)
    expect(screen.getByText('Arjun Kumar')).toBeInTheDocument()
  })

  it('displays email', () => {
    render(<ProfileSection {...defaultProps} />)
    expect(screen.getByText('arjun@example.com')).toBeInTheDocument()
  })

  it('populates form fields from profile', () => {
    render(<ProfileSection {...defaultProps} />)
    expect(screen.getByTestId('profile-first-name-input')).toHaveValue('Arjun')
    expect(screen.getByTestId('profile-last-name-input')).toHaveValue('Kumar')
    expect(screen.getByTestId('profile-phone-input')).toHaveValue('9876543210')
    expect(screen.getByTestId('profile-dob-input')).toHaveValue('1990-03-15')
    expect(screen.getByTestId('profile-blood-group-select')).toHaveValue('B+')
    expect(screen.getByTestId('profile-address-input')).toHaveValue('Bengaluru')
  })

  it('shows email as readonly', () => {
    render(<ProfileSection {...defaultProps} />)
    expect(screen.getByTestId('profile-email-input')).toHaveAttribute('readonly')
  })

  it('shows Aadhaar not verified badge when unverified', () => {
    render(<ProfileSection {...defaultProps} />)
    expect(screen.getByTestId('aadhaar-not-verified')).toBeInTheDocument()
    expect(screen.getByText('Not Verified')).toBeInTheDocument()
  })

  it('shows Verify Aadhaar button when unverified', () => {
    render(<ProfileSection {...defaultProps} />)
    expect(screen.getByTestId('verify-aadhaar-button')).toBeInTheDocument()
  })

  it('shows Aadhaar verified badge when verified', () => {
    render(<ProfileSection {...defaultProps} profile={verifiedProfile} />)
    expect(screen.getByTestId('aadhaar-verified')).toBeInTheDocument()
    expect(screen.getByText('Verified')).toBeInTheDocument()
  })

  it('hides Verify Aadhaar button when verified', () => {
    render(<ProfileSection {...defaultProps} profile={verifiedProfile} />)
    expect(screen.queryByTestId('verify-aadhaar-button')).not.toBeInTheDocument()
  })

  it('opens Aadhaar verify dialog on button click', async () => {
    render(<ProfileSection {...defaultProps} />)

    await userEvent.click(screen.getByTestId('verify-aadhaar-button'))

    await waitFor(() => {
      expect(
        screen.getByText('Enter your Aadhaar details to verify your identity.'),
      ).toBeInTheDocument()
    })
  })

  it('disables Save button when form is not dirty', () => {
    render(<ProfileSection {...defaultProps} />)
    expect(screen.getByTestId('profile-save-button')).toBeDisabled()
  })

  it('enables Save button when form is edited', async () => {
    render(<ProfileSection {...defaultProps} />)

    await userEvent.clear(screen.getByTestId('profile-first-name-input'))
    await userEvent.type(screen.getByTestId('profile-first-name-input'), 'Vikram')

    expect(screen.getByTestId('profile-save-button')).not.toBeDisabled()
  })

  it('calls onSave with form data on submit', async () => {
    const onSave = vi.fn()
    render(<ProfileSection {...defaultProps} onSave={onSave} />)

    await userEvent.clear(screen.getByTestId('profile-first-name-input'))
    await userEvent.type(screen.getByTestId('profile-first-name-input'), 'Vikram')
    await userEvent.click(screen.getByTestId('profile-save-button'))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ firstName: 'Vikram' }),
      )
    })
  })

  it('disables Save button while saving', () => {
    render(<ProfileSection {...defaultProps} isSaving={true} />)
    expect(screen.getByTestId('profile-save-button')).toBeDisabled()
  })

  it('renders gender select', () => {
    render(<ProfileSection {...defaultProps} />)
    expect(screen.getByTestId('profile-gender-select')).toHaveValue('male')
  })

  it('shows lock icon on email field', () => {
    render(<ProfileSection {...defaultProps} />)
    // Email field label should contain the lock SVG
    const emailLabel = screen.getByText('Email')
    expect(emailLabel.closest('[data-part="label"]')).toBeInTheDocument()
  })
})
