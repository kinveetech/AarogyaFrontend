'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Input } from '@chakra-ui/react'

export interface MaskedAadhaarInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  name?: string
  'data-testid'?: string
}

/**
 * Masks all but the last 4 digits of an Aadhaar number for display.
 *
 * Always pads to 12 characters and formats as "XXXX XXXX 1234".
 * For partial input (e.g., 5 digits "23456"), the result is "XXXX XXXX 3456".
 * The full raw Aadhaar number is NEVER shown.
 */
export function maskAadhaarDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 12)
  if (digits.length === 0) return ''

  const visibleCount = Math.min(digits.length, 4)
  const maskedCount = 12 - visibleCount
  const visible = digits.slice(-visibleCount)
  const combined = 'X'.repeat(maskedCount) + visible

  return `${combined.slice(0, 4)} ${combined.slice(4, 8)} ${combined.slice(8, 12)}`
}

/**
 * An Aadhaar input that masks all but the last 4 digits.
 * Internally tracks the raw digit string. Displays masked format.
 * Never exposes or displays the full Aadhaar number.
 *
 * All input is handled via onKeyDown to intercept digits and backspace.
 * The onChange handler is intentionally a no-op since onKeyDown calls
 * preventDefault() on all meaningful key events.
 */
export function MaskedAadhaarInput({
  value,
  onChange,
  onBlur,
  name,
  'data-testid': testId,
}: MaskedAadhaarInputProps) {
  const [rawDigits, setRawDigits] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setRawDigits(value)
  }, [value])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow navigation keys through without handling
      if (
        e.key === 'Tab' ||
        e.key === 'Escape' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'Home' ||
        e.key === 'End' ||
        e.ctrlKey ||
        e.metaKey
      ) {
        return
      }

      // Handle backspace
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        if (rawDigits.length > 0) {
          const newRaw = rawDigits.slice(0, -1)
          setRawDigits(newRaw)
          onChange(newRaw)
        }
        return
      }

      // Reject non-digit keys
      if (!/^\d$/.test(e.key)) {
        e.preventDefault()
        return
      }

      // Max 12 digits
      if (rawDigits.length >= 12) {
        e.preventDefault()
        return
      }

      e.preventDefault()
      const newRaw = rawDigits + e.key
      setRawDigits(newRaw)
      onChange(newRaw)
    },
    [rawDigits, onChange],
  )

  // No-op: all input is handled by onKeyDown which calls preventDefault()
  const handleChange = useCallback(() => {}, [])

  return (
    <Input
      ref={inputRef}
      value={maskAadhaarDisplay(rawDigits)}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={onBlur}
      name={name}
      inputMode="numeric"
      maxLength={14}
      placeholder="Enter 12-digit Aadhaar number"
      bg="bg.glass"
      borderColor="border.default"
      borderRadius="xl"
      color="text.primary"
      fontFamily="mono"
      letterSpacing="0.1em"
      data-testid={testId}
      autoComplete="off"
    />
  )
}
