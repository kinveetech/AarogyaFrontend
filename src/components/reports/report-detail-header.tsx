'use client'

import { Box, Flex, HStack, Heading, IconButton, Text } from '@chakra-ui/react'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  REPORT_TYPE_LABELS,
  REPORT_STATUS_LABELS,
  STATUS_VARIANT_MAP,
} from './report-constants'
import type { ReportDetail } from '@/types/reports'

export interface ReportDetailHeaderProps {
  report: ReportDetail
  onBack: () => void
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M11 4L6 9l5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ReportDetailHeader({ report, onBack }: ReportDetailHeaderProps) {
  return (
    <Box mb="6">
      <Flex
        alignItems={{ base: 'flex-start', md: 'center' }}
        flexDirection={{ base: 'column', md: 'row' }}
        gap={{ base: '3', md: '4' }}
      >
        <HStack gap="3" flexShrink={0}>
          <IconButton
            aria-label="Back to reports"
            variant="ghost"
            borderRadius="md"
            bg="bg.glass"
            border="1px solid"
            borderColor="border.default"
            size="sm"
            onClick={onBack}
          >
            <BackIcon />
          </IconButton>
          <Heading
            as="h1"
            fontFamily="heading"
            fontSize={{ base: 'xl', md: '2xl' }}
            color="text.primary"
            fontWeight="semibold"
          >
            {report.title}
          </Heading>
        </HStack>

        <HStack gap="3" ml={{ base: '0', md: 'auto' }} flexShrink={0}>
          <StatusBadge variant={STATUS_VARIANT_MAP[report.status]}>
            {REPORT_STATUS_LABELS[report.status]}
          </StatusBadge>
          <Text fontFamily="mono" fontSize="sm" color="text.muted">
            {formatDate(report.reportDate)}
          </Text>
        </HStack>
      </Flex>

      <HStack gap="4" mt="3" flexWrap="wrap">
        <Text fontSize="sm" color="text.secondary">
          {REPORT_TYPE_LABELS[report.reportType]}
        </Text>
        {report.labName && (
          <Text fontSize="sm" color="text.secondary">
            {report.labName}
          </Text>
        )}
        {report.doctorName && (
          <Text fontSize="sm" color="text.secondary">
            {report.doctorName}
          </Text>
        )}
      </HStack>
    </Box>
  )
}
