'use client'

import { useState } from 'react'
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react'
import { signOut } from 'next-auth/react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export function AccountSection() {
  const [signOutOpen, setSignOutOpen] = useState(false)

  return (
    <Box>
      <Heading
        as="h2"
        fontFamily="heading"
        fontSize="1.5rem"
        color="text.primary"
        mb="4"
        letterSpacing="-0.01em"
      >
        Account
      </Heading>
      <Box
        bg="bg.glass"
        backdropFilter="blur(20px)"
        borderWidth="1px"
        borderColor="border.subtle"
        borderRadius="2xl"
        boxShadow="glass"
        p="6"
      >
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
          <Button
            variant="plain"
            color="coral.400"
            fontSize="0.875rem"
            textDecoration="underline"
            px="0"
            _hover={{ opacity: 0.8 }}
          >
            Delete Account
          </Button>
          <Text fontFamily="mono" fontSize="0.75rem" color="text.muted">
            Aarogya v0.1.0
          </Text>
        </VStack>
      </Box>

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
    </Box>
  )
}
