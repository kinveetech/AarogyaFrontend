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
 * The raw value (all digits) is stored internally and passed to onChange.
 *
 * Always pads to 12 characters and formats as "XXXX XXXX 1234".
 * For partial input (e.g., 5 digits "23456"), the result is "XXXX XXXX X456".
 * The full raw Aadhaar number is NEVER shown.
 */
export function maskAadhaarDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 12)
  if (digits.length === 0) return ''

  // Always build a 12-char string: mask leading digits, show last 4
  const visibleCount = Math.min(digits.length, 4)
  const maskedCount = 12 - visibleCount
  const visible = digits.slice(-visibleCount)
  const combined = 'X'.repeat(maskedCount) + visible

  // Format as "XXXX XXXX XXXX" groups
  return `${combined.slice(0, 4)} ${combined.slice(4, 8)} ${combined.slice(8, 12)}`
}

/**
 * An Aadhaar input that masks all but the last 4 digits.
 * Internally tracks the raw digit string. Displays masked format.
 * Never exposes or displays the full Aadhaar number.
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

  // Sync external value changes (e.g., form reset)
  useEffect(() => {
    setRawDigits(value)
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const displayVal = e.target.value
      // Extract only digits from input (user may type between X's or spaces)
      // We need to figure out what the user typed. Since we mask the display,
      // we track raw digits separately.
      const inputDigits = displayVal.replace(/[^0-9]/g, '')

      // If the display value has fewer non-X characters, user deleted something
      // We use a simple heuristic: count raw digits from the new input
      if (inputDigits.length <= 12) {
        // If the user deleted characters (display shorter than expected)
        if (displayVal.length < maskAadhaarDisplay(rawDigits).length && inputDigits.length < rawDigits.length) {
          // User is deleting - remove from the end of raw digits
          const newRaw = rawDigits.slice(0, Math.max(0, rawDigits.length - (rawDigits.length - inputDigits.length)))
          setRawDigits(newRaw)
          onChange(newRaw)
        } else {
          // User is typing - use the last N raw digits where N = new count
          // Find newly typed digits by comparing lengths
          const prevDigitCount = rawDigits.length
          if (inputDigits.length > prevDigitCount) {
            // New digits were added
            const newChars = inputDigits.slice(prevDigitCount)
            const newRaw = (rawDigits + newChars).slice(0, 12)
            setRawDigits(newRaw)
            onChange(newRaw)
          } else if (inputDigits.length < prevDigitCount) {
            // Digits were removed
            const newRaw = rawDigits.slice(0, inputDigits.length)
            setRawDigits(newRaw)
            onChange(newRaw)
          }
          // If equal, no change needed
        }
      }
    },
    [rawDigits, onChange],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow navigation and control keys
      if (
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'Tab' ||
        e.key === 'Escape' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'Home' ||
        e.key === 'End' ||
        (e.ctrlKey || e.metaKey)
      ) {
        if (e.key === 'Backspace' && rawDigits.length > 0) {
          e.preventDefault()
          const newRaw = rawDigits.slice(0, -1)
          setRawDigits(newRaw)
          onChange(newRaw)
        }
        return
      }

      // Only allow digits
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

  return (
    <Input
      ref={inputRef}
      value={maskAadhaarDisplay(rawDigits)}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={onBlur}
      name={name}
      inputMode="numeric"
      maxLength={14} // "XXXX XXXX XXXX" = 14 chars
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
