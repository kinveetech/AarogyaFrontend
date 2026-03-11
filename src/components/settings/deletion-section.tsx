'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  DialogPositioner,
  HStack,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react'
import { signOut } from 'next-auth/react'
import { useRequestDeletion } from '@/hooks/profile'
import { useProfile } from '@/hooks/profile'
import { ApiError } from '@/lib/api/client'
import { SettingsSection } from './settings-section'

export function DeletionSection() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const deletion = useRequestDeletion()
  const { data: profile } = useProfile()

  const userEmail = profile?.email ?? ''
  const isConfirmValid = confirmEmail === userEmail && userEmail.length > 0
  const isConflict =
    deletion.isError &&
    deletion.error instanceof ApiError &&
    deletion.error.status === 409

  function handleOpen() {
    setConfirmEmail('')
    deletion.reset()
    setDialogOpen(true)
  }

  function handleClose() {
    setDialogOpen(false)
    setConfirmEmail('')
  }

  function handleConfirm() {
    if (!isConfirmValid) return
    deletion.mutate(undefined, {
      onSuccess: () => {
        setDialogOpen(false)
        signOut({ callbackUrl: '/login' })
      },
    })
  }

  return (
    <>
      <SettingsSection title="Delete Account" testId="deletion-section">
        <VStack align="flex-start" gap="3">
          <Text color="text.secondary" fontSize="sm">
            Permanently delete your Aarogya account and all associated health
            records. This action cannot be undone.
          </Text>

          {isConflict && (
            <HStack
              bg="coral.50"
              _dark={{ bg: 'coral.900' }}
              borderRadius="lg"
              px="4"
              py="3"
              w="full"
              data-testid="deletion-conflict-message"
            >
              <Text
                color="coral.600"
                _dark={{ color: 'coral.300' }}
                fontSize="sm"
                fontWeight="medium"
              >
                A deletion request is already pending. Please contact support if
                you need assistance.
              </Text>
            </HStack>
          )}

          {deletion.isError && !isConflict && (
            <HStack
              bg="coral.50"
              _dark={{ bg: 'coral.900' }}
              borderRadius="lg"
              px="4"
              py="3"
              w="full"
              data-testid="deletion-error-message"
            >
              <Text
                color="coral.600"
                _dark={{ color: 'coral.300' }}
                fontSize="sm"
                fontWeight="medium"
              >
                Failed to request account deletion. Please try again later.
              </Text>
            </HStack>
          )}

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
            onClick={handleOpen}
            data-testid="delete-account-button"
          >
            Delete My Account
          </Button>
        </VStack>
      </SettingsSection>

      <DialogRoot
        open={dialogOpen}
        onOpenChange={(details) => !details.open && handleClose()}
        role="alertdialog"
      >
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent
            bg="bg.glass"
            backdropFilter="blur(20px)"
            borderColor="border.subtle"
            borderWidth="1px"
            boxShadow="glass"
            borderRadius="xl"
            aria-describedby="deletion-dialog-body"
          >
            <DialogHeader>
              <DialogTitle fontFamily="heading" color="coral.400">
                Delete Account
              </DialogTitle>
            </DialogHeader>
            <DialogBody id="deletion-dialog-body">
              <VStack align="stretch" gap="4">
                <Box
                  bg="coral.50"
                  _dark={{ bg: 'coral.900' }}
                  borderRadius="lg"
                  px="4"
                  py="3"
                >
                  <Text
                    color="coral.600"
                    _dark={{ color: 'coral.300' }}
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    This action is permanent and irreversible. All your health
                    records, access grants, and personal data will be
                    permanently deleted.
                  </Text>
                </Box>
                <VStack align="stretch" gap="2">
                  <Text color="text.secondary" fontSize="sm">
                    To confirm, type your email address{' '}
                    <Text as="span" fontFamily="mono" fontWeight="bold" color="text.primary">
                      {userEmail}
                    </Text>
                  </Text>
                  <Input
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="Enter your email"
                    fontFamily="mono"
                    fontSize="sm"
                    borderColor="border.subtle"
                    data-testid="deletion-confirm-input"
                  />
                </VStack>
              </VStack>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="ghost" borderRadius="full">
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button
                borderRadius="full"
                bg="coral.400"
                color="action.primary.text"
                css={{ _dark: { bg: 'coral.500' } }}
                onClick={handleConfirm}
                loading={deletion.isPending}
                disabled={!isConfirmValid || deletion.isPending}
                data-testid="deletion-confirm-button"
              >
                Permanently Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </>
  )
}
