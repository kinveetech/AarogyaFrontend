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

  it('provides Chakra UI theme context to children', () => {
    render(
      <Providers>
        <div data-testid="themed" style={{ color: 'var(--chakra-colors-text-primary)' }}>
          themed content
        </div>
      </Providers>,
    )

    expect(screen.getByTestId('themed')).toBeInTheDocument()
  })

  it('renders multiple children correctly', () => {
    render(
      <Providers>
        <p>first</p>
        <p>second</p>
      </Providers>,
    )

    expect(screen.getByText('first')).toBeInTheDocument()
    expect(screen.getByText('second')).toBeInTheDocument()
  })
})
