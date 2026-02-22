'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Box, Button, Grid, Text } from '@chakra-ui/react'
import { useReport } from '@/hooks/reports/use-report'
import { useDeleteReport } from '@/hooks/reports/use-delete-report'
import { useDownloadUrl } from '@/hooks/reports/use-download-url'
import { ReportDetailHeader } from '@/components/reports/report-detail-header'
import { ReportDetailParameters } from '@/components/reports/report-detail-parameters'
import { ReportDetailActions } from '@/components/reports/report-detail-actions'
import { ReportDetailSkeleton } from '@/components/reports/report-detail-skeleton'

// Dynamic import to avoid loading pdfjs-dist on the server (no DOMMatrix in Node.js)
const PDFViewer = dynamic(
  () => import('@/components/reports/pdf-viewer').then((mod) => mod.PDFViewer),
  { ssr: false },
)
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyStateView } from '@/components/ui/empty-state'
import { ApiError } from '@/lib/api/client'

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
  const [pdfExpanded, setPdfExpanded] = useState(false)

  const handleTogglePdfExpand = useCallback(() => {
    setPdfExpanded((prev) => !prev)
  }, [])

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

      {/* Mobile-only View PDF toggle */}
      <Box display={{ base: 'block', lg: 'none' }} mb={pdfExpanded ? '0' : '4'}>
        <Button
          borderRadius="full"
          variant="outline"
          size="sm"
          onClick={handleTogglePdfExpand}
        >
          {pdfExpanded ? 'Hide PDF' : 'View PDF'}
        </Button>
      </Box>

      <Grid
        gridTemplateColumns={{ base: '1fr', lg: pdfExpanded ? '1fr' : '300px 1fr' }}
        gap="6"
      >
        {/* PDF viewer */}
        <Box
          display={{ base: pdfExpanded ? 'block' : 'none', lg: 'block' }}
          gridColumn={pdfExpanded ? '1 / -1' : undefined}
        >
          <PDFViewer
            reportId={id}
            fileType={report.fileType}
            expanded={pdfExpanded}
            onToggleExpand={handleTogglePdfExpand}
          />
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
