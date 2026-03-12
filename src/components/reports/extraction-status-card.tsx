'use client'

import { Box, Button, Flex, Skeleton, Text } from '@chakra-ui/react'
import { StatusBadge } from '@/components/ui/status-badge'
import type { ExtractionStatus, ExtractionMethod } from '@/types/reports'
import type { StatusBadgeProps } from '@/components/ui/status-badge'

export interface ExtractionStatusCardProps {
  status: ExtractionStatus
  extractionMethod: ExtractionMethod | null
  structuringModel: string | null
  extractedParameterCount: number
  overallConfidence: number | null
  pageCount: number | null
  extractedAt: string | null
  errorMessage: string | null
  attemptCount: number
  onTriggerExtraction: () => void
  isTriggerPending: boolean
}

function getStatusBadgeVariant(status: ExtractionStatus): StatusBadgeProps['variant'] {
  if (status === 'extracted') return 'success'
  if (status === 'extraction_failed') return 'error'
  if (status === 'extracting') return 'warning'
  return 'pending'
}

function getStatusLabel(status: ExtractionStatus): string {
  if (status === 'extracted') return 'Completed'
  if (status === 'extraction_failed') return 'Failed'
  if (status === 'extracting') return 'Extracting'
  return 'Pending'
}

function getMethodLabel(method: ExtractionMethod): string {
  if (method === 'pdfpig') return 'PDF Text'
  if (method === 'textract') return 'Textract'
  if (method === 'pdfpig+textract') return 'PDF Text + Textract'
  return method
}

function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 8A5.5 5.5 0 113.05 5M3 2v3.05h3.05"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex justifyContent="space-between" alignItems="center" py="1.5">
      <Text fontSize="sm" color="text.muted">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="medium" fontFamily="mono">
        {value}
      </Text>
    </Flex>
  )
}

export function ExtractionStatusCard({
  status,
  extractionMethod,
  structuringModel,
  extractedParameterCount,
  overallConfidence,
  pageCount,
  extractedAt,
  errorMessage,
  attemptCount,
  onTriggerExtraction,
  isTriggerPending,
}: ExtractionStatusCardProps) {
  const canRetrigger = status === 'extraction_failed' || status === 'extracted'
  const isActive = status === 'extracting'

  return (
    <Box
      bg="bg.card"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="xl"
      boxShadow="glass"
      p={{ base: '4', md: '6' }}
      data-testid="extraction-status-card"
    >
      <Flex justifyContent="space-between" alignItems="center" mb="4">
        <Text fontSize="md" fontWeight="semibold" color="text.primary">
          AI Extraction
        </Text>
        <StatusBadge variant={getStatusBadgeVariant(status)}>
          {getStatusLabel(status)}
        </StatusBadge>
      </Flex>

      {isActive && (
        <Box
          bg="bg.overlay"
          borderRadius="lg"
          p="3"
          mb="4"
          data-testid="extraction-progress"
        >
          <Flex alignItems="center" gap="2">
            <Box
              as="span"
              display="inline-block"
              w="3"
              h="3"
              borderRadius="full"
              bg="amber.400"
              animation="pulse 1.5s ease-in-out infinite"
            />
            <Text fontSize="sm" color="text.secondary">
              Extracting parameters from your report...
            </Text>
          </Flex>
        </Box>
      )}

      {status === 'extraction_failed' && errorMessage && (
        <Box
          bg="red.50"
          color="red.700"
          border="1px solid"
          borderColor="red.200"
          borderRadius="lg"
          p="3"
          mb="4"
          css={{ _dark: { bg: 'red.900/20', color: 'red.300', borderColor: 'red.800' } }}
          role="alert"
          data-testid="extraction-error"
        >
          <Text fontSize="sm">{errorMessage}</Text>
        </Box>
      )}

      {extractionMethod && (
        <DetailRow label="Method" value={getMethodLabel(extractionMethod)} />
      )}
      {structuringModel && (
        <DetailRow label="Model" value={structuringModel} />
      )}
      {extractedParameterCount > 0 && (
        <DetailRow
          label="Parameters"
          value={String(extractedParameterCount)}
        />
      )}
      {overallConfidence !== null && (
        <DetailRow
          label="Confidence"
          value={formatConfidence(overallConfidence)}
        />
      )}
      {pageCount !== null && (
        <DetailRow label="Pages" value={String(pageCount)} />
      )}
      {extractedAt && (
        <DetailRow label="Extracted" value={formatDate(extractedAt)} />
      )}
      {attemptCount > 0 && (
        <DetailRow label="Attempts" value={String(attemptCount)} />
      )}

      {canRetrigger && (
        <Button
          borderRadius="full"
          variant="outline"
          size="sm"
          mt="4"
          onClick={onTriggerExtraction}
          loading={isTriggerPending}
          disabled={isTriggerPending}
        >
          <RefreshIcon />
          Re-extract
        </Button>
      )}
    </Box>
  )
}

export function ExtractionStatusSkeleton() {
  return (
    <Box
      bg="bg.card"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="xl"
      boxShadow="glass"
      p={{ base: '4', md: '6' }}
      data-testid="extraction-status-skeleton"
    >
      <Flex justifyContent="space-between" alignItems="center" mb="4">
        <Skeleton height="20px" width="120px" borderRadius="md" />
        <Skeleton height="22px" width="80px" borderRadius="full" />
      </Flex>
      <Skeleton height="16px" width="100%" borderRadius="md" mb="2" />
      <Skeleton height="16px" width="75%" borderRadius="md" mb="2" />
      <Skeleton height="16px" width="60%" borderRadius="md" />
    </Box>
  )
}
