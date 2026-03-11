'use client'

import { useState } from 'react'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useExportData } from '@/hooks/profile'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SettingsSection } from './settings-section'

export function DataExportSection() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const exportData = useExportData()

  const isRequested = exportData.isSuccess
  const isError = exportData.isError

  function handleConfirm() {
    setConfirmOpen(false)
    exportData.mutate()
  }

  return (
    <>
      <SettingsSection title="Export My Data" testId="data-export-section">
        <VStack align="flex-start" gap="3">
          <Text color="text.secondary" fontSize="sm">
            Request a copy of all your health records and personal data. The
            export will be prepared and you will be notified when it is ready
            for download.
          </Text>

          {isRequested && (
            <HStack
              bg="sage.50"
              _dark={{ bg: 'sage.900' }}
              borderRadius="lg"
              px="4"
              py="3"
              w="full"
              data-testid="export-success-message"
            >
              <Text color="text.primary" fontSize="sm" fontWeight="medium">
                Your data export has been requested. You will receive a
                notification when it is ready.
              </Text>
            </HStack>
          )}

          {isError && (
            <HStack
              bg="coral.50"
              _dark={{ bg: 'coral.900' }}
              borderRadius="lg"
              px="4"
              py="3"
              w="full"
              data-testid="export-error-message"
            >
              <Text color="coral.600" _dark={{ color: 'coral.300' }} fontSize="sm" fontWeight="medium">
                Failed to request data export. Please try again later.
              </Text>
            </HStack>
          )}

          <Button
            variant="outline"
            borderRadius="full"
            borderColor="action.primary"
            borderWidth="1.5px"
            color="action.primary"
            fontWeight="semibold"
            _hover={{
              bg: 'action.primary',
              color: 'action.primary.text',
            }}
            onClick={() => setConfirmOpen(true)}
            loading={exportData.isPending}
            disabled={exportData.isPending || isRequested}
            data-testid="export-data-button"
          >
            {isRequested ? 'Export Requested' : 'Request Data Export'}
          </Button>
        </VStack>
      </SettingsSection>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Export My Data"
        message="This will request an export of all your health records and personal data. You will be notified when the export is ready for download. Do you want to proceed?"
        confirmLabel="Request Export"
        cancelLabel="Cancel"
      />
    </>
  )
}
