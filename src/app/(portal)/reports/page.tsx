'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Box } from '@chakra-ui/react'
import { useReports, useDeleteReport, useVerifiedDownload } from '@/hooks/reports'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  ReportsPageHeader,
  ReportFilterBar,
  ReportCardGrid,
  ReportPagination,
} from '@/components/reports'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { DateValue, DatePickerValueChangeDetails } from '@/components/ui/date-range-picker'
import type { ReportType, ReportStatus, Report } from '@/types/reports'
import {
  DEFAULT_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
} from '@/components/reports/report-constants'

function isDateInRange(dateStr: string, range: DateValue[]): boolean {
  if (range.length < 2) return true
  const date = new Date(dateStr)
  const start = new Date(range[0].year, range[0].month - 1, range[0].day)
  const end = new Date(range[1].year, range[1].month - 1, range[1].day, 23, 59, 59)
  return date >= start && date <= end
}

function filterReportsClientSide(
  items: Report[],
  status: ReportStatus | 'all',
  dateRange?: DateValue[],
): Report[] {
  return items.filter((report) => {
    if (status !== 'all' && report.status !== status) return false
    if (dateRange && dateRange.length >= 2 && !isDateInRange(report.reportDate, dateRange)) {
      return false
    }
    return true
  })
}

export default function ReportsPage() {
  const router = useRouter()

  // Server-side params
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
  const [selectedType, setSelectedType] = useState<ReportType | 'all'>('all')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // Client-side filters
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('all')
  const [dateRange, setDateRange] = useState<DateValue[] | undefined>()

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1)
  }, [])

  const apiParams = useMemo(
    () => ({
      page,
      pageSize,
      search: debouncedSearch || undefined,
      category: selectedType === 'all' ? undefined : selectedType,
    }),
    [page, pageSize, debouncedSearch, selectedType],
  )

  const { data, isLoading } = useReports(apiParams)
  const deleteReport = useDeleteReport()
  const verifiedDownload = useVerifiedDownload()

  // Client-side filtering
  const filteredReports = useMemo(
    () => filterReportsClientSide(data?.items ?? [], selectedStatus, dateRange),
    [data?.items, selectedStatus, dateRange],
  )

  // Delete flow
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null)

  const handleView = useCallback(
    (id: string) => router.push(`/reports/${id}`),
    [router],
  )

  const handleDownload = useCallback(
    (id: string) => {
      const report = data?.items.find((r) => r.id === id)
      const fileName = report ? `${report.title}.pdf` : `report-${id}.pdf`
      verifiedDownload.download(id, fileName)
    },
    [verifiedDownload, data?.items],
  )

  const handleDeleteClick = useCallback(
    (id: string) => {
      const report = data?.items.find((r) => r.id === id)
      if (report) setDeleteTarget(report)
    },
    [data?.items],
  )

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    deleteReport.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }, [deleteTarget, deleteReport])

  const handleTypeChange = useCallback((type: ReportType | 'all') => {
    setSelectedType(type)
    setPage(1)
  }, [])

  const handleUploadClick = useCallback(
    () => router.push('/reports/upload'),
    [router],
  )

  const handleDateRangeChange = useCallback(
    (details: DatePickerValueChangeDetails) => {
      setDateRange(details.value.length > 0 ? details.value : undefined)
    },
    [],
  )

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  return (
    <Box maxW="1200px" mx="auto" px={{ base: '4', md: '6' }} py="6">
      <ReportsPageHeader
        search={search}
        onSearchChange={handleSearchChange}
        onUploadClick={handleUploadClick}
      />

      <ReportFilterBar
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />

      <ReportCardGrid
        reports={filteredReports}
        loading={isLoading}
        onView={handleView}
        onDownload={handleDownload}
        onDelete={handleDeleteClick}
        onUploadClick={handleUploadClick}
      />

      <ReportPagination
        page={page}
        pageSize={pageSize}
        totalCount={data?.totalCount ?? 0}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Report"
        subtitle={deleteTarget?.title}
        message="This action cannot be undone. The report and all associated data will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={deleteReport.isPending}
      />
    </Box>
  )
}
