'use client'

import { Box, Skeleton, HStack, VStack } from '@chakra-ui/react'

export type ChartSkeletonVariant = 'line' | 'bar' | 'timeline'

export interface ChartSkeletonProps {
  variant: ChartSkeletonVariant
}

function LineSkeleton() {
  return (
    <Box data-testid="chart-skeleton-line">
      <Skeleton height="14px" width="40%" mb="4" />
      <HStack align="flex-end" gap="0" height="180px">
        <VStack gap="4" height="100%" justify="space-between" mr="2">
          <Skeleton height="10px" width="30px" />
          <Skeleton height="10px" width="30px" />
          <Skeleton height="10px" width="30px" />
          <Skeleton height="10px" width="30px" />
        </VStack>
        <Box flex="1" position="relative" height="100%">
          <Skeleton height="100%" width="100%" borderRadius="md" />
        </Box>
      </HStack>
      <HStack justify="space-between" mt="2" ml="10">
        <Skeleton height="10px" width="40px" />
        <Skeleton height="10px" width="40px" />
        <Skeleton height="10px" width="40px" />
        <Skeleton height="10px" width="40px" />
      </HStack>
    </Box>
  )
}

function BarSkeleton() {
  return (
    <Box data-testid="chart-skeleton-bar">
      <Skeleton height="14px" width="50%" mb="4" />
      <HStack align="flex-end" gap="3" height="180px" px="4">
        <Skeleton flex="1" height="60%" borderRadius="sm" />
        <Skeleton flex="1" height="80%" borderRadius="sm" />
        <Skeleton flex="1" height="45%" borderRadius="sm" />
        <Skeleton flex="1" height="90%" borderRadius="sm" />
        <Skeleton flex="1" height="70%" borderRadius="sm" />
        <Skeleton flex="1" height="55%" borderRadius="sm" />
      </HStack>
      <HStack justify="space-between" mt="2" px="4">
        <Skeleton height="10px" width="40px" />
        <Skeleton height="10px" width="40px" />
        <Skeleton height="10px" width="40px" />
      </HStack>
    </Box>
  )
}

function TimelineSkeleton() {
  return (
    <Box data-testid="chart-skeleton-timeline">
      <Skeleton height="14px" width="35%" mb="5" />
      <VStack align="stretch" gap="4">
        {[1, 2, 3].map((i) => (
          <HStack key={i} gap="3">
            <Skeleton height="10px" width="10px" borderRadius="full" flexShrink={0} />
            <Box flex="1">
              <Skeleton height="14px" width="70%" mb="2" />
              <Skeleton height="10px" width="45%" />
            </Box>
          </HStack>
        ))}
      </VStack>
    </Box>
  )
}

export function ChartSkeleton({ variant }: ChartSkeletonProps) {
  return (
    <Box
      bg="bg.glass"
      backdropFilter="blur(12px)"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="lg"
      p="5"
      data-testid="chart-skeleton"
    >
      {variant === 'line' && <LineSkeleton />}
      {variant === 'bar' && <BarSkeleton />}
      {variant === 'timeline' && <TimelineSkeleton />}
    </Box>
  )
}
