'use client'

import { Box, Flex } from '@chakra-ui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems } from './nav-items'

export function BottomNav() {
  const pathname = usePathname()

  return (
    <Flex
      as="nav"
      aria-label="Mobile navigation"
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex="100"
      display={{ base: 'flex', md: 'none' }}
      mx="2"
      mb="2"
      px="2"
      py="1.5"
      bg="bg.glass"
      backdropFilter="blur(24px)"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="xl"
      justifyContent="space-around"
      alignItems="center"
    >
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const Icon = item.icon

        return (
          <Flex
            key={item.href}
            asChild
            direction="column"
            alignItems="center"
            gap="0.5"
            px="3"
            py="1.5"
            borderRadius="lg"
            textDecoration="none"
            bg={isActive ? 'bg.card' : 'transparent'}
            color={isActive ? 'action.primary' : 'text.muted'}
            _hover={{ color: isActive ? 'action.primary' : 'text.secondary' }}
            transition="all 0.15s ease"
          >
            <Link href={item.href}>
              <Icon />
              <Box
                as="span"
                fontSize="2xs"
                fontFamily="mono"
                letterSpacing="0.04em"
              >
                {item.label}
              </Box>
            </Link>
          </Flex>
        )
      })}
    </Flex>
  )
}
