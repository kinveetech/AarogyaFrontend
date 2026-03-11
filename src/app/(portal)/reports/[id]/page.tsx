'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Box, Button, Grid, Text } from '@chakra-ui/react'
import { useReport } from '@/hooks/reports/use-report'
import { useDeleteReport } from '@/hooks/reports/use-delete-report'
import { useVerifiedDownload } from '@/hooks/reports/use-verified-download'
import { useExtractionStatus } from '@/hooks/reports/use-extraction-status'
import { useTriggerExtraction } from '@/hooks/reports/use-trigger-extraction'
import { ReportDetailHeader } from '@/components/reports/report-detail-header'
import { ReportDetailParameters } from '@/components/reports/report-detail-parameters'
import { ReportDetailActions } from '@/components/reports/report-detail-actions'
import { ReportDetailSkeleton } from '@/components/reports/report-detail-skeleton'
import {
  ExtractionStatusCard,
  ExtractionStatusSkeleton,
} from '@/components/reports/extraction-status-card'

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
  const extraction = useExtractionStatus(id)
  const triggerExtraction = useTriggerExtraction(id)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [pdfExpanded, setPdfExpanded] = useState(false)

  const verifiedDownload = useVerifiedDownload({
    onChecksumMismatch: () => {
      setDownloadError(
        'File integrity check failed. The downloaded file may be corrupted. Please try again.',
      )
    },
    onError: () => {
      setDownloadError('Failed to download the report. Please try again.')
    },
    onSuccess: () => {
      setDownloadError(null)
    },
  })

  const handleTogglePdfExpand = () => {
    setPdfExpanded((prev) => !prev)
  }

  const handleBack = () => router.push('/reports')

  const handleDownload = () => {
    setDownloadError(null)
    const fileName = report ? `${report.title}.pdf` : `report-${id}.pdf`
    verifiedDownload.download(id, fileName)
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    deleteReport.mutate(id, {
      onSuccess: () => {
        setDeleteDialogOpen(false)
        router.push('/reports')
      },
    })
  }

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

      {/* Extraction status */}
      <Box mt="6">
        {extraction.isLoading && <ExtractionStatusSkeleton />}
        {extraction.data && (
          <ExtractionStatusCard
            status={extraction.data.status}
            extractionMethod={extraction.data.extractionMethod}
            structuringModel={extraction.data.structuringModel}
            extractedParameterCount={extraction.data.extractedParameterCount}
            overallConfidence={extraction.data.overallConfidence}
            pageCount={extraction.data.pageCount}
            extractedAt={extraction.data.extractedAt}
            errorMessage={extraction.data.errorMessage}
            attemptCount={extraction.data.attemptCount}
            onTriggerExtraction={() => triggerExtraction.mutate()}
            isTriggerPending={triggerExtraction.isPending}
          />
        )}
      </Box>

      {downloadError && (
        <Box
          bg="red.50"
          color="red.700"
          border="1px solid"
          borderColor="red.200"
          borderRadius="lg"
          p="4"
          mt="4"
          css={{ _dark: { bg: 'red.900/20', color: 'red.300', borderColor: 'red.800' } }}
          role="alert"
        >
          <Text fontSize="sm">{downloadError}</Text>
        </Box>
      )}

      <ReportDetailActions
        onDownload={handleDownload}
        onDelete={handleDeleteClick}
        downloading={verifiedDownload.isPending}
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
