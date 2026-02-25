import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { RoleSelectionStep } from './role-selection-step'

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

describe('RoleSelectionStep', () => {
  it('renders the heading text', () => {
    render(<RoleSelectionStep selectedRole={null} onSelect={vi.fn()} />)
    expect(screen.getByText('Choose your role')).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(<RoleSelectionStep selectedRole={null} onSelect={vi.fn()} />)
    expect(
      screen.getByText(/Select how you will use Aarogya/),
    ).toBeInTheDocument()
  })

  it('renders all 3 role cards', () => {
    render(<RoleSelectionStep selectedRole={null} onSelect={vi.fn()} />)
    expect(screen.getByText('Patient')).toBeInTheDocument()
    expect(screen.getByText('Doctor')).toBeInTheDocument()
    expect(screen.getByText('Lab Technician')).toBeInTheDocument()
  })

  it('renders role descriptions', () => {
    render(<RoleSelectionStep selectedRole={null} onSelect={vi.fn()} />)
    expect(
      screen.getByText('Store and manage your health records securely.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Access patient records shared with you and manage your practice.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Upload and manage lab reports for patients.'),
    ).toBeInTheDocument()
  })

  it('shows "Requires approval" badge for doctor and lab technician', () => {
    render(<RoleSelectionStep selectedRole={null} onSelect={vi.fn()} />)
    const badges = screen.getAllByText('Requires approval')
    expect(badges).toHaveLength(2)
  })

  it('calls onSelect with patient when patient card is clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<RoleSelectionStep selectedRole={null} onSelect={onSelect} />)

    await user.click(screen.getByText('Patient'))
    expect(onSelect).toHaveBeenCalledWith('patient')
  })

  it('calls onSelect with doctor when doctor card is clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<RoleSelectionStep selectedRole={null} onSelect={onSelect} />)

    await user.click(screen.getByText('Doctor'))
    expect(onSelect).toHaveBeenCalledWith('doctor')
  })

  it('calls onSelect with lab_technician when lab technician card is clicked', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<RoleSelectionStep selectedRole={null} onSelect={onSelect} />)

    await user.click(screen.getByText('Lab Technician'))
    expect(onSelect).toHaveBeenCalledWith('lab_technician')
  })

  it('renders 3 clickable buttons', () => {
    render(<RoleSelectionStep selectedRole={null} onSelect={vi.fn()} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
  })

  it('renders correctly when a role is selected', () => {
    render(<RoleSelectionStep selectedRole="doctor" onSelect={vi.fn()} />)
    expect(screen.getByText('Doctor')).toBeInTheDocument()
    expect(screen.getByText('Patient')).toBeInTheDocument()
    expect(screen.getByText('Lab Technician')).toBeInTheDocument()
  })
})
