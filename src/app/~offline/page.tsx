'use client'

import { Box, Button, Text } from '@chakra-ui/react'
import { ShieldTreeLoader } from '@/components/ui/shield-tree-loader'

export default function OfflinePage() {
  return (
    <Box
      minH="100dvh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={6}
      p={6}
    >
      <ShieldTreeLoader size="lg" showBrandText={false} />
      <Box textAlign="center">
        <Text
          fontFamily="heading"
          fontSize="2xl"
          color="text.primary"
          mb={2}
        >
          You&apos;re offline
        </Text>
        <Text
          fontSize="sm"
          color="text.muted"
          fontWeight="light"
          maxW="280px"
          mx="auto"
          mb={6}
        >
          It looks like you&apos;ve lost your internet connection. Please check
          your connection and try again.
        </Text>
        <Button
          borderRadius="full"
          bg="action.primary"
          color="action.primary.text"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </Box>
    </Box>
  )
}
