import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/render'
import { SkipLink } from './skip-link'

describe('SkipLink', () => {
  it('renders a link targeting #main-content', () => {
    render(<SkipLink />)
    const link = screen.getByText('Skip to main content')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '#main-content')
  })

  it('is positioned off-screen by default', () => {
    render(<SkipLink />)
    const link = screen.getByText('Skip to main content')
    expect(link.tagName).toBe('A')
  })
})
