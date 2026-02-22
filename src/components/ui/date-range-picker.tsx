'use client'

import { Box, Button, HStack, Text } from '@chakra-ui/react'
import {
  DatePickerRoot,
  DatePickerControl,
  DatePickerTrigger,
  DatePickerPositioner,
  DatePickerContent,
  DatePickerView,
  DatePickerViewControl,
  DatePickerViewTrigger,
  DatePickerPrevTrigger,
  DatePickerNextTrigger,
  DatePickerTable,
  DatePickerTableHead,
  DatePickerTableHeader,
  DatePickerTableBody,
  DatePickerTableRow,
  DatePickerTableCell,
  DatePickerTableCellTrigger,
  DatePickerRangeText,
  DatePickerPresetTrigger,
  DatePickerContext,
  type DatePickerValueChangeDetails,
} from '@ark-ui/react/date-picker'
import type { DateValue } from '@ark-ui/react/date-picker'

export type { DateValue }

export interface DateRangePickerProps {
  value?: DateValue[]
  onValueChange?: (details: DatePickerValueChangeDetails) => void
  placeholder?: string
  showPresets?: boolean
  disabled?: boolean
  'aria-label'?: string
}

const PRESETS = [
  { label: 'Last 7 days', value: 'last7Days' },
  { label: 'Last 30 days', value: 'last30Days' },
  { label: 'Last 90 days', value: 'last90Days' },
  { label: 'Last year', value: 'lastYear' },
] as const

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const

function formatDateValue(dv: DateValue): string {
  return `${dv.day} ${MONTHS_SHORT[dv.month - 1]} ${dv.year}`
}

function formatRange(values: DateValue[]): string {
  if (values.length === 0) return ''
  if (values.length === 1) return formatDateValue(values[0])
  return `${formatDateValue(values[0])} – ${formatDateValue(values[1])}`
}

