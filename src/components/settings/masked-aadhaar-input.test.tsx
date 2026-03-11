import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@/test/render'
import { MaskedAadhaarInput, maskAadhaarDisplay } from './masked-aadhaar-input'

describe('maskAadhaarDisplay', () => {
  it('returns empty string for empty input', () => {
    expect(maskAadhaarDisplay('')).toBe('')
  })

  it('masks all but last 4 digits for full 12-digit number', () => {
    expect(maskAadhaarDisplay('234567890123')).toBe('XXXX XXXX 0123')
  })

  it('masks partial input with 8 digits', () => {
    expect(maskAadhaarDisplay('23456789')).toBe('XXXX XXXX 6789')
  })

  it('masks partial input with 5 digits', () => {
    expect(maskAadhaarDisplay('23456')).toBe('XXXX XXXX 3456')
  })

  it('shows masked format for 4 digits', () => {
    expect(maskAadhaarDisplay('2345')).toBe('XXXX XXXX 2345')
  })

  it('strips non-digit characters', () => {
    expect(maskAadhaarDisplay('23 45 67 89 01 23')).toBe('XXXX XXXX 0123')
  })

  it('truncates to 12 digits', () => {
    expect(maskAadhaarDisplay('2345678901234')).toBe('XXXX XXXX 0123')
  })

  it('handles single digit', () => {
    const result = maskAadhaarDisplay('2')
    expect(result).toBe('XXXX XXXX XXX2')
  })
})

describe('MaskedAadhaarInput', () => {
  it('renders with placeholder', () => {
    render(
      <MaskedAadhaarInput
        value=""
        onChange={vi.fn()}
        data-testid="aadhaar-input"
      />,
    )
    expect(screen.getByTestId('aadhaar-input')).toHaveAttribute(
      'placeholder',
      'Enter 12-digit Aadhaar number',
    )
  })

  it('renders with masked value', () => {
    render(
      <MaskedAadhaarInput
        value="234567890123"
        onChange={vi.fn()}
        data-testid="aadhaar-input"
      />,
    )
    expect(screen.getByTestId('aadhaar-input')).toHaveValue('XXXX XXXX 0123')
  })

  it('does not display full Aadhaar number', () => {
    render(
      <MaskedAadhaarInput
        value="234567890123"
        onChange={vi.fn()}
        data-testid="aadhaar-input"
      />,
    )
    const input = screen.getByTestId('aadhaar-input')
    expect((input as HTMLInputElement).value).not.toBe('234567890123')
    expect((input as HTMLInputElement).value).not.toContain('234567890123')
  })

  it('calls onChange with raw digits on keydown', () => {
    const onChange = vi.fn()
    render(
      <MaskedAadhaarInput
        value=""
        onChange={onChange}
        data-testid="aadhaar-input"
      />,
    )
    const input = screen.getByTestId('aadhaar-input')

    fireEvent.keyDown(input, { key: '2' })
    expect(onChange).toHaveBeenCalledWith('2')
  })

  it('rejects non-digit keys', () => {
    const onChange = vi.fn()
    render(
      <MaskedAadhaarInput
        value="23"
        onChange={onChange}
        data-testid="aadhaar-input"
      />,
    )
    const input = screen.getByTestId('aadhaar-input')

    fireEvent.keyDown(input, { key: 'a' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports backspace to delete last digit', () => {
    const onChange = vi.fn()
    render(
      <MaskedAadhaarInput
        value="234"
        onChange={onChange}
        data-testid="aadhaar-input"
      />,
    )
    const input = screen.getByTestId('aadhaar-input')

    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(onChange).toHaveBeenCalledWith('23')
  })

  it('does not exceed 12 digits', () => {
    const onChange = vi.fn()
    render(
      <MaskedAadhaarInput
        value="234567890123"
        onChange={onChange}
        data-testid="aadhaar-input"
      />,
    )
    const input = screen.getByTestId('aadhaar-input')

    fireEvent.keyDown(input, { key: '4' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('syncs with external value changes', () => {
    const { rerender } = render(
      <MaskedAadhaarInput
        value=""
        onChange={vi.fn()}
        data-testid="aadhaar-input"
      />,
    )

    rerender(
      <MaskedAadhaarInput
        value="234567890123"
        onChange={vi.fn()}
        data-testid="aadhaar-input"
      />,
    )

    expect(screen.getByTestId('aadhaar-input')).toHaveValue('XXXX XXXX 0123')
  })

  it('has autoComplete off to prevent browser autocomplete', () => {
    render(
      <MaskedAadhaarInput
        value=""
        onChange={vi.fn()}
        data-testid="aadhaar-input"
      />,
    )
    expect(screen.getByTestId('aadhaar-input')).toHaveAttribute('autocomplete', 'off')
  })

  it('uses numeric input mode', () => {
    render(
      <MaskedAadhaarInput
        value=""
        onChange={vi.fn()}
        data-testid="aadhaar-input"
      />,
    )
    expect(screen.getByTestId('aadhaar-input')).toHaveAttribute('inputmode', 'numeric')
  })

  it('calls onBlur when provided', () => {
    const onBlur = vi.fn()
    render(
      <MaskedAadhaarInput
        value=""
        onChange={vi.fn()}
        onBlur={onBlur}
        data-testid="aadhaar-input"
      />,
    )
    fireEvent.blur(screen.getByTestId('aadhaar-input'))
    expect(onBlur).toHaveBeenCalled()
  })

  it('handles backspace on empty input gracefully', () => {
    const onChange = vi.fn()
    render(
      <MaskedAadhaarInput
        value=""
        onChange={onChange}
        data-testid="aadhaar-input"
      />,
    )
    const input = screen.getByTestId('aadhaar-input')

    fireEvent.keyDown(input, { key: 'Backspace' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('allows Tab key through without handling', () => {
    const onChange = vi.fn()
    render(
      <MaskedAadhaarInput
        value="23"
        onChange={onChange}
        data-testid="aadhaar-input"
      />,
    )
    const input = screen.getByTestId('aadhaar-input')

    fireEvent.keyDown(input, { key: 'Tab' })
    expect(onChange).not.toHaveBeenCalled()
  })
})
