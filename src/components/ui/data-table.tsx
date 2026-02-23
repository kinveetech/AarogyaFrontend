'use client'

import { type ReactNode, useState, useMemo } from 'react'
import {
  Box,
  Button,
  Skeleton,
  Text,
  TableRoot,
  TableScrollArea,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumnHeader,
} from '@chakra-ui/react'

export interface DataTableColumn<TData> {
  key: string
  header: string
  render?: (row: TData) => ReactNode
  sortable?: boolean
}

export interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[]
  data: TData[]
  rowKey: keyof TData
  loading?: boolean
  loadingRows?: number
  pageSizes?: number[]
  defaultPageSize?: number
  'aria-label'?: string
  caption?: string
}

type SortDirection = 'asc' | 'desc'

function SortIcon({ direction }: { direction: SortDirection | null }) {
  if (!direction) {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="currentColor"
        opacity={0.35}
        aria-hidden="true"
        style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }}
      >
        <path d="M6 2L9 5H3L6 2Z" />
        <path d="M6 10L3 7H9L6 10Z" />
      </svg>
    )
  }

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
      style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle' }}
    >
      {direction === 'asc' ? (
        <path d="M6 2L9 6H3L6 2Z" />
      ) : (
        <path d="M6 10L3 6H9L6 10Z" />
      )}
    </svg>
  )
}

export function DataTable<TData extends Record<string, any>>({
  columns,
  data,
  rowKey,
  loading = false,
  loadingRows = 5,
  pageSizes = [10, 25, 50],
  defaultPageSize = 10,
  caption,
  ...rest
}: DataTableProps<TData>) {
  const ariaLabel = rest['aria-label']
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const sortedData = useMemo(() => {
    if (!sortColumn) return data

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1

      let cmp: number
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal
      } else {
        cmp = String(aVal).localeCompare(String(bVal))
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [data, sortColumn, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)

  const pagedData = useMemo(() => {
    const start = safePage * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, safePage, pageSize])

  const handleSort = (columnKey: string) => {
    const col = columns.find((c) => c.key === columnKey)
    if (!col?.sortable) return

    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
    setPage(0)
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(0)
  }

  const showStart = sortedData.length === 0 ? 0 : safePage * pageSize + 1
  const showEnd = Math.min((safePage + 1) * pageSize, sortedData.length)

  const getCellValue = (row: TData, col: DataTableColumn<TData>) => {
    if (col.render) return col.render(row)
    return row[col.key] != null ? String(row[col.key]) : ''
  }

  return (
    <Box>
      {/* Desktop table */}
      <Box display={{ base: 'none', md: 'block' }}>
        <TableScrollArea>
          <TableRoot variant="line" aria-label={ariaLabel}>
            {caption && (
              <caption style={{ captionSide: 'top', textAlign: 'start', marginBottom: '8px' }}>
                <Text fontSize="sm" color="text.muted" fontWeight="medium">
                  {caption}
                </Text>
              </caption>
            )}
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableColumnHeader
                    key={col.key}
                    cursor={col.sortable ? 'pointer' : 'default'}
                    onClick={() => handleSort(col.key)}
                    aria-sort={
                      sortColumn === col.key
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : col.sortable
                          ? 'none'
                          : undefined
                    }
                    userSelect="none"
                    fontSize="xs"
                    fontWeight="semibold"
                    textTransform="uppercase"
                    letterSpacing="0.05em"
                    color="text.muted"
                  >
                    {col.header}
                    {col.sortable && (
                      <SortIcon
                        direction={sortColumn === col.key ? sortDirection : null}
                      />
                    )}
                  </TableColumnHeader>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: loadingRows }, (_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          <Skeleton height="16px" borderRadius="md" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : pagedData.map((row) => (
                    <TableRow key={String(row[rowKey])}>
                      {columns.map((col) => (
                        <TableCell key={col.key} fontSize="sm">
                          {getCellValue(row, col)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            </TableBody>
          </TableRoot>
        </TableScrollArea>
      </Box>

      {/* Mobile card layout */}
      <Box display={{ base: 'block', md: 'none' }} role="table" aria-label={ariaLabel}>
        {loading
          ? Array.from({ length: loadingRows }, (_, i) => (
              <Box
                key={`mobile-skeleton-${i}`}
                mb="3"
                p="4"
                borderRadius="lg"
                bg="bg.glass"
                backdropFilter="blur(12px)"
                borderWidth="1px"
                borderColor="border.subtle"
              >
                {columns.map((col) => (
                  <Box key={col.key} mb="2">
                    <Skeleton height="14px" width="60%" borderRadius="md" />
                  </Box>
                ))}
              </Box>
            ))
          : pagedData.map((row) => (
              <Box
                key={String(row[rowKey])}
                role="row"
                mb="3"
                p="4"
                borderRadius="lg"
                bg="bg.glass"
                backdropFilter="blur(12px)"
                borderWidth="1px"
                borderColor="border.subtle"
                boxShadow="sm"
              >
                {columns.map((col) => (
                  <Box
                    key={col.key}
                    role="cell"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py="1"
                  >
                    <Text
                      aria-hidden="true"
                      fontSize="xs"
                      fontWeight="semibold"
                      color="text.muted"
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                    >
                      {col.header}
                    </Text>
                    <Text fontSize="sm" color="text.primary" textAlign="end">
                      {getCellValue(row, col)}
                    </Text>
                  </Box>
                ))}
              </Box>
            ))}
      </Box>

      {/* Pagination */}
      {!loading && sortedData.length > 0 && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mt="4"
          flexWrap="wrap"
          gap="2"
        >
          <Text fontSize="sm" color="text.muted" data-testid="pagination-info" aria-live="polite">
            Showing {showStart}–{showEnd} of {sortedData.length}
          </Text>
          <Box display="flex" alignItems="center" gap="2">
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              aria-label="Rows per page"
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
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              borderRadius="full"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={safePage === 0}
            >
              Prev
            </Button>
            <Button
              variant="ghost"
              borderRadius="full"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={safePage >= totalPages - 1}
            >
              Next
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}
