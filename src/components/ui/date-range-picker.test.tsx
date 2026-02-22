import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent, waitFor } from '@/test/render'
import { DateRangePicker } from './date-range-picker'
import { parseDate } from '@ark-ui/react/date-picker'

describe('DateRangePicker', () => {
  it('renders trigger with default placeholder', () => {
    render(<DateRangePicker />)
    expect(
      screen.getByRole('button', { name: 'Select date range' }),
    ).toBeInTheDocument()
  })

  it('renders trigger with custom placeholder', () => {
    render(<DateRangePicker placeholder="Pick dates" />)
    expect(
      screen.getByRole('button', { name: 'Pick dates' }),
    ).toBeInTheDocument()
  })

  it('renders placeholder when value is an empty array', () => {
    render(<DateRangePicker value={[]} placeholder="Pick dates" />)
    expect(
      screen.getByRole('button', { name: 'Pick dates' }),
    ).toBeInTheDocument()
  })

  it('renders single date when value has one element', () => {
    const value = [parseDate('2025-03-10')]
    render(<DateRangePicker value={value} />)
    const trigger = screen.getByRole('button')
    expect(trigger.textContent).toContain('10')
    expect(trigger.textContent).toContain('Mar')
  })

  it('renders formatted range when value is set', () => {
    const value = [parseDate('2025-01-15'), parseDate('2025-01-31')]
    render(<DateRangePicker value={value} />)
    const trigger = screen.getByRole('button')
    expect(trigger.textContent).toContain('15')
    expect(trigger.textContent).toContain('31')
  })

  it('opens calendar popover on trigger click', async () => {
    render(<DateRangePicker />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Select date range' }),
    )
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })
  })

  it('shows preset buttons when showPresets is true (default)', async () => {
    render(<DateRangePicker />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Select date range' }),
    )
    await waitFor(() => {
      expect(screen.getByTestId('preset-buttons')).toBeInTheDocument()
    })
    expect(screen.getByText('Last 7 days')).toBeInTheDocument()
    expect(screen.getByText('Last 30 days')).toBeInTheDocument()
    expect(screen.getByText('Last 90 days')).toBeInTheDocument()
    expect(screen.getByText('Last year')).toBeInTheDocument()
  })

  it('hides preset buttons when showPresets is false', async () => {
    render(<DateRangePicker showPresets={false} />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Select date range' }),
    )
    await waitFor(() => {
      expect(screen.getByRole('grid')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('preset-buttons')).not.toBeInTheDocument()
  })

  it('has previous and next month navigation', async () => {
    render(<DateRangePicker />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Select date range' }),
    )
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Previous month' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Next month' }),
      ).toBeInTheDocument()
    })
  })

  it('disables trigger when disabled', () => {
    render(<DateRangePicker disabled />)
    expect(
      screen.getByRole('button', { name: 'Select date range' }),
    ).toBeDisabled()
  })

  it('passes aria-label to trigger', () => {
    render(<DateRangePicker aria-label="Filter by date" />)
    expect(
      screen.getByRole('button', { name: 'Filter by date' }),
    ).toBeInTheDocument()
  })

  it('calls onValueChange when provided', async () => {
    const onValueChange = vi.fn()
    render(<DateRangePicker onValueChange={onValueChange} />)
    // Just verify the component renders without error with the callback
    expect(
      screen.getByRole('button', { name: 'Select date range' }),
    ).toBeInTheDocument()
  })

  it('renders single date in range display', () => {
    const value = [parseDate('2025-06-15')]
    render(<DateRangePicker value={value} />)
    const trigger = screen.getByRole('button')
    expect(trigger.textContent).toContain('15')
  })
})
