'use client'

import { Box, Button, Flex, Text } from '@chakra-ui/react'
import { signOut } from 'next-auth/react'
import { ShieldTreeLogo } from '@/components/auth/shield-tree-logo'
import { useRegistrationStatus } from '@/hooks/registration'

function XCircleIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}

export default function RegistrationRejectedPage() {
  const { data } = useRegistrationStatus()

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
          bg="coral.50"
          _dark={{ bg: 'rgba(255,107,107,0.1)' }}
          color="status.error"
        >
          <XCircleIcon />
        </Flex>

        <Box>
          <Text fontSize="xl" fontWeight="semibold" color="text.primary">
            Registration Rejected
          </Text>
          <Text fontSize="sm" color="text.muted" mt="2" lineHeight="tall" maxW="360px" mx="auto">
            Unfortunately, your registration could not be approved. Please review the
            reason below and contact support if you believe this is an error.
          </Text>
        </Box>

        {data?.rejectionReason && (
          <Box
            w="full"
            px="4"
            py="3"
            borderRadius="xl"
            bg="coral.50"
            _dark={{ bg: 'rgba(255,107,107,0.08)' }}
            border="1px solid"
            borderColor="status.error"
          >
            <Text fontSize="sm" color="text.primary" fontWeight="medium" mb="1">
              Reason
            </Text>
            <Text fontSize="sm" color="text.secondary" lineHeight="tall">
              {data.rejectionReason}
            </Text>
          </Box>
        )}

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
