import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/render'
import { EmptyStateView } from './empty-state'

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        return ({
          children,
          ...rest
        }: React.PropsWithChildren<Record<string, unknown>>) => {
          const filteredProps: Record<string, unknown> = {}
          for (const [key, value] of Object.entries(rest)) {
            if (
              typeof value !== 'object' &&
              typeof value !== 'function' &&
              !['initial', 'animate', 'transition', 'whileHover', 'whileInView'].includes(key)
            ) {
              filteredProps[key] = value
            }
          }
          if (prop === 'div') {
            const { style, ...divProps } = filteredProps as Record<string, unknown> & {
              style?: React.CSSProperties
            }
            return (
              <div style={style as React.CSSProperties} {...divProps}>
                {children}
              </div>
            )
          }
          return <>{children}</>
        }
      },
    },
  ),
}))

describe('EmptyStateView', () => {
  const defaultProps = {
    icon: <span data-testid="mock-icon">icon</span>,
    title: 'No reports found',
    description: 'Upload your first health report to get started.',
  }

  it('renders icon, title, and description', () => {
    render(<EmptyStateView {...defaultProps} />)
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
    expect(screen.getByText('No reports found')).toBeInTheDocument()
    expect(
      screen.getByText('Upload your first health report to get started.'),
    ).toBeInTheDocument()
  })

  it('renders action button when provided', () => {
    const onClick = vi.fn()
    render(
      <EmptyStateView
        {...defaultProps}
        action={{ label: 'Upload Report', onClick }}
      />,
    )
    const button = screen.getByRole('button', { name: 'Upload Report' })
    expect(button).toBeInTheDocument()
  })

  it('does not render action button when omitted', () => {
    render(<EmptyStateView {...defaultProps} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onClick when action button is clicked', async () => {
    const onClick = vi.fn()
    const { userEvent } = await import('@/test/render')
    render(
      <EmptyStateView
        {...defaultProps}
        action={{ label: 'Upload Report', onClick }}
      />,
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Upload Report' }),
    )
    expect(onClick).toHaveBeenCalledOnce()
  })
})
