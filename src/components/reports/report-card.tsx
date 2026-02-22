'use client'

import { Box, Text, HStack, IconButton } from '@chakra-ui/react'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  REPORT_TYPE_LABELS,
  REPORT_STATUS_LABELS,
  STATUS_VARIANT_MAP,
} from './report-constants'
import type { Report } from '@/types/reports'

export interface ReportCardProps {
  report: Report
  onView: (id: string) => void
  onDownload: (id: string) => void
  onDelete: (id: string) => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ReportCard({ report, onView, onDownload, onDelete }: ReportCardProps) {
  return (
    <Box
      bg="bg.glass"
      backdropFilter="blur(12px)"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="lg"
      p="5"
      transition="all 0.2s"
      cursor="pointer"
      _hover={{ boxShadow: 'md', transform: 'translateY(-1px)' }}
      onClick={() => onView(report.id)}
      data-testid="report-card"
    >
      <HStack justifyContent="space-between" mb="3">
        <Text fontSize="xs" color="text.muted" fontWeight="medium">
          {REPORT_TYPE_LABELS[report.reportType]}
        </Text>
        <StatusBadge variant={STATUS_VARIANT_MAP[report.status]}>
          {REPORT_STATUS_LABELS[report.status]}
        </StatusBadge>
      </HStack>

      <Text
        fontSize="md"
        fontWeight="semibold"
        color="text.primary"
        mb="1"
        lineClamp={2}
      >
        {report.title}
      </Text>

      <Text fontSize="xs" color="text.muted" mb="3">
        {formatDate(report.reportDate)}
      </Text>

      {(report.labName ?? report.doctorName) && (
        <Text fontSize="xs" color="text.secondary" mb="1" lineClamp={1}>
          {report.labName ?? report.doctorName}
        </Text>
      )}

      {report.highlightParameter && (
        <Text
          fontSize="xs"
          fontFamily="mono"
          color="text.secondary"
          bg="bg.overlay"
          px="2"
          py="0.5"
          borderRadius="md"
          display="inline-block"
          mb="3"
        >
          {report.highlightParameter}
        </Text>
      )}

      <HStack justifyContent="flex-end" gap="1" mt="2">
        <IconButton
          aria-label="Download report"
          variant="ghost"
          size="sm"
          borderRadius="full"
          onClick={(e) => {
            e.stopPropagation()
            onDownload(report.id)
          }}
        >
          <DownloadIcon />
        </IconButton>
        <IconButton
          aria-label="Delete report"
          variant="ghost"
          size="sm"
          borderRadius="full"
          color="coral.400"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(report.id)
          }}
        >
          <TrashIcon />
        </IconButton>
      </HStack>
    </Box>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2v8m0 0l-3-3m3 3l3-3M3 12h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M5.5 2h5M2.5 4h11M12 4l-.5 8.5a1 1 0 01-1 .5H5.5a1 1 0 01-1-.5L4 4m3 3v4m2-4v4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
