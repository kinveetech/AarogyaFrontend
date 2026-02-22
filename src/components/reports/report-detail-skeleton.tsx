'use client'

import { Box, Flex, Grid, HStack, Skeleton } from '@chakra-ui/react'

export function ReportDetailSkeleton() {
  return (
    <Box data-testid="report-detail-loading">
      {/* Header skeleton */}
      <Box mb="6">
        <Flex
          alignItems={{ base: 'flex-start', md: 'center' }}
          flexDirection={{ base: 'column', md: 'row' }}
          gap={{ base: '3', md: '4' }}
        >
          <HStack gap="3">
            <Skeleton boxSize="32px" borderRadius="md" />
            <Skeleton height="28px" width="260px" borderRadius="md" />
          </HStack>
          <HStack gap="3" ml={{ base: '0', md: 'auto' }}>
            <Skeleton height="22px" width="70px" borderRadius="full" />
            <Skeleton height="18px" width="100px" borderRadius="md" />
          </HStack>
        </Flex>
        <HStack gap="4" mt="3">
          <Skeleton height="16px" width="80px" borderRadius="md" />
          <Skeleton height="16px" width="120px" borderRadius="md" />
        </HStack>
      </Box>

      {/* Content skeleton */}
      <Grid gridTemplateColumns={{ base: '1fr', lg: '300px 1fr' }} gap="6">
        {/* PDF preview placeholder */}
        <Skeleton
          borderRadius="xl"
          height={{ base: '200px', lg: '400px' }}
          display={{ base: 'none', lg: 'block' }}
        />

        {/* Parameter table skeleton */}
        <Box
          bg="bg.card"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="xl"
          boxShadow="glass"
          p={{ base: '4', md: '6' }}
        >
          <Skeleton height="22px" width="120px" borderRadius="md" mb="4" />
          {Array.from({ length: 5 }, (_, i) => (
            <HStack key={i} gap="4" mb="3">
              <Skeleton height="16px" flex="2" borderRadius="md" />
              <Skeleton height="16px" flex="1" borderRadius="md" />
              <Skeleton height="16px" flex="1" borderRadius="md" />
              <Skeleton height="16px" flex="1" borderRadius="md" />
              <Skeleton height="16px" flex="1" borderRadius="md" />
            </HStack>
          ))}
        </Box>
      </Grid>

      {/* Action buttons skeleton */}
      <Flex gap="3" mt="6">
        <Skeleton height="40px" width="160px" borderRadius="full" />
        <Skeleton height="40px" width="140px" borderRadius="full" />
        <Skeleton height="40px" width="100px" borderRadius="full" />
      </Flex>
    </Box>
  )
}
