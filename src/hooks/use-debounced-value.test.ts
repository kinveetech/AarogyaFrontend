import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from './use-debounced-value'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('does not update before the delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    )

    rerender({ value: 'b', delay: 300 })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current).toBe('a')
  })

  it('updates after the delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    )

    rerender({ value: 'b', delay: 300 })
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('b')
  })

  it('resets the timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    )

    rerender({ value: 'b', delay: 300 })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ value: 'c', delay: 300 })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // 'b' should not have been emitted — timer was reset
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current).toBe('c')
  })

  it('works with number values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 0, delay: 100 } },
    )

    rerender({ value: 42, delay: 100 })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(result.current).toBe(42)
  })
})
