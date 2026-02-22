'use client'

import { Suspense, useState } from 'react'
import { Box, Button, Text, VStack } from '@chakra-ui/react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { ShieldTreeLogo } from '@/components/auth/shield-tree-logo'
import { ShieldTreeLoader } from '@/components/ui/shield-tree-loader'

const ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: 'Could not start the sign-in process. Please try again.',
  OAuthCallback: 'Authentication failed. Please try again.',
  OAuthAccountNotLinked: 'This email is already linked to another sign-in method.',
  Callback: 'Something went wrong during sign-in. Please try again.',
  Default: 'Something went wrong. Please try again.',
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.77.4 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function LoginCard() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/reports'
  const error = searchParams.get('error')
  const [isLoading, setIsLoading] = useState(false)

  const errorMessage = error
    ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default
    : null

  const handleSignIn = () => {
    setIsLoading(true)
    signIn('cognito-pkce', { callbackUrl })
  }

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
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <ShieldTreeLoader variant="inline" size="md" showBrandText />
        </Box>
      ) : (
        <VStack gap={6}>
          {/* Logo & brand */}
          <ShieldTreeLogo size={80} />

          {/* Welcome text */}
          <Box textAlign="center">
            <Text fontSize="lg" fontWeight="medium" color="text.primary">
              Welcome back
            </Text>
            <Text fontSize="sm" color="text.muted" mt={1}>
              Sign in to access your health records
            </Text>
          </Box>

          {/* Error message */}
          {errorMessage && (
            <Box
              w="full"
              px={4}
              py={3}
              borderRadius="md"
              bg="coral.50"
              _dark={{ bg: 'rgba(255,107,107,0.1)' }}
              border="1px solid"
              borderColor="status.error"
            >
              <Text fontSize="sm" color="status.error" textAlign="center">
                {errorMessage}
              </Text>
            </Box>
          )}

          {/* Auth buttons */}
          <VStack gap={3} w="full">
            <Button
              w="full"
              h="48px"
              borderRadius="full"
              bg="action.primary"
              color="action.primary.text"
              _hover={{ bg: 'action.primary.hover', transform: 'translateY(-1px)' }}
              transition="all 0.2s ease"
              onClick={handleSignIn}
              fontSize="sm"
              fontWeight="medium"
            >
              <Box as="span" mr={2} display="inline-flex"><PhoneIcon /></Box>
              Continue with Phone
            </Button>

            <Button
              w="full"
              h="48px"
              borderRadius="full"
              bg="transparent"
              border="1px solid"
              borderColor="border.default"
              color="text.primary"
              _hover={{ bg: 'bg.overlay', transform: 'translateY(-1px)' }}
              transition="all 0.2s ease"
              onClick={handleSignIn}
              fontSize="sm"
              fontWeight="medium"
            >
              <Box as="span" mr={2} display="inline-flex"><GoogleIcon /></Box>
              Continue with Google
            </Button>

            <Button
              w="full"
              h="48px"
              borderRadius="full"
              bg="transparent"
              border="1px solid"
              borderColor="border.default"
              color="text.primary"
              _hover={{ bg: 'bg.overlay', transform: 'translateY(-1px)' }}
              transition="all 0.2s ease"
              onClick={handleSignIn}
              fontSize="sm"
              fontWeight="medium"
            >
              <Box as="span" mr={2} display="inline-flex"><EmailIcon /></Box>
              Continue with Email
            </Button>
          </VStack>

          {/* Footer */}
          <Text fontSize="xs" color="text.muted" textAlign="center" lineHeight="tall">
            By continuing, you agree to our{' '}
            <Text as="span" color="text.secondary" cursor="pointer" textDecoration="underline" textDecorationColor="border.subtle">
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text as="span" color="text.secondary" cursor="pointer" textDecoration="underline" textDecorationColor="border.subtle">
              Privacy Policy
            </Text>
          </Text>
        </VStack>
      )}
    </Box>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" py={6}>
        <ShieldTreeLoader variant="inline" size="md" showBrandText />
      </Box>
    }>
      <LoginCard />
    </Suspense>
  )
}
