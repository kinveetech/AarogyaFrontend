'use client'

import { Box, Button, Flex, Text } from '@chakra-ui/react'
import { signOut } from 'next-auth/react'
import { ShieldTreeLogo } from '@/components/auth/shield-tree-logo'

function ClockIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default function RegistrationPendingPage() {
  return (
    <Box
      bg="bg.glass"
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="border.subtle"
      boxShadow="glass"
      borderRadius="lg"
      maxW="480px"
      w="full"
      p={8}
      textAlign="center"
    >
      <Flex direction="column" align="center" gap="5">
        <ShieldTreeLogo size={56} />

        <Flex
          align="center"
          justify="center"
          boxSize="80px"
          borderRadius="full"
          bg="rgba(255, 179, 71, 0.15)"
          color="status.warning"
        >
          <ClockIcon />
        </Flex>

        <Box>
          <Text fontSize="xl" fontWeight="semibold" color="text.primary">
            Registration Pending
          </Text>
          <Text fontSize="sm" color="text.muted" mt="2" lineHeight="tall" maxW="360px" mx="auto">
            Your registration has been submitted and is awaiting admin approval. You will
            be notified once your account is approved.
          </Text>
        </Box>

        <Flex
          w="full"
          px="4"
          py="3"
          borderRadius="xl"
          bg="rgba(255, 179, 71, 0.08)"
          border="1px solid"
          borderColor="rgba(255, 179, 71, 0.2)"
          justify="center"
        >
          <Text fontSize="xs" color="text.secondary" lineHeight="tall">
            Doctor and Lab Technician accounts require verification before access is
            granted. This typically takes 1-2 business days.
          </Text>
        </Flex>

        <Button
          variant="outline"
          borderRadius="full"
          borderColor="border.default"
          color="text.primary"
          _hover={{ bg: 'bg.overlay' }}
          onClick={() => signOut({ callbackUrl: '/login' })}
          mt="2"
        >
          Sign Out
        </Button>
      </Flex>
    </Box>
  )
}
