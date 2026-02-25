import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import RegisterPage from './page'

const mockPush = vi.fn()
const mockMutateAsync = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

vi.mock('next-auth/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-auth/react')>()
  return {
    ...actual,
    useSession: () => ({ data: { user: { email: 'test@example.com' } } }),
  }
})

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }),
}))

vi.mock('@/hooks/registration', () => ({
  useRegister: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockMutateAsync.mockReset()
  })

  it('renders the header with logo and title', () => {
    render(<RegisterPage />)
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByText('Complete registration to get started')).toBeInTheDocument()
  })

  it('renders step indicator with three steps', () => {
    render(<RegisterPage />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('starts on the role selection step', () => {
    render(<RegisterPage />)
    expect(screen.getByText('Choose your role')).toBeInTheDocument()
  })

  it('disables Continue button when no role is selected', () => {
    render(<RegisterPage />)
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
  })

  it('enables Continue button after selecting a role', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByText('Patient'))
    expect(screen.getByRole('button', { name: /continue/i })).not.toBeDisabled()
  })

  it('navigates to profile step after selecting role and clicking Continue', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByText('Patient'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.getByText('Your details')).toBeInTheDocument()
  })

  it('shows Back button on profile step', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByText('Patient'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('goes back to role step when Back is clicked on profile step', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByText('Patient'))
    await user.click(screen.getByRole('button', { name: /continue/i }))
    await user.click(screen.getByRole('button', { name: /back/i }))

    expect(screen.getByText('Choose your role')).toBeInTheDocument()
  })

  it('navigates to consents step after filling profile and clicking Continue', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    // Step 1: select role
    await user.click(screen.getByText('Patient'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Step 2: fill required fields
    const firstNameInput = screen.getByRole('textbox', { name: /first name/i })
    const lastNameInput = screen.getByRole('textbox', { name: /last name/i })
    const emailInput = screen.getByRole('textbox', { name: /email/i })

    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'John')
    await user.clear(lastNameInput)
    await user.type(lastNameInput, 'Doe')
    await user.clear(emailInput)
    await user.type(emailInput, 'john@example.com')

    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByText('Consent preferences')).toBeInTheDocument()
    })
  })

  it('shows Complete Registration button on consents step', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByText('Patient'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    const firstNameInput = screen.getByRole('textbox', { name: /first name/i })
    const lastNameInput = screen.getByRole('textbox', { name: /last name/i })
    const emailInput = screen.getByRole('textbox', { name: /email/i })

    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'John')
    await user.clear(lastNameInput)
    await user.type(lastNameInput, 'Doe')
    await user.clear(emailInput)
    await user.type(emailInput, 'john@example.com')

    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /complete registration/i })).toBeInTheDocument()
    })
  })

  it('goes back to profile step from consents step', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByText('Patient'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    const firstNameInput = screen.getByRole('textbox', { name: /first name/i })
    const lastNameInput = screen.getByRole('textbox', { name: /last name/i })
    const emailInput = screen.getByRole('textbox', { name: /email/i })

    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'John')
    await user.clear(lastNameInput)
    await user.type(lastNameInput, 'Doe')
    await user.clear(emailInput)
    await user.type(emailInput, 'john@example.com')

    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByText('Consent preferences')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByText('Your details')).toBeInTheDocument()
  })

  it('submits registration and redirects to /reports on approved', async () => {
    mockMutateAsync.mockResolvedValue({ registrationStatus: 'approved' })
    const user = userEvent.setup()
    render(<RegisterPage />)

    // Step 1
    await user.click(screen.getByText('Patient'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Step 2
    await user.clear(screen.getByRole('textbox', { name: /first name/i }))
    await user.type(screen.getByRole('textbox', { name: /first name/i }), 'John')
    await user.clear(screen.getByRole('textbox', { name: /last name/i }))
    await user.type(screen.getByRole('textbox', { name: /last name/i }), 'Doe')
    await user.clear(screen.getByRole('textbox', { name: /email/i }))
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Step 3
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /complete registration/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /complete registration/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'patient',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        }),
      )
      expect(mockPush).toHaveBeenCalledWith('/reports')
    })
  })

  it('redirects to /register/pending when status is pending_approval', async () => {
    mockMutateAsync.mockResolvedValue({ registrationStatus: 'pending_approval' })
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByText('Patient'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await user.clear(screen.getByRole('textbox', { name: /first name/i }))
    await user.type(screen.getByRole('textbox', { name: /first name/i }), 'John')
    await user.clear(screen.getByRole('textbox', { name: /last name/i }))
    await user.type(screen.getByRole('textbox', { name: /last name/i }), 'Doe')
    await user.clear(screen.getByRole('textbox', { name: /email/i }))
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /complete registration/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /complete registration/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/register/pending')
    })
  })

  it('shows error message when registration fails', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Server error'))
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByText('Patient'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await user.clear(screen.getByRole('textbox', { name: /first name/i }))
    await user.type(screen.getByRole('textbox', { name: /first name/i }), 'John')
    await user.clear(screen.getByRole('textbox', { name: /last name/i }))
    await user.type(screen.getByRole('textbox', { name: /last name/i }), 'Doe')
    await user.clear(screen.getByRole('textbox', { name: /email/i }))
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /complete registration/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /complete registration/i }))

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })

  it('shows fallback error message when error is not an Error instance', async () => {
    mockMutateAsync.mockRejectedValue('unknown')
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByText('Patient'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await user.clear(screen.getByRole('textbox', { name: /first name/i }))
    await user.type(screen.getByRole('textbox', { name: /first name/i }), 'John')
    await user.clear(screen.getByRole('textbox', { name: /last name/i }))
    await user.type(screen.getByRole('textbox', { name: /last name/i }), 'Doe')
    await user.clear(screen.getByRole('textbox', { name: /email/i }))
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /complete registration/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /complete registration/i }))

    await waitFor(() => {
      expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument()
    })
  })

  it('includes doctor data when doctor role is selected', async () => {
    mockMutateAsync.mockResolvedValue({ registrationStatus: 'pending_approval' })
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByText('Doctor'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Fill common fields
    await user.clear(screen.getByRole('textbox', { name: /first name/i }))
    await user.type(screen.getByRole('textbox', { name: /first name/i }), 'Dr')
    await user.clear(screen.getByRole('textbox', { name: /last name/i }))
    await user.type(screen.getByRole('textbox', { name: /last name/i }), 'Smith')
    await user.clear(screen.getByRole('textbox', { name: /email/i }))
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'dr@example.com')

    // Fill doctor fields
    await user.type(screen.getByRole('textbox', { name: /medical license number/i }), 'MLC123')

    // Select specialization
    const specSelect = screen.getByRole('combobox', { name: /specialization/i })
    await user.selectOptions(specSelect, 'Cardiology')

    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /complete registration/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /complete registration/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'doctor',
          doctorData: expect.objectContaining({
            medicalLicenseNumber: 'MLC123',
            specialization: 'Cardiology',
          }),
        }),
      )
    })
  })

  it('includes lab technician data when lab_technician role is selected', async () => {
    mockMutateAsync.mockResolvedValue({ registrationStatus: 'pending_approval' })
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByText('Lab Technician'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Fill common fields
    await user.clear(screen.getByRole('textbox', { name: /first name/i }))
    await user.type(screen.getByRole('textbox', { name: /first name/i }), 'Lab')
    await user.clear(screen.getByRole('textbox', { name: /last name/i }))
    await user.type(screen.getByRole('textbox', { name: /last name/i }), 'Tech')
    await user.clear(screen.getByRole('textbox', { name: /email/i }))
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'lab@example.com')

    // Fill lab tech fields
    await user.type(screen.getByRole('textbox', { name: /lab name/i }), 'TestLab')

    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /complete registration/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /complete registration/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'lab_technician',
          labTechnicianData: expect.objectContaining({
            labName: 'TestLab',
          }),
        }),
      )
    })
  })

  it('does not navigate to profile if no role selected and Continue clicked', async () => {
    render(<RegisterPage />)
    // Button is disabled, so clicking does nothing
    expect(screen.getByRole('button', { name: /continue/i })).toBeDisabled()
    expect(screen.getByText('Choose your role')).toBeInTheDocument()
  })

  it('does not navigate to consents if profile validation fails', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByText('Patient'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Don't fill any fields, click Continue
    await user.click(screen.getByRole('button', { name: /continue/i }))

    // Should stay on profile step
    expect(screen.getByText('Your details')).toBeInTheDocument()
    expect(screen.queryByText('Consent preferences')).not.toBeInTheDocument()
  })

  it('includes consents in the submission', async () => {
    mockMutateAsync.mockResolvedValue({ registrationStatus: 'approved' })
    const user = userEvent.setup()
    render(<RegisterPage />)

    await user.click(screen.getByText('Patient'))
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await user.clear(screen.getByRole('textbox', { name: /first name/i }))
    await user.type(screen.getByRole('textbox', { name: /first name/i }), 'John')
    await user.clear(screen.getByRole('textbox', { name: /last name/i }))
    await user.type(screen.getByRole('textbox', { name: /last name/i }), 'Doe')
    await user.clear(screen.getByRole('textbox', { name: /email/i }))
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /continue/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /complete registration/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /complete registration/i }))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          consents: expect.arrayContaining([
            expect.objectContaining({ purpose: 'profile_management', isGranted: true }),
          ]),
        }),
      )
    })
  })
})
