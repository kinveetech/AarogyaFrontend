'use client'

import { Box, Flex, Heading, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEmergencyAccessAudit } from '@/hooks/emergency'
import { EmptyStateView } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import type { EmergencyAccessAuditEvent } from '@/types/emergency'

const ACTION_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'pending' }> = {
  requested: { label: 'Requested', variant: 'info' },
  granted: { label: 'Granted', variant: 'success' },
  denied: { label: 'Denied', variant: 'error' },
  revoked: { label: 'Revoked', variant: 'warning' },
  expired: { label: 'Expired', variant: 'pending' },
  accessed: { label: 'Accessed', variant: 'info' },
}

function getActionDisplay(action: string) {
  const normalized = action.toLowerCase()
  return ACTION_LABELS[normalized] ?? { label: action, variant: 'pending' as const }
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function maskActorId(id: string | null): string {
  if (!id) return 'System'
  if (id.length <= 8) return '****' + id.slice(-4)
  return id.slice(0, 4) + '****' + id.slice(-4)
}

function AuditEventRow({ event }: { event: EmergencyAccessAuditEvent }) {
  const actionDisplay = getActionDisplay(event.action)
  const actorLabel = maskActorId(event.actorUserId)
  const roleLabel = event.actorRole ?? 'Unknown'

  return (
    <Box
      bg="bg.glass"
      backdropFilter="blur(16px)"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="xl"
      p="4"
      boxShadow="glass"
      data-testid="audit-event-row"
    >
      <Flex
        align={{ base: 'flex-start', md: 'center' }}
        gap="3"
        flexDirection={{ base: 'column', md: 'row' }}
      >
        {/* Action badge */}
        <StatusBadge variant={actionDisplay.variant}>
          {actionDisplay.label}
        </StatusBadge>

        {/* Actor info */}
        <Box flex="1" minW="0">
          <Flex align="center" gap="2" flexWrap="wrap">
            <Text fontFamily="mono" fontSize="0.85rem" color="text.primary" data-testid="actor-id">
              {actorLabel}
            </Text>
            <Box
              as="span"
              px="2"
              py="0.5"
              borderRadius="full"
              bg="bg.overlay"
              fontSize="0.7rem"
              fontWeight="medium"
              color="text.muted"
            >
              {roleLabel}
            </Box>
          </Flex>
          <Flex align="center" gap="2" mt="1" flexWrap="wrap">
            <Text fontSize="0.78rem" color="text.muted">
              {event.resourceType}
            </Text>
            {event.grantId && (
              <Text fontFamily="mono" fontSize="0.72rem" color="text.muted" data-testid="grant-id">
                Grant: {event.grantId.slice(0, 8)}...
              </Text>
            )}
          </Flex>
        </Box>

        {/* Timestamp */}
        <Text
          fontFamily="mono"
          fontSize="0.78rem"
          color="text.secondary"
          flexShrink={0}
          data-testid="audit-timestamp"
        >
          {formatTimestamp(event.occurredAt)}
        </Text>
      </Flex>

      {/* Extra data */}
      {Object.keys(event.data).length > 0 && (
        <Flex gap="2" mt="2" flexWrap="wrap">
          {Object.entries(event.data).map(([key, value]) => (
            <Box
              key={key}
              px="2.5"
              py="1"
              borderRadius="md"
              bg="bg.overlay"
              fontSize="0.72rem"
              fontFamily="mono"
              color="text.muted"
              data-testid="audit-data-tag"
            >
              {key}: {value}
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  )
}

export function EmergencyAccessAudit() {
  const { data, isLoading, isError } = useEmergencyAccessAudit()

  const events = data?.items ?? []
  const isEmpty = !isLoading && events.length === 0

  return (
    <Box data-testid="emergency-access-audit">
      <Heading
        as="h2"
        fontFamily="heading"
        fontSize={{ base: '1.15rem', md: '1.35rem' }}
        color="text.primary"
        letterSpacing="-0.01em"
        mb="4"
      >
        Access History
      </Heading>

      {/* Loading */}
      {isLoading && (
        <VStack gap="3" data-testid="audit-loading">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="72px" w="full" borderRadius="xl" />
          ))}
        </VStack>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <Box
          px="4"
          py="3"
          borderRadius="xl"
          bg="rgba(255, 107, 107, 0.1)"
          borderWidth="1px"
          borderColor="rgba(255, 107, 107, 0.25)"
          data-testid="audit-error"
        >
          <Text fontSize="0.88rem" color="coral.400">
            Unable to load access history. Please try again later.
          </Text>
        </Box>
      )}

      {/* Empty state */}
      {isEmpty && !isError && (
        <EmptyStateView
          icon={
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          }
          title="No access history"
          description="Emergency access events will appear here when they occur"
        />
      )}

      {/* Event list */}
      {!isLoading && !isError && events.length > 0 && (
        <VStack gap="3" align="stretch">
          {events.map((event) => (
            <AuditEventRow key={event.auditLogId} event={event} />
          ))}
          {data && data.totalCount > events.length && (
            <Text fontFamily="mono" fontSize="0.75rem" color="text.muted" textAlign="center" mt="1">
              Showing {events.length} of {data.totalCount} events
            </Text>
          )}
        </VStack>
      )}
    </Box>
  )
}
