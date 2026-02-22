'use client'

import { Box, Button, Text } from '@chakra-ui/react'
import { PAGE_SIZES } from './report-constants'

export interface ReportPaginationProps {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function ReportPagination({
  page,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: ReportPaginationProps) {
  if (totalCount === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalCount)

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mt="6"
      flexWrap="wrap"
      gap="2"
    >
      <Text fontSize="sm" color="text.muted" data-testid="pagination-info">
        Showing {start}–{end} of {totalCount}
      </Text>

      <Box display="flex" alignItems="center" gap="2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Reports per page"
          style={{
            fontSize: '0.875rem',
            borderRadius: '12px',
            padding: '4px 8px',
            border: '1px solid',
            borderColor: 'inherit',
            background: 'transparent',
            color: 'inherit',
          }}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>

        <Button
          variant="ghost"
          borderRadius="full"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Prev
        </Button>
        <Button
          variant="ghost"
          borderRadius="full"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </Box>
    </Box>
  )
}
