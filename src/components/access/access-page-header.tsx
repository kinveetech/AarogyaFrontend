'use client'

import { Button, Flex, Heading } from '@chakra-ui/react'

export interface AccessPageHeaderProps {
  onGrantClick: () => void
}

export function AccessPageHeader({ onGrantClick }: AccessPageHeaderProps) {
  return (
    <Flex
      align="center"
      justify="space-between"
      mb="7"
      flexWrap="wrap"
      gap="3"
    >
      <Heading
        as="h1"
        fontFamily="heading"
        fontSize={{ base: '1.4rem', md: '1.75rem' }}
        color="text.primary"
        letterSpacing="-0.01em"
      >
        Doctor Access
      </Heading>
      <Button
        borderRadius="full"
        bg="action.primary"
        color="action.primary.text"
        _hover={{
          bg: 'action.primary.hover',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(14, 107, 102, 0.25)',
        }}
        onClick={onGrantClick}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Grant Access
      </Button>
    </Flex>
  )
}
