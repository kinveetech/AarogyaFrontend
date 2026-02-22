'use client'

import { Suspense } from 'react'
import { Box, Button, Text, VStack } from '@chakra-ui/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ShieldTreeLogo } from '@/components/auth/shield-tree-logo'
import { ShieldTreeLoader } from '@/components/ui/shield-tree-loader'

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access was denied. You may not have permission to sign in.',
  Verification: 'The verification link has expired or has already been used.',
  OAuthSignin: 'Could not start the sign-in process.',
  OAuthCallback: 'Authentication failed during the callback.',
  OAuthAccountNotLinked: 'This email is already linked to another sign-in method.',
  Default: 'An unexpected error occurred during authentication.',
}

function CallbackContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  if (!error) {
    return <ShieldTreeLoader variant="fullPage" />
  }

  const errorMessage = ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default

  return (
    <Box
      bg="bg.glass"
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="border.subtle"
      boxShadow="glass"
      borderRadius="lg"
      maxW="420px"
      w="full"
      p={8}
    >
      <VStack gap={6}>
        <ShieldTreeLogo size={60} />

        <Box textAlign="center">
          <Text fontSize="lg" fontWeight="medium" color="status.error">
            Sign-in failed
          </Text>
          <Text fontSize="sm" color="text.muted" mt={2}>
            {errorMessage}
          </Text>
        </Box>

        <Button
          asChild
          w="full"
          h="48px"
          borderRadius="full"
          bg="action.primary"
          color="action.primary.text"
          _hover={{ bg: 'action.primary.hover', transform: 'translateY(-1px)' }}
          transition="all 0.2s ease"
          fontSize="sm"
          fontWeight="medium"
        >
          <Link href="/login">Try again</Link>
        </Button>
      </VStack>
    </Box>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<ShieldTreeLoader variant="fullPage" />}>
      <CallbackContent />
    </Suspense>
  )
}
