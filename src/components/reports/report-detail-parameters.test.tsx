import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/render'
import { ReportDetailParameters } from './report-detail-parameters'
import type { ReportParameter } from '@/types/reports'

const mockParameters: ReportParameter[] = [
  {
    code: 'HGB',
    name: 'Hemoglobin',
    numericValue: 14.2,
    textValue: null,
    unit: 'g/dL',
    referenceRange: '13.0-17.0',
    isAbnormal: false,
  },
  {
    code: 'WBC',
    name: 'WBC Count',
    numericValue: 12500,
    textValue: null,
    unit: 'cells/mcL',
    referenceRange: '4500-11000',
    isAbnormal: true,
  },
  {
    code: 'PLT',
    name: 'Platelet Count',
    numericValue: 120000,
    textValue: null,
    unit: 'cells/mcL',
    referenceRange: '150000-400000',
    isAbnormal: true,
  },
]

describe('ReportDetailParameters', () => {
  it('renders all parameter rows', () => {
    render(<ReportDetailParameters parameters={mockParameters} />)
    // DataTable renders both desktop table and mobile cards, so elements appear twice
    expect(screen.getAllByText('Hemoglobin').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('WBC Count').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Platelet Count').length).toBeGreaterThanOrEqual(1)
  })

  it('renders parameter values', () => {
    render(<ReportDetailParameters parameters={mockParameters} />)
    expect(screen.getAllByText('14.2').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('12500').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('120000').length).toBeGreaterThanOrEqual(1)
  })

  it('renders units', () => {
    render(<ReportDetailParameters parameters={mockParameters} />)
    expect(screen.getAllByText('g/dL').length).toBeGreaterThanOrEqual(1)
    // cells/mcL appears for both WBC and Platelet
    expect(screen.getAllByText('cells/mcL').length).toBeGreaterThanOrEqual(2)
  })

  it('renders reference ranges', () => {
    render(<ReportDetailParameters parameters={mockParameters} />)
    expect(screen.getAllByText('13.0-17.0').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('4500-11000').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('150000-400000').length).toBeGreaterThanOrEqual(1)
  })

  it('shows Normal badge for non-abnormal parameters', () => {
    render(<ReportDetailParameters parameters={mockParameters} />)
    expect(screen.getAllByText('Normal').length).toBeGreaterThanOrEqual(1)
  })

  it('shows High badge for abnormal parameters', () => {
    render(<ReportDetailParameters parameters={mockParameters} />)
    expect(screen.getAllByText('High').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the parameters heading', () => {
    render(<ReportDetailParameters parameters={mockParameters} />)
    expect(screen.getByText('Parameters')).toBeInTheDocument()
  })

  it('renders table with aria-label', () => {
    render(<ReportDetailParameters parameters={mockParameters} />)
    const tables = screen.getAllByLabelText('Report parameters')
    // Desktop table + mobile card table both get the label
    expect(tables.length).toBeGreaterThanOrEqual(1)
  })
})
