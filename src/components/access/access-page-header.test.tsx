import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { AccessPageHeader } from './access-page-header'

describe('AccessPageHeader', () => {
  it('renders "Doctor Access" title for patient role', () => {
    render(<AccessPageHeader role="patient" onGrantClick={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Doctor Access' })).toBeInTheDocument()
  })

  it('renders "Received Grants" title for doctor role', () => {
    render(<AccessPageHeader role="doctor" />)
    expect(screen.getByRole('heading', { name: 'Received Grants' })).toBeInTheDocument()
  })

  it('renders the Grant Access button for patient role', () => {
    render(<AccessPageHeader role="patient" onGrantClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /grant access/i })).toBeInTheDocument()
  })

  it('does not render Grant Access button for doctor role', () => {
    render(<AccessPageHeader role="doctor" />)
    expect(screen.queryByRole('button', { name: /grant access/i })).not.toBeInTheDocument()
  })

  it('calls onGrantClick when button is clicked', async () => {
    const onGrantClick = vi.fn()
    render(<AccessPageHeader role="patient" onGrantClick={onGrantClick} />)
    await userEvent.click(screen.getByRole('button', { name: /grant access/i }))
    expect(onGrantClick).toHaveBeenCalledOnce()
  })
})
