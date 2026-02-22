import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/render'
import { ReportCardSkeleton } from './report-card-skeleton'

describe('ReportCardSkeleton', () => {
  it('renders a skeleton card', () => {
    render(<ReportCardSkeleton />)
    expect(screen.getByTestId('report-card-skeleton')).toBeInTheDocument()
  })

  it('renders multiple skeletons for grid loading state', () => {
    render(
      <>
        {Array.from({ length: 6 }).map((_, i) => (
          <ReportCardSkeleton key={i} />
        ))}
      </>,
    )
    expect(screen.getAllByTestId('report-card-skeleton')).toHaveLength(6)
  })
})
