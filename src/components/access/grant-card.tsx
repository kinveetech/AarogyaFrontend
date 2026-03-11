'use client'

import { Box, Button, Flex, Text } from '@chakra-ui/react'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  getGrantStatus,
  formatExpiryText,
  getInitials,
} from './access-constants'
import type { AccessGrant } from '@/types/access'

export type GrantCardVariant = 'granted' | 'received'

export interface GrantCardProps {
  grant: AccessGrant
  variant?: GrantCardVariant
  onRevoke?: (id: string) => void
}

export function GrantCard({ grant, variant = 'granted', onRevoke }: GrantCardProps) {
  const { label, badgeVariant, daysRemaining, status } = getGrantStatus(
    grant.expiresAt,
    grant.revoked,
  )
  const isInactive = status === 'expired' || status === 'revoked'
  const isReceived = variant === 'received'

  const displayName = isReceived
    ? `Patient: ${grant.patientSub}`
    : grant.doctorName
  const initials = getInitials(isReceived ? grant.patientSub : grant.doctorName)
  const expiryText = status === 'revoked' ? '' : formatExpiryText(daysRemaining)
  const isExpiryWarning = status === 'expiring'

  const reportSummary = grant.allReports
    ? 'All reports'
    : `${grant.reportIds.length} report${grant.reportIds.length === 1 ? '' : 's'} shared`

  const showRevoke = !isReceived && !isInactive && onRevoke

  return (
    <Box
      bg="bg.glass"
      backdropFilter="blur(20px)"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="xl"
      p="5"
      boxShadow="glass"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
      opacity={isInactive ? 0.6 : 1}
      data-testid={isReceived ? 'received-grant-card' : 'grant-card'}
    >
      <Flex align="center" gap="4" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
        {/* Avatar */}
        <Flex
          align="center"
          justify="center"
          boxSize="48px"
          borderRadius="full"
          flexShrink={0}
          fontFamily="mono"
          fontSize="0.85rem"
          fontWeight="medium"
          bg={isInactive ? 'border.default' : 'action.primary'}
          color={isInactive ? 'text.muted' : 'action.primary.text'}
        >
          {initials}
        </Flex>

        {/* Info */}
        <Box flex="1" minW="0">
          <Text
            fontFamily="heading"
            fontSize="1.05rem"
            color="text.primary"
            lineHeight="1.3"
            {...(isReceived && { 'data-testid': 'received-grant-patient' })}
          >
            {displayName}
          </Text>
          <Flex align="center" gap="4" mt="1.5" flexWrap="wrap">
            <Text
              fontFamily="mono"
              fontSize="0.78rem"
              color="text.secondary"
              data-testid="report-summary"
            >
              {reportSummary}
            </Text>
            {expiryText && (
              <Text
                fontFamily="mono"
                fontSize="0.78rem"
                color={isExpiryWarning ? 'amber.400' : 'text.muted'}
              >
                {expiryText}
              </Text>
            )}
          </Flex>
          {grant.purpose && (
            <Text
              fontSize="0.82rem"
              color="text.muted"
              mt="1"
              lineClamp={1}
              data-testid="grant-purpose"
            >
              {grant.purpose}
            </Text>
          )}
        </Box>

        {/* Actions */}
        <Flex
          align="center"
          gap="3"
          flexShrink={0}
          w={{ base: '100%', md: 'auto' }}
          justify={{ base: 'flex-end', md: 'flex-start' }}
          mt={{ base: '1', md: '0' }}
        >
          <StatusBadge variant={badgeVariant}>{label}</StatusBadge>
          {showRevoke && (
            <Button
              variant="outline"
              size="sm"
              borderRadius="full"
              borderColor="coral.400"
              color="coral.400"
              _hover={{ bg: 'rgba(255, 107, 107, 0.08)' }}
              onClick={() => onRevoke(grant.grantId)}
              aria-label={`Revoke access for ${grant.doctorName}`}
            >
              Revoke
            </Button>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
