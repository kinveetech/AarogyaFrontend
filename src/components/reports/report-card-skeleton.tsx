'use client'

import { Box, Skeleton, HStack } from '@chakra-ui/react'

export function ReportCardSkeleton() {
  return (
    <Box
      bg="bg.glass"
      backdropFilter="blur(12px)"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="lg"
      p="5"
      data-testid="report-card-skeleton"
    >
      <HStack justifyContent="space-between" mb="3">
        <Skeleton height="14px" width="80px" borderRadius="full" />
        <Skeleton height="20px" width="70px" borderRadius="full" />
      </HStack>
      <Skeleton height="18px" width="75%" mb="2" />
      <Skeleton height="14px" width="50%" mb="3" />
      <Skeleton height="14px" width="60%" mb="2" />
      <Skeleton height="14px" width="40%" mb="4" />
      <HStack justifyContent="flex-end" gap="2">
        <Skeleton height="32px" width="32px" borderRadius="full" />
        <Skeleton height="32px" width="32px" borderRadius="full" />
      </HStack>
    </Box>
  )
}
