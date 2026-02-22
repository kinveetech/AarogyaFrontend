'use client'

import { Box, Flex, IconButton } from '@chakra-ui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems, ChevronLeftIcon } from './nav-items'

const SIDEBAR_EXPANDED = 240
const SIDEBAR_COLLAPSED = 72

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export { SIDEBAR_EXPANDED, SIDEBAR_COLLAPSED }

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const width = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

  return (
    <Flex
      as="nav"
      aria-label="Main navigation"
      position="fixed"
      top="56px"
      left="0"
      bottom="0"
      width={`${width}px`}
      direction="column"
      bg="bg.glass"
      backdropFilter="blur(24px)"
      borderRight="1px solid"
      borderColor="border.subtle"
      transition="width 0.2s cubic-bezier(0.4,0,0.2,1)"
      display={{ base: 'none', md: 'flex' }}
      zIndex="99"
      py="3"
      overflow="hidden"
    >
      <Flex direction="column" gap="1" px="3" flex="1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Flex
              key={item.href}
              asChild
              alignItems="center"
              gap="3"
              px="3"
              py="2.5"
              borderRadius="lg"
              textDecoration="none"
              fontFamily="mono"
              fontSize="xs"
              letterSpacing="0.04em"
              fontWeight={isActive ? 'medium' : 'normal'}
              bg={isActive ? 'bg.card' : 'transparent'}
              color={isActive ? 'action.primary' : 'text.muted'}
              boxShadow={isActive ? 'sm' : 'none'}
              _hover={{
                bg: isActive ? 'bg.card' : 'bg.overlay',
                color: isActive ? 'action.primary' : 'text.secondary',
              }}
              transition="all 0.15s ease"
            >
              <Link href={item.href}>
                <Box flexShrink={0}>
                  <Icon />
                </Box>
                {!collapsed && (
                  <Box as="span" whiteSpace="nowrap">
                    {item.label}
                  </Box>
                )}
              </Link>
            </Flex>
          )
        })}
      </Flex>

      <Flex px="3" pb="2">
        <IconButton
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggle}
          variant="ghost"
          borderRadius="full"
          size="sm"
          color="text.muted"
          _hover={{ bg: 'bg.overlay', color: 'text.secondary' }}
          transform={collapsed ? 'rotate(180deg)' : undefined}
          transition="transform 0.2s ease"
        >
          <ChevronLeftIcon />
        </IconButton>
      </Flex>
    </Flex>
  )
}
