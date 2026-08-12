'use client'

import { useState, useMemo, useCallback } from 'react'
import { Box, Flex, Skeleton } from '@chakra-ui/react'
import { useConsents, useUpdateConsent } from '@/hooks/consents'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SettingsSection } from './settings-section'
import { ConsentToggleRow } from './consent-toggle-row'
import { CONSENT_ITEMS } from './consent-constants'
import type { ConsentPurpose } from '@/types/consent'

export function ConsentsSection() {
  const { data, isLoading } = useConsents()
  const updateConsent = useUpdateConsent()
  const [revokePurpose, setRevokePurpose] = useState<ConsentPurpose | null>(null)

  const consentMap = useMemo(() => {
    if (!data) return new Map<ConsentPurpose, { isGranted: boolean; occurredAt: string }>()
    return new Map(
      data.map((c) => [c.purpose, { isGranted: c.isGranted, occurredAt: c.occurredAt }]),
    )
  }, [data])

  const handleToggle = useCallback(
    (purpose: ConsentPurpose, granted: boolean) => {
      if (granted) {
        updateConsent.mutate({ purpose, isGranted: true })
      } else {
        setRevokePurpose(purpose)
      }
    },
    [updateConsent],
  )

  const handleConfirmRevoke = useCallback(() => {
    if (revokePurpose) {
      updateConsent.mutate({ purpose: revokePurpose, isGranted: false })
      setRevokePurpose(null)
    }
  }, [revokePurpose, updateConsent])

  const handleCloseDialog = useCallback(() => {
    setRevokePurpose(null)
  }, [])

  const revokeLabel = revokePurpose
    ? CONSENT_ITEMS.find((c) => c.purpose === revokePurpose)?.label ?? ''
    : ''

  return (
    <SettingsSection title="Data Consents">
      {isLoading ? (
        <Box data-testid="consents-loading">
          {[0, 1, 2, 3].map((i) => (
            <Flex
              key={i}
              align="center"
              justify="space-between"
              py="4"
              borderTopWidth={i > 0 ? '1px' : '0'}
              borderColor="border.subtle"
            >
              <Box flex="1" mr="4">
                <Skeleton height="18px" width="200px" borderRadius="md" />
                <Skeleton height="14px" width="300px" mt="2" borderRadius="md" />
                <Skeleton height="14px" width="150px" mt="2" borderRadius="md" />
              </Box>
              <Skeleton height="24px" width="44px" borderRadius="full" />
            </Flex>
          ))}
        </Box>
      ) : (
        CONSENT_ITEMS.map((meta, i) => {
          const consent = consentMap.get(meta.purpose)
          return (
            <ConsentToggleRow
              key={meta.purpose}
              meta={meta}
              granted={consent?.isGranted ?? false}
              updatedAt={consent?.occurredAt ?? null}
              showBorder={i > 0}
              onToggle={(granted) => handleToggle(meta.purpose, granted)}
            />
          )
        })
      )}

      <ConfirmDialog
        open={revokePurpose !== null}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmRevoke}
        title="Revoke Consent"
        message={`Are you sure you want to revoke "${revokeLabel}"? This may affect the services available to you.`}
        confirmLabel="Revoke"
        cancelLabel="Cancel"
        destructive
      />
    </SettingsSection>
  )
}
