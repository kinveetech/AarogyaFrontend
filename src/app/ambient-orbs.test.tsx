import { describe, it, expect } from 'vitest'
import { render } from '@/test/render'
import { AmbientOrbs } from './ambient-orbs'

describe('AmbientOrbs', () => {
  it('renders a container marked as aria-hidden with three orbs', () => {
    const { container } = render(<AmbientOrbs />)
    const wrapper = container.querySelector('[aria-hidden="true"]')

    expect(wrapper).toBeInTheDocument()
    expect(wrapper!.children).toHaveLength(3)
  })

  it('uses fixed positioning so orbs stay in viewport', () => {
    const { container } = render(<AmbientOrbs />)
    const wrapper = container.querySelector('[aria-hidden="true"]')

    expect(wrapper).toHaveStyle({ position: 'fixed' })
  })
})
