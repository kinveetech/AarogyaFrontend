'use client'

import { Box, Button, HStack } from '@chakra-ui/react'
import {
  DateRangePicker,
  type DateValue,
  type DatePickerValueChangeDetails,
} from '@/components/ui/date-range-picker'
import {
  TYPE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from './report-constants'
import type { ReportType, ReportStatus } from '@/types/reports'

export interface ReportFilterBarProps {
  selectedType: ReportType | 'all'
  onTypeChange: (value: ReportType | 'all') => void
  selectedStatus: ReportStatus | 'all'
  onStatusChange: (value: ReportStatus | 'all') => void
  dateRange?: DateValue[]
  onDateRangeChange?: (details: DatePickerValueChangeDetails) => void
}

export function ReportFilterBar({
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  dateRange,
  onDateRangeChange,
}: ReportFilterBarProps) {
  return (
    <Box mb="6">
      <HStack gap="2" flexWrap="wrap" mb="3" role="group" aria-label="Filter by report type">
        {TYPE_FILTER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="xs"
            borderRadius="full"
            variant={selectedType === option.value ? 'solid' : 'ghost'}
            bg={selectedType === option.value ? 'action.primary' : undefined}
            color={selectedType === option.value ? 'action.primary.text' : 'text.secondary'}
            onClick={() => onTypeChange(option.value as ReportType | 'all')}
          >
            {option.label}
          </Button>
        ))}
      </HStack>

      <HStack gap="2" flexWrap="wrap" role="group" aria-label="Filter by status">
        {STATUS_FILTER_OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="xs"
            borderRadius="full"
            variant={selectedStatus === option.value ? 'solid' : 'ghost'}
            bg={selectedStatus === option.value ? 'action.primary' : undefined}
            color={selectedStatus === option.value ? 'action.primary.text' : 'text.secondary'}
            onClick={() => onStatusChange(option.value as ReportStatus | 'all')}
          >
            {option.label}
          </Button>
        ))}

        <DateRangePicker
          value={dateRange}
          onValueChange={onDateRangeChange}
          placeholder="Date range"
          aria-label="Filter by date range"
        />
      </HStack>
    </Box>
  )
}
