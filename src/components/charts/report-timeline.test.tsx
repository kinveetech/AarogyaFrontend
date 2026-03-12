import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/render'
import { ReportTimeline } from './report-timeline'
import type { Report } from '@/types/reports'

let mockResolvedTheme = 'light'

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: () => ({
    resolvedTheme: mockResolvedTheme,
    setTheme: vi.fn(),
  }),
}))

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

function createReport(overrides: Partial<Report> & { id: string; reportDate: string }): Report {
  return {
    title: `Report ${overrides.id}`,
    reportType: 'blood_test',
    status: 'validated',
    labName: null,
    highlightParameter: null,
    createdAt: overrides.reportDate,
    ...overrides,
  }
}

const sampleReports: Report[] = [
  createReport({
    id: '1',
    title: 'Complete Blood Count',
    reportType: 'blood_test',
    reportDate: '2025-01-20',
    highlightParameter: 'Hb: 14.2 g/dL',
  }),
  createReport({
    id: '2',
    title: 'Chest X-Ray',
    reportType: 'radiology',
    reportDate: '2025-01-15',
  }),
  createReport({
    id: '3',
    title: 'Discharge Summary',
    reportType: 'cardiology',
    reportDate: '2024-12-28',
  }),
  createReport({
    id: '4',
    title: 'Daily Medication',
    reportType: 'urine_test',
    reportDate: '2025-01-18',
  }),
  createReport({
    id: '5',
    title: 'Insurance Document',
    reportType: 'other',
    reportDate: '2025-01-12',
  }),
]

describe('ReportTimeline', () => {
  beforeEach(() => {
    mockResolvedTheme = 'light'
  })

  it('renders loading skeleton when isLoading is true', () => {
    render(<ReportTimeline reports={[]} onReportClick={vi.fn()} isLoading />)
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('chart-skeleton-timeline')).toBeInTheDocument()
  })

  it('renders empty state when reports is empty', () => {
    render(<ReportTimeline reports={[]} onReportClick={vi.fn()} />)
    expect(screen.getByText('No reports yet')).toBeInTheDocument()
  })

  it('renders timeline container with data', () => {
    render(<ReportTimeline reports={sampleReports} onReportClick={vi.fn()} />)
    expect(screen.getByTestId('report-timeline')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(<ReportTimeline reports={sampleReports} onReportClick={vi.fn()} />)
    expect(screen.getByText('Report Timeline')).toBeInTheDocument()
  })

  it('renders report titles', () => {
    render(<ReportTimeline reports={sampleReports} onReportClick={vi.fn()} />)
    expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
    expect(screen.getByText('Chest X-Ray')).toBeInTheDocument()
    expect(screen.getByText('Discharge Summary')).toBeInTheDocument()
  })

  it('renders report type labels for all types', () => {
    render(<ReportTimeline reports={sampleReports} onReportClick={vi.fn()} />)
    expect(screen.getByText('Blood Test')).toBeInTheDocument()
    expect(screen.getByText('Radiology')).toBeInTheDocument()
    expect(screen.getByText('Cardiology')).toBeInTheDocument()
    expect(screen.getByText('Urine Test')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
  })

  it('renders highlight parameter when present', () => {
    render(<ReportTimeline reports={sampleReports} onReportClick={vi.fn()} />)
    expect(screen.getByText('Hb: 14.2 g/dL')).toBeInTheDocument()
  })

  it('calls onReportClick when entry is clicked', () => {
    const onClick = vi.fn()
    render(<ReportTimeline reports={sampleReports} onReportClick={onClick} />)
    const entries = screen.getAllByTestId('timeline-entry')
    fireEvent.click(entries[0])
    expect(onClick).toHaveBeenCalledWith('1')
  })

  it('renders timeline dots for each report', () => {
    render(<ReportTimeline reports={sampleReports} onReportClick={vi.fn()} />)
    const dots = screen.getAllByTestId('timeline-dot')
    expect(dots).toHaveLength(5)
  })

  it('groups reports by month/year', () => {
    render(<ReportTimeline reports={sampleReports} onReportClick={vi.fn()} />)
    expect(screen.getByText('January 2025')).toBeInTheDocument()
    expect(screen.getByText('December 2024')).toBeInTheDocument()
  })

  it('shows "Show more" button when reports exceed maxVisible', () => {
    render(
      <ReportTimeline reports={sampleReports} onReportClick={vi.fn()} maxVisible={3} />,
    )
    expect(screen.getByTestId('timeline-show-more')).toBeInTheDocument()
    expect(screen.getByText('Show all 5 reports')).toBeInTheDocument()
  })

  it('does not show "Show more" when reports fit within maxVisible', () => {
    render(
      <ReportTimeline reports={sampleReports} onReportClick={vi.fn()} maxVisible={10} />,
    )
    expect(screen.queryByTestId('timeline-show-more')).not.toBeInTheDocument()
  })

  it('reveals all reports when "Show more" is clicked', () => {
    render(
      <ReportTimeline reports={sampleReports} onReportClick={vi.fn()} maxVisible={3} />,
    )
    // Initially only 3 entries visible
    expect(screen.getAllByTestId('timeline-entry')).toHaveLength(3)

    fireEvent.click(screen.getByTestId('timeline-show-more'))

    // Now all 5 visible
    expect(screen.getAllByTestId('timeline-entry')).toHaveLength(5)
    // "Show more" button should be gone
    expect(screen.queryByTestId('timeline-show-more')).not.toBeInTheDocument()
  })

  it('renders in dark mode without errors', () => {
    mockResolvedTheme = 'dark'
    render(<ReportTimeline reports={sampleReports} onReportClick={vi.fn()} />)
    expect(screen.getByTestId('report-timeline')).toBeInTheDocument()
    expect(screen.getByText('Complete Blood Count')).toBeInTheDocument()
  })
})
