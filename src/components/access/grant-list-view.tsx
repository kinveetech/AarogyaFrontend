'use client'

import { type ReactNode, useMemo } from 'react'
import { Box, Heading, Skeleton, VStack } from '@chakra-ui/react'
import { GrantCard } from './grant-card'
import type { GrantCardVariant } from './grant-card'
import { getGrantStatus } from './access-constants'
import { EmptyStateView } from '@/components/ui/empty-state'
import type { AccessGrant } from '@/types/access'

export interface GrantListViewProps {
  grants: AccessGrant[]
  isLoading: boolean
  variant: GrantCardVariant
  emptyIcon: ReactNode
  emptyTitle: string
  emptyDescription: string
  emptyAction?: { label: string; onClick: () => void }
  onRevoke?: (id: string) => void
  loadingTestId?: string
}

export function GrantListView({
  grants,
  isLoading,
  variant,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRevoke,
  loadingTestId = 'grants-loading',
}: GrantListViewProps) {
  const activeGrants = useMemo(
    () =>
      grants.filter((g) => {
        const { status } = getGrantStatus(g.expiresAt, g.revoked)
        return status !== 'expired' && status !== 'revoked'
      }),
    [grants],
  )

  const inactiveGrants = useMemo(
    () =>
      grants.filter((g) => {
        const { status } = getGrantStatus(g.expiresAt, g.revoked)
        return status === 'expired' || status === 'revoked'
      }),
    [grants],
  )

  const isEmpty = !isLoading && grants.length === 0

  return (
    <>
      {/* Loading state */}
      {isLoading && (
        <VStack gap="3" data-testid={loadingTestId}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="80px" w="full" borderRadius="xl" />
          ))}
        </VStack>
      )}

      {/* Empty state */}
      {isEmpty && (
        <EmptyStateView
          icon={emptyIcon}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      )}

      {/* Active grants */}
      {!isLoading && activeGrants.length > 0 && (
        <Box mb="8">
          <Heading
            as="h2"
            fontFamily="heading"
            fontSize="1.15rem"
            color="text.primary"
            mb="4"
          >
            Active Grants
          </Heading>
          <VStack gap="3" align="stretch">
            {activeGrants.map((grant) => (
              <GrantCard
                key={grant.grantId}
                grant={grant}
                variant={variant}
                onRevoke={onRevoke}
              />
            ))}
          </VStack>
        </Box>
      )}

      {/* Inactive grants (expired + revoked) */}
      {!isLoading && inactiveGrants.length > 0 && (
        <Box>
          <Heading
            as="h2"
            fontFamily="heading"
            fontSize="1.15rem"
            color="text.primary"
            mb="4"
          >
            Inactive Grants
          </Heading>
          <VStack gap="3" align="stretch">
            {inactiveGrants.map((grant) => (
              <GrantCard
                key={grant.grantId}
                grant={grant}
                variant={variant}
                onRevoke={onRevoke}
              />
            ))}
          </VStack>
        </Box>
      )}
    </>
  )
}
