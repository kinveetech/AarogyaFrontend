'use client'

import { useState, useMemo, useCallback } from 'react'
import { Box } from '@chakra-ui/react'
import { useAuth } from '@/hooks/use-auth'
import { useAccessGrants, useReceivedGrants, useRevokeGrant, useCreateGrant } from '@/hooks/access'
import { AccessPageHeader, GrantModal } from '@/components/access'
import { GrantListView } from '@/components/access/grant-list-view'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { AccessGrant } from '@/types/access'
import type { GrantModalSubmitData } from '@/components/access/grant-modal'

const shieldIcon = (
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
    <path d="M17 24 L22 29 L31 19" strokeLinecap="round" />
  </svg>
)

function PatientAccessView() {
  const { data, isLoading } = useAccessGrants()
  const revokeGrant = useRevokeGrant()
  const createGrant = useCreateGrant()

  const [modalOpen, setModalOpen] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<AccessGrant | null>(null)

  const grants = useMemo(() => data?.items ?? [], [data])

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

  return (
    <>
      <AccessPageHeader onGrantClick={() => setModalOpen(true)} role="patient" />

      <GrantListView
        grants={grants}
        isLoading={isLoading}
        variant="granted"
        emptyIcon={shieldIcon}
        emptyTitle="No active grants"
        emptyDescription="Grant a doctor access to your reports"
        emptyAction={{ label: 'Grant Access', onClick: () => setModalOpen(true) }}
        onRevoke={handleRevokeClick}
        loadingTestId="access-loading"
      />

      <GrantModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleGrantSubmit}
        loading={createGrant.isPending}
      />

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
    </>
  )
}

function DoctorAccessView() {
  const { data, isLoading } = useReceivedGrants()
  const grants = useMemo(() => data ?? [], [data])

  return (
    <>
      <AccessPageHeader role="doctor" />

      <GrantListView
        grants={grants}
        isLoading={isLoading}
        variant="received"
        emptyIcon={shieldIcon}
        emptyTitle="No received grants"
        emptyDescription="Patients who grant you access to their reports will appear here"
        loadingTestId="received-grants-loading"
      />
    </>
  )
}

export default function AccessPage() {
  const { user } = useAuth()
  const isDoctor = user?.role === 'doctor'

  return (
    <Box maxW="1200px" mx="auto" px={{ base: '4', md: '6' }} py="6">
      {isDoctor ? <DoctorAccessView /> : <PatientAccessView />}
    </Box>
  )
}
