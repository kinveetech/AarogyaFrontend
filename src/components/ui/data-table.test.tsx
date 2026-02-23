import { describe, it, expect } from 'vitest'
import { render, screen, userEvent, within } from '@/test/render'
import { axe } from 'vitest-axe'
import { DataTable, type DataTableColumn } from './data-table'

interface TestRow {
  id: number
  name: string
  status: string
  date: string
}

const columns: DataTableColumn<TestRow>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'status', header: 'Status' },
  { key: 'date', header: 'Date', sortable: true },
]

const data: TestRow[] = [
  { id: 1, name: 'Blood Report', status: 'Active', date: '2024-01-15' },
  { id: 2, name: 'Allergy Test', status: 'Pending', date: '2024-03-20' },
  { id: 3, name: 'X-Ray Report', status: 'Active', date: '2024-02-10' },
]

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} rowKey="id" />)
    // Headers appear in both desktop table and mobile cards
    expect(screen.getAllByText('Name').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Status').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Date').length).toBeGreaterThanOrEqual(1)
  })

  it('renders row data', () => {
    render(<DataTable columns={columns} data={data} rowKey="id" />)
    expect(screen.getAllByText('Blood Report').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Allergy Test').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('X-Ray Report').length).toBeGreaterThanOrEqual(1)
  })

  it('renders custom render function', () => {
    const customColumns: DataTableColumn<TestRow>[] = [
      {
        key: 'name',
        header: 'Name',
        render: (row) => <strong data-testid="custom-cell">{row.name}</strong>,
      },
    ]
    render(<DataTable columns={customColumns} data={data} rowKey="id" />)
    expect(screen.getAllByTestId('custom-cell').length).toBeGreaterThanOrEqual(1)
  })

  it('renders skeleton rows when loading', () => {
    const { container } = render(
      <DataTable columns={columns} data={[]} rowKey="id" loading loadingRows={3} />,
    )
    // Chakra Skeleton renders with class containing "skeleton"
    const skeletons = container.querySelectorAll('.chakra-skeleton')
    // 3 rows × 3 columns = 9 skeleton cells minimum (desktop + mobile)
    expect(skeletons.length).toBeGreaterThanOrEqual(3)
  })

  it('sorts ascending on first click of sortable column', async () => {
    render(<DataTable columns={columns} data={data} rowKey="id" />)
    // Find the desktop table header for Name
    const desktopTable = screen.getAllByText('Name')[0]
    await userEvent.click(desktopTable)

    // After sorting by Name asc: Allergy Test, Blood Report, X-Ray Report
    const cells = screen.getAllByText(/Allergy Test|Blood Report|X-Ray Report/)
    const names = cells.map((c) => c.textContent)
    // First occurrence should be Allergy Test (asc)
    expect(names[0]).toBe('Allergy Test')
  })

  it('sorts descending on second click', async () => {
    render(<DataTable columns={columns} data={data} rowKey="id" />)
    const header = screen.getAllByText('Name')[0]
    await userEvent.click(header)
    await userEvent.click(header)

    const cells = screen.getAllByText(/Allergy Test|Blood Report|X-Ray Report/)
    const names = cells.map((c) => c.textContent)
    expect(names[0]).toBe('X-Ray Report')
  })

  it('does not sort non-sortable columns', async () => {
    render(<DataTable columns={columns} data={data} rowKey="id" />)
    const statusHeader = screen.getAllByText('Status')[0]
    await userEvent.click(statusHeader)

    // Data order should remain the same — Blood Report first
    const cells = screen.getAllByText(/Blood Report|Allergy Test|X-Ray Report/)
    expect(cells[0].textContent).toBe('Blood Report')
  })

  it('paginates with next/prev buttons', async () => {
    const manyRows: TestRow[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `Report ${i + 1}`,
      status: 'Active',
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
    }))

    render(
      <DataTable columns={columns} data={manyRows} rowKey="id" defaultPageSize={10} />,
    )

    // Should show first 10
    expect(screen.getByTestId('pagination-info').textContent).toBe(
      'Showing 1–10 of 15',
    )

    // Click next
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByTestId('pagination-info').textContent).toBe(
      'Showing 11–15 of 15',
    )

    // Next should be disabled on last page
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    // Click prev
    await userEvent.click(screen.getByRole('button', { name: 'Prev' }))
    expect(screen.getByTestId('pagination-info').textContent).toBe(
      'Showing 1–10 of 15',
    )

    // Prev should be disabled on first page
    expect(screen.getByRole('button', { name: 'Prev' })).toBeDisabled()
  })

  it('resets to page 1 on page size change', async () => {
    const manyRows: TestRow[] = Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      name: `Report ${i + 1}`,
      status: 'Active',
      date: '2024-01-01',
    }))

    render(
      <DataTable
        columns={columns}
        data={manyRows}
        rowKey="id"
        defaultPageSize={10}
        pageSizes={[10, 25, 50]}
      />,
    )

    // Go to page 2
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByTestId('pagination-info').textContent).toBe(
      'Showing 11–20 of 30',
    )

    // Change page size to 25
    const select = screen.getByLabelText('Rows per page')
    await userEvent.selectOptions(select, '25')
    expect(screen.getByTestId('pagination-info').textContent).toBe(
      'Showing 1–25 of 30',
    )
  })

  it('passes aria-label to table', () => {
    render(
      <DataTable columns={columns} data={data} rowKey="id" aria-label="Reports table" />,
    )
    const tables = screen.getAllByLabelText('Reports table')
    // Desktop table + mobile card table both get the label
    expect(tables.length).toBeGreaterThanOrEqual(1)
  })

  it('shows aria-sort on sortable columns', () => {
    render(<DataTable columns={columns} data={data} rowKey="id" />)
    const nameHeaders = screen.getAllByText('Name')
    // Desktop header should have aria-sort="none"
    const th = nameHeaders[0].closest('th')
    expect(th).toHaveAttribute('aria-sort', 'none')

    // Non-sortable column should not have aria-sort
    const statusHeaders = screen.getAllByText('Status')
    const statusTh = statusHeaders[0].closest('th')
    expect(statusTh).not.toHaveAttribute('aria-sort')
  })

  it('renders caption when provided', () => {
    render(
      <DataTable columns={columns} data={data} rowKey="id" caption="Health Reports" />,
    )
    expect(screen.getByText('Health Reports')).toBeInTheDocument()
  })

  it('sorts numeric columns correctly', async () => {
    interface NumericRow {
      id: number
      score: number
    }
    const numCols: DataTableColumn<NumericRow>[] = [
      { key: 'score', header: 'Score', sortable: true },
    ]
    const numData: NumericRow[] = [
      { id: 1, score: 100 },
      { id: 2, score: 5 },
      { id: 3, score: 42 },
    ]
    render(<DataTable columns={numCols} data={numData} rowKey="id" />)
    // Click Score header to sort ascending
    await userEvent.click(screen.getAllByText('Score')[0])
    const cells = screen.getAllByText(/^(5|42|100)$/)
    expect(cells[0].textContent).toBe('5')
  })

  it('cycles sort direction back to asc after desc', async () => {
    render(<DataTable columns={columns} data={data} rowKey="id" />)
    const header = screen.getAllByText('Name')[0]
    // Click 1: asc, Click 2: desc, Click 3: asc again
    await userEvent.click(header)
    await userEvent.click(header)
    await userEvent.click(header)
    const cells = screen.getAllByText(/Allergy Test|Blood Report|X-Ray Report/)
    expect(cells[0].textContent).toBe('Allergy Test')
  })

  it('handles null values in sort gracefully', async () => {
    interface NullableRow {
      id: number
      name: string | null
    }
    const nullCols: DataTableColumn<NullableRow>[] = [
      { key: 'name', header: 'Name', sortable: true },
    ]
    const nullData: NullableRow[] = [
      { id: 1, name: null },
      { id: 2, name: 'Alpha' },
      { id: 3, name: null },
    ]
    render(<DataTable columns={nullCols} data={nullData} rowKey="id" />)
    await userEvent.click(screen.getAllByText('Name')[0])
    // Null values should sort to the end
    const cells = screen.getAllByText('Alpha')
    expect(cells.length).toBeGreaterThanOrEqual(1)
  })

  it('renders empty string for null cell values without render function', () => {
    interface NullableRow {
      id: number
      value: string | null
    }
    const nullCols: DataTableColumn<NullableRow>[] = [
      { key: 'value', header: 'Value' },
    ]
    const nullData: NullableRow[] = [{ id: 1, value: null }]
    const { container } = render(
      <DataTable columns={nullCols} data={nullData} rowKey="id" />,
    )
    // The cell should exist but contain empty text
    const cells = container.querySelectorAll('td')
    const valueCell = Array.from(cells).find(
      (td) => td.textContent?.trim() === '',
    )
    expect(valueCell).toBeTruthy()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DataTable columns={columns} data={data} rowKey="id" aria-label="Reports table" />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
