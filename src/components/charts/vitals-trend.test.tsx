import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/render'
import { VitalsTrend, VitalsTooltip } from './vitals-trend'
import type { VitalSeries } from '@/types/charts'

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

// Mock ResponsiveContainer — jsdom has no layout engine
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 500, height: 300 }}>
        {children}
      </div>
    ),
  }
})

const sampleSeries: VitalSeries[] = [
  {
    type: 'systolic',
    label: 'Systolic BP',
    unit: 'mmHg',
    referenceRange: { min: 90, max: 120 },
    data: [
      { date: '2025-01-10', value: 118 },
      { date: '2025-01-17', value: 122 },
      { date: '2025-01-24', value: 115 },
    ],
  },
  {
    type: 'pulse',
    label: 'Pulse',
    unit: 'bpm',
    referenceRange: { min: 60, max: 100 },
    data: [
      { date: '2025-01-10', value: 72 },
      { date: '2025-01-17', value: 78 },
      { date: '2025-01-24', value: 68 },
    ],
  },
]

describe('VitalsTrend', () => {
  beforeEach(() => {
    mockResolvedTheme = 'light'
  })

  it('renders loading skeleton when isLoading is true', () => {
    render(<VitalsTrend series={[]} isLoading />)
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('chart-skeleton-line')).toBeInTheDocument()
  })

  it('renders empty state when series is empty', () => {
    render(<VitalsTrend series={[]} />)
    expect(screen.getByText('No vitals data')).toBeInTheDocument()
  })

  it('renders empty state when all series have empty data', () => {
    const emptySeries: VitalSeries[] = [
      {
        type: 'systolic',
        label: 'Systolic BP',
        unit: 'mmHg',
        referenceRange: { min: 90, max: 120 },
        data: [],
      },
    ]
    render(<VitalsTrend series={emptySeries} />)
    expect(screen.getByText('No vitals data')).toBeInTheDocument()
  })

  it('renders chart container with data', () => {
    render(<VitalsTrend series={sampleSeries} />)
    expect(screen.getByTestId('vitals-trend-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(<VitalsTrend series={sampleSeries} />)
    expect(screen.getByText('Vitals Trend')).toBeInTheDocument()
  })

  it('renders legend items for each series', () => {
    render(<VitalsTrend series={sampleSeries} />)
    expect(screen.getByText('Systolic BP')).toBeInTheDocument()
    expect(screen.getByText('Pulse')).toBeInTheDocument()
  })

  it('renders in dark mode without errors', () => {
    mockResolvedTheme = 'dark'
    render(<VitalsTrend series={sampleSeries} />)
    expect(screen.getByTestId('vitals-trend-chart')).toBeInTheDocument()
    expect(screen.getByText('Systolic BP')).toBeInTheDocument()
  })
})

describe('VitalsTooltip', () => {
  it('returns null when not active', () => {
    const { container } = render(
      <VitalsTooltip
        active={false}
        payload={[]}
        label="2025-01-10"
        series={sampleSeries}
        isDark={false}
      />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('returns null when payload is empty', () => {
    const { container } = render(
      <VitalsTooltip
        active={true}
        payload={[]}
        label="2025-01-10"
        series={sampleSeries}
        isDark={false}
      />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders tooltip with vital data', () => {
    const payload = [
      { dataKey: 'systolic', value: 118, color: '#0E6B66', name: 'Systolic BP', payload: {} },
      { dataKey: 'pulse', value: 72, color: '#7FB285', name: 'Pulse', payload: {} },
    ]
    render(
      <VitalsTooltip
        active={true}
        payload={payload}
        label="2025-01-10"
        series={sampleSeries}
        isDark={false}
      />,
    )
    expect(screen.getByTestId('vitals-tooltip')).toBeInTheDocument()
    expect(screen.getByText(/Systolic BP/)).toBeInTheDocument()
    expect(screen.getByText(/118 mmHg/)).toBeInTheDocument()
    expect(screen.getByText(/Pulse/)).toBeInTheDocument()
    expect(screen.getByText(/72 bpm/)).toBeInTheDocument()
  })

  it('renders tooltip in dark mode', () => {
    const payload = [
      { dataKey: 'systolic', value: 120, color: '#4FB4B0', name: 'Systolic BP', payload: {} },
    ]
    render(
      <VitalsTooltip
        active={true}
        payload={payload}
        label="2025-01-17"
        series={sampleSeries}
        isDark={true}
      />,
    )
    expect(screen.getByTestId('vitals-tooltip')).toBeInTheDocument()
  })

  it('handles payload entry with no matching series gracefully', () => {
    const payload = [
      { dataKey: 'unknown', value: 99, color: '#ccc', name: 'Unknown', payload: {} },
    ]
    render(
      <VitalsTooltip
        active={true}
        payload={payload}
        label="2025-01-10"
        series={sampleSeries}
        isDark={false}
      />,
    )
    expect(screen.getByTestId('vitals-tooltip')).toBeInTheDocument()
  })
})
