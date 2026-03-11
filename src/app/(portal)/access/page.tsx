'use client'

import { useState, useMemo, useCallback } from 'react'
import { Box, Heading, Skeleton, VStack } from '@chakra-ui/react'
import { useAccessGrants, useRevokeGrant, useCreateGrant } from '@/hooks/access'
import { AccessPageHeader, GrantCard, GrantModal } from '@/components/access'
import { getGrantStatus } from '@/components/access/access-constants'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyStateView } from '@/components/ui/empty-state'
import type { AccessGrant } from '@/types/access'
import type { GrantModalSubmitData } from '@/components/access/grant-modal'

export default function AccessPage() {
  const { data, isLoading } = useAccessGrants()
  const revokeGrant = useRevokeGrant()
  const createGrant = useCreateGrant()

  const [modalOpen, setModalOpen] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<AccessGrant | null>(null)

  const grants = useMemo(() => data?.items ?? [], [data])

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

  const handleRevokeClick = useCallback(
    (id: string) => {
      const grant = grants.find((g) => g.grantId === id)
      if (grant) setRevokeTarget(grant)
    },
    [grants],
  )

  const handleRevokeConfirm = useCallback(() => {
    if (!revokeTarget) return
    revokeGrant.mutate(revokeTarget.grantId, {
      onSuccess: () => setRevokeTarget(null),
    })
  }, [revokeTarget, revokeGrant])

  const handleGrantSubmit = useCallback(
    (formData: GrantModalSubmitData) => {
      createGrant.mutate(
        {
          doctorSub: formData.doctorId,
          doctorName: formData.doctorName,
          allReports: formData.allReports,
          reportIds: formData.reportIds,
          purpose: formData.purpose,
          expiresAt: formData.expiresAt,
        },
        {
          onSuccess: () => setModalOpen(false),
        },
      )
    },
    [createGrant],
  )

  const isEmpty = !isLoading && grants.length === 0

  return (
    <Box maxW="1200px" mx="auto" px={{ base: '4', md: '6' }} py="6">
      <AccessPageHeader onGrantClick={() => setModalOpen(true)} />

      {/* Loading state */}
      {isLoading && (
        <VStack gap="3" data-testid="access-loading">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              height="80px"
              w="full"
              borderRadius="xl"
            />
          ))}
        </VStack>
      )}

      {/* Empty state */}
      {isEmpty && (
        <EmptyStateView
          icon={
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            >
              <path d="M24 4 L42 12 L42 26 C42 36 33 43 24 46 C15 43 6 36 6 26 L6 12 Z" />
              <path
                d="M17 24 L22 29 L31 19"
                strokeLinecap="round"
              />
            </svg>
          }
          title="No active grants"
          description="Grant a doctor access to your reports"
          action={{
            label: 'Grant Access',
            onClick: () => setModalOpen(true),
          }}
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
                onRevoke={handleRevokeClick}
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
                onRevoke={handleRevokeClick}
              />
            ))}
          </VStack>
        </Box>
      )}

      {/* Grant modal */}
      <GrantModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleGrantSubmit}
        loading={createGrant.isPending}
      />

      {/* Revoke confirmation */}
      <ConfirmDialog
        open={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevokeConfirm}
        title="Revoke Access"
        subtitle={revokeTarget?.doctorName}
        message="This doctor will no longer be able to view your shared reports. You can grant access again later."
        confirmLabel="Revoke"
        cancelLabel="Cancel"
        destructive
        loading={revokeGrant.isPending}
      />
    </Box>
  )
}
