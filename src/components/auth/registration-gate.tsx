'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Flex } from '@chakra-ui/react'
import { ShieldTreeLoader } from '@/components/ui/shield-tree-loader'
import { useRegistrationStatus } from '@/hooks/registration'

interface RegistrationGateProps {
  children: React.ReactNode
}

export function RegistrationGate({ children }: RegistrationGateProps) {
  const router = useRouter()
  const { data, isLoading, isError } = useRegistrationStatus()

  useEffect(() => {
    if (isLoading || isError || !data) return

    switch (data.status) {
      case 'registration_required':
        router.replace('/register')
        break
      case 'registration_pending_approval':
        router.replace('/register/pending')
        break
      case 'registration_rejected':
        router.replace('/register/rejected')
        break
    }
  }, [data, isLoading, isError, router])

  if (isLoading) {
    return (
      <Flex align="center" justify="center" minH="60vh">
        <Box>
          <ShieldTreeLoader variant="inline" size="md" />
        </Box>
      </Flex>
    )
  }

  if (data?.status === 'approved') {
    return <>{children}</>
  }

  // While redirecting, show nothing to avoid flash
  return null
}
