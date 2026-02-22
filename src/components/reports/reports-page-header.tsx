'use client'

import { Box, Button, Heading, Input } from '@chakra-ui/react'

export interface ReportsPageHeaderProps {
  search: string
  onSearchChange: (value: string) => void
  onUploadClick: () => void
}

export function ReportsPageHeader({
  search,
  onSearchChange,
  onUploadClick,
}: ReportsPageHeaderProps) {
  return (
    <Box
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'stretch', md: 'center' }}
      justifyContent="space-between"
      gap="4"
      mb="6"
    >
      <Heading
        as="h1"
        fontFamily="heading"
        fontSize={{ base: '2xl', md: '3xl' }}
        color="text.primary"
      >
        My Reports
      </Heading>

      <Box
        display="flex"
        flexDirection={{ base: 'column', sm: 'row' }}
        alignItems={{ base: 'stretch', sm: 'center' }}
        gap="3"
      >
        <Input
          placeholder="Search reports..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          bg="bg.glass"
          backdropFilter="blur(12px)"
          borderColor="border.default"
          borderRadius="full"
          size="sm"
          maxW={{ base: 'full', md: '260px' }}
          aria-label="Search reports"
        />
        <Button
          borderRadius="full"
          bg="action.primary"
          color="action.primary.text"
          size="sm"
          onClick={onUploadClick}
          flexShrink={0}
        >
          Upload Report
        </Button>
      </Box>
    </Box>
  )
}
