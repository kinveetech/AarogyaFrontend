import type { ReportType, ReportStatus, ParameterStatus } from '@/types/reports'
import type { StatusBadgeProps } from '@/components/ui/status-badge'

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  blood_test: 'Blood Test',
  urine_test: 'Urine Test',
  radiology: 'Radiology',
  cardiology: 'Cardiology',
  other: 'Other',
}

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  draft: 'Draft',
  uploaded: 'Uploaded',
  processing: 'Processing',
  clean: 'Clean',
  infected: 'Quarantined',
  validated: 'Validated',
  published: 'Published',
  archived: 'Archived',
  extracting: 'Extracting',
  extracted: 'Extracted',
  extraction_failed: 'Extraction Failed',
}

export const STATUS_VARIANT_MAP: Record<ReportStatus, StatusBadgeProps['variant']> = {
  draft: 'pending',
  uploaded: 'info',
  processing: 'warning',
  clean: 'info',
  infected: 'error',
  validated: 'success',
  published: 'success',
  archived: 'pending',
  extracting: 'warning',
  extracted: 'info',
  extraction_failed: 'error',
}

export interface FilterOption<T extends string> {
  value: T | 'all'
  label: string
}

export const TYPE_FILTER_OPTIONS: FilterOption<ReportType>[] = [
  { value: 'all', label: 'All Types' },
  { value: 'blood_test', label: 'Blood Test' },
  { value: 'urine_test', label: 'Urine Test' },
  { value: 'radiology', label: 'Radiology' },
  { value: 'cardiology', label: 'Cardiology' },
  { value: 'other', label: 'Other' },
]

export const STATUS_FILTER_OPTIONS: FilterOption<ReportStatus>[] = [
  { value: 'all', label: 'All Status' },
  { value: 'uploaded', label: 'Uploaded' },
  { value: 'processing', label: 'Processing' },
  { value: 'clean', label: 'Clean' },
  { value: 'validated', label: 'Validated' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

export const PARAMETER_STATUS_LABELS: Record<ParameterStatus, string> = {
  normal: 'Normal',
  high: 'High',
  low: 'Low',
}

export const PARAMETER_STATUS_VARIANT_MAP: Record<ParameterStatus, StatusBadgeProps['variant']> = {
  normal: 'success',
  high: 'error',
  low: 'error',
}

export const PAGE_SIZES = [9, 18, 36] as const

export const DEFAULT_PAGE_SIZE = 9

export const SEARCH_DEBOUNCE_MS = 300
