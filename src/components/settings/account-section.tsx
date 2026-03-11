'use client'

import { useState } from 'react'
import { Button, Text, VStack } from '@chakra-ui/react'
import { signOut } from 'next-auth/react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SettingsSection } from './settings-section'

export function AccountSection() {
  const [signOutOpen, setSignOutOpen] = useState(false)

  return (
    <>
      <SettingsSection title="Account">
        <VStack align="flex-start" gap="4">
          <Button
            variant="outline"
            borderRadius="full"
            borderColor="coral.400"
            borderWidth="1.5px"
            color="coral.400"
            fontWeight="semibold"
            _hover={{
              bg: 'coral.400',
              color: 'white',
            }}
            onClick={() => setSignOutOpen(true)}
            data-testid="sign-out-button"
          >
            Sign Out
          </Button>
          <Text fontFamily="mono" fontSize="0.75rem" color="text.muted">
            Aarogya v0.1.0
          </Text>
        </VStack>
      </SettingsSection>

      <ConfirmDialog
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        onConfirm={() => signOut({ callbackUrl: '/login' })}
        title="Sign Out"
        message="Are you sure you want to sign out? You will need to log in again to access your health records."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        destructive
      />
    </>
  )
}
