import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/render'
import { ChartSkeleton } from './chart-skeleton'

describe('ChartSkeleton', () => {
  it('renders line variant', () => {
    render(<ChartSkeleton variant="line" />)
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('chart-skeleton-line')).toBeInTheDocument()
  })

  it('renders bar variant', () => {
    render(<ChartSkeleton variant="bar" />)
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('chart-skeleton-bar')).toBeInTheDocument()
  })

  it('renders timeline variant', () => {
    render(<ChartSkeleton variant="timeline" />)
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('chart-skeleton-timeline')).toBeInTheDocument()
  })

  it('does not render other variants when line is selected', () => {
    render(<ChartSkeleton variant="line" />)
    expect(screen.queryByTestId('chart-skeleton-bar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('chart-skeleton-timeline')).not.toBeInTheDocument()
  })

  it('does not render other variants when bar is selected', () => {
    render(<ChartSkeleton variant="bar" />)
    expect(screen.queryByTestId('chart-skeleton-line')).not.toBeInTheDocument()
    expect(screen.queryByTestId('chart-skeleton-timeline')).not.toBeInTheDocument()
  })
})