export function DateRangePicker({
  value,
  onValueChange,
  placeholder = 'Select date range',
  showPresets = true,
  disabled,
  'aria-label': ariaLabel,
}: DateRangePickerProps) {
  const displayText = value && value.length > 0 ? formatRange(value) : placeholder

  return (
    <DatePickerRoot
      selectionMode="range"
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <DatePickerControl>
        <DatePickerTrigger asChild>
          <Button
            variant="outline"
            borderRadius="full"
            bg="bg.glass"
            backdropFilter="blur(12px)"
            borderColor="border.default"
            color={value && value.length > 0 ? 'text.primary' : 'text.muted'}
            fontWeight="normal"
            fontSize="sm"
            width={{ base: 'full', md: 'auto' }}
            aria-label={ariaLabel ?? placeholder}
          >
            <CalendarIcon />
            {displayText}
          </Button>
        </DatePickerTrigger>
      </DatePickerControl>

      <DatePickerPositioner>
        <DatePickerContent asChild>
          <Box
            bg="bg.glass"
            backdropFilter="blur(20px)"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="xl"
            boxShadow="glass"
            p="4"
            zIndex="popover"
          >
            {showPresets && (
              <HStack gap="1" mb="3" flexWrap="wrap" data-testid="preset-buttons">
                {PRESETS.map((preset) => (
                  <DatePickerPresetTrigger key={preset.value} value={preset.value} asChild>
                    <Button
                      size="xs"
                      variant="ghost"
                      borderRadius="full"
                      fontSize="xs"
                    >
                      {preset.label}
                    </Button>
                  </DatePickerPresetTrigger>
                ))}
              </HStack>
            )}

            <DatePickerView view="day">
              <DatePickerViewControl>
                <DatePickerPrevTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Previous month">
                    <ChevronLeftIcon />
                  </Button>
                </DatePickerPrevTrigger>
                <DatePickerViewTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <DatePickerRangeText />
                  </Button>
                </DatePickerViewTrigger>
                <DatePickerNextTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Next month">
                    <ChevronRightIcon />
                  </Button>
                </DatePickerNextTrigger>
              </DatePickerViewControl>
              <DatePickerContext>
                {(context) => (
                  <DatePickerTable>
                    <DatePickerTableHead>
                      <DatePickerTableRow>
                        {context.weekDays.map((weekDay, i) => (
                          <DatePickerTableHeader key={i}>
                            <Text fontSize="xs" color="text.muted" fontWeight="medium">
                              {weekDay.narrow}
                            </Text>
                          </DatePickerTableHeader>
                        ))}
                      </DatePickerTableRow>
                    </DatePickerTableHead>
                    <DatePickerTableBody>
                      {context.weeks.map((week, i) => (
                        <DatePickerTableRow key={i}>
                          {week.map((day, j) => (
                            <DatePickerTableCell key={j} value={day}>
                              <DatePickerTableCellTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  borderRadius="full"
                                  css={{
                                    '&[data-selected]': {
                                      bg: 'action.primary',
                                      color: 'action.primary.text',
                                    },
                                    '&[data-in-range]': {
                                      bg: 'bg.overlay',
                                    },
                                    '&[data-today]': {
                                      fontWeight: 'bold',
                                      borderWidth: '1px',
                                      borderColor: 'border.strong',
                                    },
                                    '&[data-disabled]': {
                                      opacity: 0.4,
                                      cursor: 'not-allowed',
                                    },
                                    '&[data-outside-range]': {
                                      color: 'text.muted',
                                      opacity: 0.5,
                                    },
                                  }}
                                >
                                  {day.day}
                                </Button>
                              </DatePickerTableCellTrigger>
                            </DatePickerTableCell>
                          ))}
                        </DatePickerTableRow>
                      ))}
                    </DatePickerTableBody>
                  </DatePickerTable>
                )}
              </DatePickerContext>
            </DatePickerView>

            <DatePickerView view="month">
              <DatePickerViewControl>
                <DatePickerPrevTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Previous year">
                    <ChevronLeftIcon />
                  </Button>
                </DatePickerPrevTrigger>
                <DatePickerViewTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <DatePickerRangeText />
                  </Button>
                </DatePickerViewTrigger>
                <DatePickerNextTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Next year">
                    <ChevronRightIcon />
                  </Button>
                </DatePickerNextTrigger>
              </DatePickerViewControl>
              <DatePickerContext>
                {(context) => (
                  <DatePickerTable>
                    <DatePickerTableBody>
                      {context.getMonthsGrid({ columns: 4 }).map((row, i) => (
                        <DatePickerTableRow key={i}>
                          {row.map((month, j) => (
                            <DatePickerTableCell key={j} value={month.value}>
                              <DatePickerTableCellTrigger asChild>
                                <Button variant="ghost" size="sm" borderRadius="full">
                                  {month.label}
                                </Button>
                              </DatePickerTableCellTrigger>
                            </DatePickerTableCell>
                          ))}
                        </DatePickerTableRow>
                      ))}
                    </DatePickerTableBody>
                  </DatePickerTable>
                )}
              </DatePickerContext>
            </DatePickerView>

            <DatePickerView view="year">
              <DatePickerViewControl>
                <DatePickerPrevTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Previous decade">
                    <ChevronLeftIcon />
                  </Button>
                </DatePickerPrevTrigger>
                <DatePickerViewTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <DatePickerRangeText />
                  </Button>
                </DatePickerViewTrigger>
                <DatePickerNextTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Next decade">
                    <ChevronRightIcon />
                  </Button>
                </DatePickerNextTrigger>
              </DatePickerViewControl>
              <DatePickerContext>
                {(context) => (
                  <DatePickerTable>
                    <DatePickerTableBody>
                      {context.getYearsGrid({ columns: 4 }).map((row, i) => (
                        <DatePickerTableRow key={i}>
                          {row.map((year, j) => (
                            <DatePickerTableCell key={j} value={year.value}>
                              <DatePickerTableCellTrigger asChild>
                                <Button variant="ghost" size="sm" borderRadius="full">
                                  {year.label}
                                </Button>
                              </DatePickerTableCellTrigger>
                            </DatePickerTableCell>
                          ))}
                        </DatePickerTableRow>
                      ))}
                    </DatePickerTableBody>
                  </DatePickerTable>
                )}
              </DatePickerContext>
            </DatePickerView>
          </Box>
        </DatePickerContent>
      </DatePickerPositioner>
    </DatePickerRoot>
  )
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
