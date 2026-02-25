'use client'

import { Box, Flex, Text } from '@chakra-ui/react'
import { ROLE_INFO } from './registration-constants'
import type { UserRole } from '@/lib/auth/types'

function UserIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function StethoscopeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  )
}

function FlaskIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
      <path d="M8.5 2h7" />
      <path d="M7 16.5h10" />
    </svg>
  )
}

const ICONS: Record<string, () => React.ReactElement> = {
  user: UserIcon,
  stethoscope: StethoscopeIcon,
  flask: FlaskIcon,
}

interface RoleSelectionStepProps {
  selectedRole: UserRole | null
  onSelect: (role: UserRole) => void
}

export function RoleSelectionStep({ selectedRole, onSelect }: RoleSelectionStepProps) {
  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" color="text.primary" mb="2">
        Choose your role
      </Text>
      <Text fontSize="sm" color="text.muted" mb="6">
        Select how you will use Aarogya. This determines your experience and access level.
      </Text>

      <Flex direction="column" gap="3">
        {ROLE_INFO.map((role) => {
          const isSelected = selectedRole === role.value
          const Icon = ICONS[role.icon]

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onSelect(role.value)}
              style={{ all: 'unset', width: '100%', cursor: 'pointer' }}
            >
              <Box
                w="full"
                p="5"
                bg={isSelected ? 'rgba(10, 77, 74, 0.08)' : 'bg.glass'}
                _dark={isSelected ? { bg: 'rgba(10, 77, 74, 0.2)' } : undefined}
                border="2px solid"
                borderColor={isSelected ? 'action.primary' : 'border.subtle'}
                borderRadius="xl"
                transition="all 0.2s ease"
                _hover={{
                  borderColor: isSelected ? 'action.primary' : 'border.default',
                  transform: 'translateY(-1px)',
                }}
                textAlign="left"
              >
                <Flex align="center" gap="4">
                  <Flex
                    align="center"
                    justify="center"
                    boxSize="48px"
                    borderRadius="lg"
                    bg={isSelected ? 'action.primary' : 'bg.overlay'}
                    color={isSelected ? 'action.primary.text' : 'text.secondary'}
                    flexShrink={0}
                    transition="all 0.2s ease"
                  >
                    <Icon />
                  </Flex>
                  <Box flex="1">
                    <Flex align="center" gap="2">
                      <Text fontWeight="semibold" fontSize="md" color="text.primary">
                        {role.label}
                      </Text>
                      {role.requiresApproval && (
                        <Text
                          fontSize="xs"
                          color="status.warning"
                          bg="rgba(255, 179, 71, 0.15)"
                          px="2"
                          py="0.5"
                          borderRadius="full"
                          fontWeight="medium"
                        >
                          Requires approval
                        </Text>
                      )}
                    </Flex>
                    <Text fontSize="sm" color="text.muted" mt="0.5">
                      {role.description}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </button>
          )
        })}
      </Flex>
    </Box>
  )
}
