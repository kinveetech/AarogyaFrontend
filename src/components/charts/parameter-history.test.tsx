import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/render'
import { ParameterHistory, ParameterTooltip } from './parameter-history'
import type { ParameterDataPoint } from '@/types/charts'

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

vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container" style={{ width: 500, height: 280 }}>
        {children}
      </div>
    ),
  }
})

const sampleData: ParameterDataPoint[] = [
  { date: '2025-01-10', value: 95, status: 'normal' },
  { date: '2025-01-17', value: 112, status: 'borderline' },
  { date: '2025-01-24', value: 135, status: 'abnormal' },
  { date: '2025-01-31', value: 88, status: 'normal' },
]

describe('ParameterHistory', () => {
  beforeEach(() => {
    mockResolvedTheme = 'light'
  })

  it('renders loading skeleton when isLoading is true', () => {
    render(
      <ParameterHistory
        parameterName="Glucose"
        unit="mg/dL"
        data={[]}
        isLoading
      />,
    )
    expect(screen.getByTestId('chart-skeleton')).toBeInTheDocument()
    expect(screen.getByTestId('chart-skeleton-bar')).toBeInTheDocument()
  })

  it('renders empty state when data is empty', () => {
    render(
      <ParameterHistory
        parameterName="Glucose"
        unit="mg/dL"
        data={[]}
      />,
    )
    expect(screen.getByText('No parameter data')).toBeInTheDocument()
    expect(screen.getByText(/Glucose/)).toBeInTheDocument()
  })

  it('renders chart container with data', () => {
    render(
      <ParameterHistory
        parameterName="Glucose (Fasting)"
        unit="mg/dL"
        data={sampleData}
      />,
    )
    expect(screen.getByTestId('parameter-history-chart')).toBeInTheDocument()
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
  })

  it('renders parameter name and unit', () => {
    render(
      <ParameterHistory
        parameterName="Glucose (Fasting)"
        unit="mg/dL"
        data={sampleData}
      />,
    )
    expect(screen.getByText('Glucose (Fasting)')).toBeInTheDocument()
    expect(screen.getByText('Unit: mg/dL')).toBeInTheDocument()
  })

  it('renders legend items for all status types', () => {
    render(
      <ParameterHistory
        parameterName="Glucose"
        unit="mg/dL"
        data={sampleData}
      />,
    )
    expect(screen.getByText('Normal')).toBeInTheDocument()
    expect(screen.getByText('Borderline')).toBeInTheDocument()
    expect(screen.getByText('Abnormal')).toBeInTheDocument()
  })

  it('renders in dark mode without errors', () => {
    mockResolvedTheme = 'dark'
    render(
      <ParameterHistory
        parameterName="Glucose"
        unit="mg/dL"
        data={sampleData}
        referenceRange={{ min: 70, max: 110 }}
      />,
    )
    expect(screen.getByTestId('parameter-history-chart')).toBeInTheDocument()
  })

  it('accepts optional referenceRange without error', () => {
    render(
      <ParameterHistory
        parameterName="Glucose"
        unit="mg/dL"
        data={sampleData}
        referenceRange={{ min: 70, max: 110 }}
      />,
    )
    expect(screen.getByTestId('parameter-history-chart')).toBeInTheDocument()
  })
})

describe('ParameterTooltip', () => {
  it('returns null when not active', () => {
    const { container } = render(
      <ParameterTooltip active={false} payload={[]} unit="mg/dL" isDark={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('returns null when payload is empty', () => {
    const { container } = render(
      <ParameterTooltip active={true} payload={[]} unit="mg/dL" isDark={false} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders tooltip with parameter data', () => {
    const payload = [
      {
        value: 95,
        dataKey: 'value',
        name: 'value',
        payload: { date: '2025-01-10', value: 95, status: 'normal' as const },
      },
    ]
    render(
      <ParameterTooltip active={true} payload={payload} unit="mg/dL" isDark={false} />,
    )
    expect(screen.getByTestId('parameter-tooltip')).toBeInTheDocument()
    expect(screen.getByText(/95 mg\/dL/)).toBeInTheDocument()
    expect(screen.getByText('Normal')).toBeInTheDocument()
  })

  it('renders tooltip in dark mode', () => {
    const payload = [
      {
        value: 135,
        dataKey: 'value',
        name: 'value',
        payload: { date: '2025-01-24', value: 135, status: 'abnormal' as const },
      },
    ]
    render(
      <ParameterTooltip active={true} payload={payload} unit="mg/dL" isDark={true} />,
    )
    expect(screen.getByTestId('parameter-tooltip')).toBeInTheDocument()
    expect(screen.getByText('Abnormal')).toBeInTheDocument()
  })

  it('renders borderline status label', () => {
    const payload = [
      {
        value: 112,
        dataKey: 'value',
        name: 'value',
        payload: { date: '2025-01-17', value: 112, status: 'borderline' as const },
      },
    ]
    render(
      <ParameterTooltip active={true} payload={payload} unit="mg/dL" isDark={false} />,
    )
    expect(screen.getByText('Borderline')).toBeInTheDocument()
  })
})
