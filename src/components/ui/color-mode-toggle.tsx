'use client'

import { Box, IconButton } from '@chakra-ui/react'
import { useTheme } from 'next-themes'

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

export function ColorModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  // Render both icons and let CSS pick one — branching the markup on resolvedTheme
  // breaks hydration for dark-mode users (server renders light, client resolves dark)
  return (
    <IconButton
      aria-label="Toggle color mode"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      variant="ghost"
      borderRadius="full"
      size="sm"
      color="text.secondary"
      _hover={{ bg: 'bg.overlay' }}
    >
      <Box display={{ base: 'inline-flex', _dark: 'none' }} aria-hidden="true">
        <MoonIcon />
      </Box>
      <Box display={{ base: 'none', _dark: 'inline-flex' }} aria-hidden="true">
        <SunIcon />
      </Box>
    </IconButton>
  )
}
