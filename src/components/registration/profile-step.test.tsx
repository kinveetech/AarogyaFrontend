import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/render'
import { useForm } from 'react-hook-form'
import { ProfileStep } from './profile-step'
import type { RegistrationFormValues } from './registration-form-types'

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }),
}))

function Wrapper({ role }: { role: 'patient' | 'doctor' | 'lab_technician' }) {
  const form = useForm<RegistrationFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      bloodGroup: '',
      address: '',
      doctorData: {
        medicalLicenseNumber: '',
        specialization: '',
        clinicOrHospitalName: '',
        clinicAddress: '',
      },
      labTechnicianData: {
        labName: '',
        labLicenseNumber: '',
        nablAccreditationId: '',
      },
    },
  })

  return (
    <ProfileStep
      role={role}
      register={form.register}
      errors={form.formState.errors}
    />
  )
}

describe('ProfileStep', () => {
  it('renders heading and description', () => {
    render(<Wrapper role="patient" />)
    expect(screen.getByText('Your details')).toBeInTheDocument()
    expect(screen.getByText(/fields marked with/i)).toBeInTheDocument()
  })

  it('renders common fields for patient', () => {
    render(<Wrapper role="patient" />)
    expect(screen.getByRole('textbox', { name: /first name/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /last name/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
  })

  it('renders phone field with +91 prefix', () => {
    render(<Wrapper role="patient" />)
    expect(screen.getByText('+91')).toBeInTheDocument()
  })

  it('renders date of birth, gender, blood group, and address fields', () => {
    render(<Wrapper role="patient" />)
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /gender/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /blood group/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /address/i })).toBeInTheDocument()
  })

  it('does not render doctor fields for patient', () => {
    render(<Wrapper role="patient" />)
    expect(screen.queryByText('Medical Practice Details')).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /medical license number/i })).not.toBeInTheDocument()
  })

  it('does not render lab tech fields for patient', () => {
    render(<Wrapper role="patient" />)
    expect(screen.queryByText('Lab Details')).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /lab name/i })).not.toBeInTheDocument()
  })

  it('renders doctor-specific fields when role is doctor', () => {
    render(<Wrapper role="doctor" />)
    expect(screen.getByText('Medical Practice Details')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /medical license number/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /specialization/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /clinic \/ hospital name/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /clinic address/i })).toBeInTheDocument()
  })

  it('does not render lab tech fields when role is doctor', () => {
    render(<Wrapper role="doctor" />)
    expect(screen.queryByText('Lab Details')).not.toBeInTheDocument()
  })

  it('renders lab technician-specific fields when role is lab_technician', () => {
    render(<Wrapper role="lab_technician" />)
    expect(screen.getByText('Lab Details')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /lab name/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /lab license number/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /nabl accreditation id/i })).toBeInTheDocument()
  })

  it('does not render doctor fields when role is lab_technician', () => {
    render(<Wrapper role="lab_technician" />)
    expect(screen.queryByText('Medical Practice Details')).not.toBeInTheDocument()
  })

  it('renders specialization options', () => {
    render(<Wrapper role="doctor" />)
    const specSelect = screen.getByRole('combobox', { name: /specialization/i })
    expect(specSelect).toBeInTheDocument()
    expect(screen.getByText('Cardiology')).toBeInTheDocument()
    expect(screen.getByText('Pediatrics')).toBeInTheDocument()
  })
})
