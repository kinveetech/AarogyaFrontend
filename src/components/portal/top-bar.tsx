'use client'

import { Box, Flex, IconButton } from '@chakra-ui/react'
import { ColorModeToggle } from '@/components/ui/color-mode-toggle'
import { BellIcon, MenuIcon, UserIcon } from './nav-items'

interface TopBarProps {
  onMenuToggle: () => void
}

function ShieldTreeLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 100 100" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M50 5 L85 20 C85 55 72 80 50 95 C28 80 15 55 15 20 Z"
        fill="currentColor" opacity="0.1" stroke="currentColor"
        strokeWidth="2" />
      <line x1="50" y1="45" x2="50" y2="75" stroke="currentColor" strokeWidth="3" />
      <path d="M50 45 C50 35 35 25 30 30 C35 28 45 35 50 45" fill="currentColor" opacity="0.6" />
      <path d="M50 45 C50 35 65 25 70 30 C65 28 55 35 50 45" fill="currentColor" opacity="0.6" />
      <circle cx="50" cy="30" r="14" fill="currentColor" opacity="0.15" />
      <circle cx="50" cy="28" r="9" fill="currentColor" opacity="0.2" />
      <path d="M50 75 C45 78 42 80 40 82" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <path d="M50 75 C55 78 58 80 60 82" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
    </svg>
  )
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <Flex
      as="header"
      position="sticky"
      top="0"
      zIndex="100"
      height="56px"
      alignItems="center"
      px={{ base: 3, md: 5 }}
      bg="bg.glass"
      backdropFilter="blur(24px)"
      borderBottom="1px solid"
      borderColor="border.subtle"
    >
      <IconButton
        aria-label="Toggle menu"
        onClick={onMenuToggle}
        variant="ghost"
        borderRadius="full"
        size="sm"
        color="text.secondary"
        _hover={{ bg: 'bg.overlay' }}
        display={{ base: 'flex', md: 'none' }}
      >
        <MenuIcon />
      </IconButton>

      <Flex alignItems="center" gap="2" ml={{ base: 2, md: 0 }}>
        <Box color="action.primary">
          <ShieldTreeLogo />
        </Box>
        <Box
          as="span"
          fontFamily="heading"
          fontSize="1.2rem"
          color="text.primary"
          fontWeight="bold"
        >
          Aarogya
        </Box>
      </Flex>

      <Flex ml="auto" alignItems="center" gap="1">
        <IconButton
          aria-label="Notifications"
          variant="ghost"
          borderRadius="full"
          size="sm"
          color="text.secondary"
          _hover={{ bg: 'bg.overlay' }}
        >
          <BellIcon />
        </IconButton>

        <Box
          borderRadius="full"
          width="32px"
          height="32px"
          bg="bg.overlay"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="text.muted"
        >
          <UserIcon />
        </Box>

        <ColorModeToggle />
      </Flex>
    </Flex>
  )
}
