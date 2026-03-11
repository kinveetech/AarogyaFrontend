'use client'

import { Box, Button, Flex, Text } from '@chakra-ui/react'
import { RELATIONSHIP_LABELS, getInitials, formatPhone } from './emergency-constants'
import type { EmergencyContact } from '@/types/emergency'

export interface ContactCardProps {
  contact: EmergencyContact
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const initials = getInitials(contact.name)

  return (
    <Box
      bg="bg.glass"
      backdropFilter="blur(16px)"
      borderWidth="1px"
      borderColor="border.subtle"
      borderRadius="xl"
      p="5"
      boxShadow="glass"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
      data-testid="contact-card"
    >
      <Flex align="center" gap="4" flexWrap={{ base: 'wrap', md: 'nowrap' }}>
        {/* Avatar */}
        <Flex
          align="center"
          justify="center"
          boxSize="48px"
          borderRadius="full"
          flexShrink={0}
          fontFamily="mono"
          fontSize="0.95rem"
          fontWeight="medium"
          bg="action.primary"
          color="action.primary.text"
        >
          {initials}
        </Flex>

        {/* Info */}
        <Box flex="1" minW="0">
          <Text fontFamily="heading" fontSize="1.05rem" color="text.primary" mb="1">
            {contact.name}
          </Text>
          <Flex align="center" gap="2.5" flexWrap="wrap">
            {contact.isPrimary && (
              <Box
                as="span"
                px="2.5"
                py="0.5"
                borderRadius="full"
                bg="action.primary"
                fontSize="0.7rem"
                fontWeight="semibold"
                color="action.primary.text"
                letterSpacing="0.02em"
                data-testid="primary-badge"
              >
                Primary
              </Box>
            )}
            <Box
              as="span"
              px="2.5"
              py="0.5"
              borderRadius="full"
              bg="bg.overlay"
              fontSize="0.75rem"
              fontWeight="medium"
              color="text.muted"
            >
              {RELATIONSHIP_LABELS[contact.relationship]}
            </Box>
            <Text fontFamily="mono" fontSize="0.85rem" color="text.secondary">
              {formatPhone(contact.phone)}
            </Text>
          </Flex>
        </Box>

        {/* Actions */}
        <Flex
          gap="2"
          flexShrink={0}
          w={{ base: '100%', md: 'auto' }}
          justify={{ base: 'flex-end', md: 'flex-start' }}
        >
          <Button
            variant="outline"
            size="sm"
            borderRadius="full"
            borderColor="border.default"
            color="text.secondary"
            _hover={{ borderColor: 'action.primary', color: 'action.primary' }}
            onClick={() => onEdit(contact.id)}
            aria-label={`Edit ${contact.name}`}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            borderRadius="full"
            borderColor="rgba(255, 107, 107, 0.35)"
            color="coral.400"
            _hover={{ bg: 'rgba(255, 107, 107, 0.08)', borderColor: 'coral.400' }}
            onClick={() => onDelete(contact.id)}
            aria-label={`Remove ${contact.name}`}
          >
            Remove
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
