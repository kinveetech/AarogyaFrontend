'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Box, Button, Grid, Flex, Text } from '@chakra-ui/react'
import { useReport } from '@/hooks/reports/use-report'
import { useDeleteReport } from '@/hooks/reports/use-delete-report'
import { useDownloadUrl } from '@/hooks/reports/use-download-url'
import { ReportDetailHeader } from '@/components/reports/report-detail-header'
import { ReportDetailParameters } from '@/components/reports/report-detail-parameters'
import { ReportDetailActions } from '@/components/reports/report-detail-actions'
import { ReportDetailSkeleton } from '@/components/reports/report-detail-skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyStateView } from '@/components/ui/empty-state'
import { ApiError } from '@/lib/api/client'

function DocumentIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="10" y="4" width="28" height="40" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M18 16h12M18 22h12M18 28h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function NotFoundIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2" />
      <path d="M18 18l12 12M30 18L18 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 8L4 42h40L24 8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 20v10M24 34v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const { data: report, isLoading, error } = useReport(id)
  const deleteReport = useDeleteReport()
  const downloadUrl = useDownloadUrl()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleBack = useCallback(() => router.push('/reports'), [router])

  const handleDownload = useCallback(() => {
    downloadUrl.mutate(
      { reportId: id },
      {
        onSuccess: (res) => {
          window.open(res.downloadUrl, '_blank')
        },
      },
    )
  }, [downloadUrl, id])

  const handleDeleteClick = useCallback(() => {
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    deleteReport.mutate(id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        router.push('/reports')
      },
    })
  }, [deleteReport, id, router])

  // Loading state
  if (isLoading) {
    return (
      <Box maxW="1200px" mx="auto" px={{ base: '4', md: '6' }} py="6">
        <ReportDetailSkeleton />
      </Box>
    )
  }

  // 404 state
  if (error instanceof ApiError && error.status === 404) {
    return (
      <Box maxW="1200px" mx="auto" px={{ base: '4', md: '6' }} py="6">
        <EmptyStateView
          icon={<NotFoundIcon />}
          title="Report not found"
          description="The report you're looking for doesn't exist or has been removed."
          action={{ label: 'Back to Reports', onClick: handleBack }}
        />
      </Box>
    )
  }

  // Generic error state
  if (error) {
    return (
      <Box maxW="1200px" mx="auto" px={{ base: '4', md: '6' }} py="6">
        <EmptyStateView
          icon={<ErrorIcon />}
          title="Something went wrong"
          description="We couldn't load this report. Please try again."
          action={{ label: 'Retry', onClick: () => window.location.reload() }}
        />
      </Box>
    )
  }

  // No data (shouldn't happen if no error/loading, but guard)
  if (!report) return null

  return (
    <Box maxW="1200px" mx="auto" px={{ base: '4', md: '6' }} py="6">
      <ReportDetailHeader report={report} onBack={handleBack} />

      <Grid gridTemplateColumns={{ base: '1fr', lg: '300px 1fr' }} gap="6">
        {/* PDF preview placeholder */}
        <Box
          display={{ base: 'none', lg: 'flex' }}
          bg="bg.overlay"
          borderRadius="xl"
          border="1px solid"
          borderColor="border.subtle"
          aspectRatio="3/4"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap="3"
        >
          <Flex color="text.muted" opacity={0.5}>
            <DocumentIcon />
          </Flex>
          <Text fontSize="sm" color="text.muted" fontFamily="mono">
            {report.fileKey}
          </Text>
        </Box>

        {/* Parameter table */}
        {report.parameters.length > 0 && (
          <ReportDetailParameters parameters={report.parameters} />
        )}
        {report.parameters.length === 0 && (
          <Box
            bg="bg.card"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="xl"
            boxShadow="glass"
            p={{ base: '4', md: '6' }}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="text.muted" fontSize="sm">
              No parameters available for this report.
            </Text>
          </Box>
        )}
      </Grid>

      <ReportDetailActions
        onDownload={handleDownload}
        onDelete={handleDeleteClick}
        downloading={downloadUrl.isPending}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Report"
        subtitle={report.title}
        message="This action cannot be undone. The report and all associated data will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={deleteReport.isPending}
      />
    </Box>
  )
}
