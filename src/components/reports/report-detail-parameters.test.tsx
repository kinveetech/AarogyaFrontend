import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/render'
import { ReportDetailParameters } from './report-detail-parameters'
import type { ReportParameter } from '@/types/reports'

const mockParameters: ReportParameter[] = [
  {
    name: 'Hemoglobin',
    value: '14.2',
    unit: 'g/dL',
    referenceRange: '13.0-17.0',
    status: 'normal',
  },
  {
    name: 'WBC Count',
    value: '12500',
    unit: 'cells/mcL',
    referenceRange: '4500-11000',
    status: 'high',
  },
  {
    name: 'Platelet Count',
    value: '120000',
    unit: 'cells/mcL',
    referenceRange: '150000-400000',
    status: 'low',
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

  it('shows Normal badge for normal status', () => {
    render(<ReportDetailParameters parameters={mockParameters} />)
    expect(screen.getAllByText('Normal').length).toBeGreaterThanOrEqual(1)
  })

  it('shows High badge for high status', () => {
    render(<ReportDetailParameters parameters={mockParameters} />)
    expect(screen.getAllByText('High').length).toBeGreaterThanOrEqual(1)
  })

  it('shows Low badge for low status', () => {
    render(<ReportDetailParameters parameters={mockParameters} />)
    expect(screen.getAllByText('Low').length).toBeGreaterThanOrEqual(1)
  })

  it('renders the parameters heading', () => {
    render(<ReportDetailParameters parameters={mockParameters} />)
    expect(screen.getByText('Parameters')).toBeInTheDocument()
  })

  it('renders table with aria-label', () => {
    render(<ReportDetailParameters parameters={mockParameters} />)
    expect(screen.getByLabelText('Report parameters')).toBeInTheDocument()
  })
})
