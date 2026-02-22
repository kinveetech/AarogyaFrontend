'use client'

import { Box, Flex, Text } from '@chakra-ui/react'

interface DisabledToggleRowProps {
  label: string
  description?: string
  showBorder: boolean
}

export function DisabledToggleRow({ label, description, showBorder }: DisabledToggleRowProps) {
  return (
    <Flex
      align="center"
      justify="space-between"
      py="4"
      borderTopWidth={showBorder ? '1px' : '0'}
      borderColor="border.subtle"
    >
      <Box flex="1" mr="4">
        <Text fontWeight="medium" fontSize="0.95rem" color="text.primary">
          {label}
        </Text>
        {description && (
          <Text fontSize="0.875rem" color="text.muted">
            {description}
          </Text>
        )}
      </Box>
      <Box
        as="span"
        w="44px"
        h="24px"
        borderRadius="full"
        bg="border.default"
        position="relative"
        flexShrink={0}
        opacity={0.5}
        cursor="not-allowed"
      >
        <Box
          as="span"
          position="absolute"
          top="3px"
          left="3px"
          w="18px"
          h="18px"
          borderRadius="full"
          bg="white"
          boxShadow="0 1px 4px rgba(0,0,0,0.15)"
        />
      </Box>
    </Flex>
  )
}
