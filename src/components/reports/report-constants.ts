import type { ReportType, ReportStatus } from '@/types/reports'
import type { StatusBadgeProps } from '@/components/ui/status-badge'

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  lab: 'Lab Test',
  prescription: 'Prescription',
  imaging: 'Imaging',
  discharge: 'Discharge',
  other: 'Other',
}

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  verified: 'Verified',
}

export const STATUS_VARIANT_MAP: Record<ReportStatus, StatusBadgeProps['variant']> = {
  pending: 'pending',
  processing: 'warning',
  verified: 'success',
}

export interface FilterOption<T extends string> {
  value: T | 'all'
  label: string
}

export const TYPE_FILTER_OPTIONS: FilterOption<ReportType>[] = [
  { value: 'all', label: 'All Types' },
  { value: 'lab', label: 'Lab Test' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'discharge', label: 'Discharge' },
  { value: 'other', label: 'Other' },
]

export const STATUS_FILTER_OPTIONS: FilterOption<ReportStatus>[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'verified', label: 'Verified' },
]

export const PAGE_SIZES = [9, 18, 36] as const

export const DEFAULT_PAGE_SIZE = 9

export const SEARCH_DEBOUNCE_MS = 300
