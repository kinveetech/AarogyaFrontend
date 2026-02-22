import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '@/test/render'
import { Providers } from './providers'

describe('Providers', () => {
  it('renders children without crashing', () => {
    render(
      <Providers>
        <p>hello</p>
      </Providers>,
    )

    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
