import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '@/test/render'
import { AccessPageHeader } from './access-page-header'

describe('AccessPageHeader', () => {
  it('renders the page title', () => {
    render(<AccessPageHeader onGrantClick={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Doctor Access' })).toBeInTheDocument()
  })

  it('renders the Grant Access button', () => {
    render(<AccessPageHeader onGrantClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /grant access/i })).toBeInTheDocument()
  })

  it('calls onGrantClick when button is clicked', async () => {
    const onGrantClick = vi.fn()
    render(<AccessPageHeader onGrantClick={onGrantClick} />)
    await userEvent.click(screen.getByRole('button', { name: /grant access/i }))
    expect(onGrantClick).toHaveBeenCalledOnce()
  })
})
