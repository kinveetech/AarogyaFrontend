'use client'

import type { ReactNode } from 'react'
import { Box, Heading } from '@chakra-ui/react'

interface SettingsSectionProps {
  title: string
  children: ReactNode
  testId?: string
  asForm?: boolean
  onSubmit?: React.FormEventHandler<HTMLDivElement>
}

export function SettingsSection({
  title,
  children,
  testId,
  asForm,
  onSubmit,
}: SettingsSectionProps) {
  return (
    <Box data-testid={testId}>
      <Heading
        as="h2"
        fontFamily="heading"
        fontSize="1.5rem"
        color="text.primary"
        mb="4"
        letterSpacing="-0.01em"
      >
        {title}
      </Heading>
      <Box
        as={asForm ? 'form' : undefined}
        onSubmit={asForm ? onSubmit : undefined}
        bg="bg.glass"
        backdropFilter="blur(20px)"
        borderWidth="1px"
        borderColor="border.subtle"
        borderRadius="2xl"
        boxShadow="glass"
        p="6"
      >
        {children}
      </Box>
    </Box>
  )
}
