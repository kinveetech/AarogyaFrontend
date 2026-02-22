'use client'

import { Box } from '@chakra-ui/react'
import { EmptyStateView } from '@/components/ui/empty-state'
import { ReportCard, type ReportCardProps } from './report-card'
import { ReportCardSkeleton } from './report-card-skeleton'
import type { Report } from '@/types/reports'

export interface ReportCardGridProps {
  reports: Report[]
  loading: boolean
  onView: ReportCardProps['onView']
  onDownload: ReportCardProps['onDownload']
  onDelete: ReportCardProps['onDelete']
  onUploadClick: () => void
}

function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="8" y="6" width="32" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
      <path d="M16 18h16M16 24h12M16 30h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function ReportCardGrid({
  reports,
  loading,
  onView,
  onDownload,
  onDelete,
  onUploadClick,
}: ReportCardGridProps) {
  if (loading) {
    return (
      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
        gap="4"
        data-testid="report-grid-loading"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <ReportCardSkeleton key={i} />
        ))}
      </Box>
    )
  }

  if (reports.length === 0) {
    return (
      <Box py="12" data-testid="report-grid-empty">
        <EmptyStateView
          icon={<EmptyIcon />}
          title="No reports found"
          description="Upload your first medical report to get started."
          action={{ label: 'Upload Report', onClick: onUploadClick }}
        />
      </Box>
    )
  }

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
      gap="4"
      data-testid="report-grid"
    >
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onView={onView}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </Box>
  )
}
