'use client'

import { useState, useMemo, useCallback } from 'react'
import { Box, Button, Flex, Heading, Skeleton, Text, Tooltip, VStack } from '@chakra-ui/react'
import {
  useEmergencyContacts,
  useCreateEmergencyContact,
  useUpdateEmergencyContact,
  useDeleteEmergencyContact,
} from '@/hooks/emergency'
import { useAuth } from '@/hooks/use-auth'
import { ContactCard, ContactModal, EmergencyAccessForm, EmergencyAccessAudit, MAX_CONTACTS } from '@/components/emergency'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyStateView } from '@/components/ui/empty-state'
import type { EmergencyContact } from '@/types/emergency'
import type { EmergencyContact as EmergencyContactFormData } from '@/lib/schemas/emergencyContact'

export default function EmergencyPage() {
  const { user } = useAuth()
  const { data, isLoading } = useEmergencyContacts()
  const createContact = useCreateEmergencyContact()
  const updateContact = useUpdateEmergencyContact()
  const deleteContact = useDeleteEmergencyContact()

  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<EmergencyContact | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<EmergencyContact | null>(null)

  const contacts = useMemo(() => data?.items ?? [], [data])
  const isAtLimit = contacts.length >= MAX_CONTACTS
  const isEmpty = !isLoading && contacts.length === 0

  const handleAddClick = useCallback(() => {
    setEditTarget(null)
    setModalOpen(true)
  }, [])

  const handleEditClick = useCallback(
    (id: string) => {
      const contact = contacts.find((c) => c.id === id)
      if (contact) {
        setEditTarget(contact)
        setModalOpen(true)
      }
    },
    [contacts],
  )

  const handleDeleteClick = useCallback(
    (id: string) => {
      const contact = contacts.find((c) => c.id === id)
      if (contact) setDeleteTarget(contact)
    },
    [contacts],
  )

  const handleModalSubmit = useCallback(
    (formData: EmergencyContactFormData) => {
      if (editTarget) {
        updateContact.mutate(
          { id: editTarget.id, ...formData },
          { onSuccess: () => setModalOpen(false) },
        )
      } else {
        createContact.mutate(formData, {
          onSuccess: () => setModalOpen(false),
        })
      }
    },
    [editTarget, createContact, updateContact],
  )

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    deleteContact.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }, [deleteTarget, deleteContact])

  return (
    <Box maxW="1200px" mx="auto" px={{ base: '4', md: '6' }} py="6">
      {/* Header */}
      <Flex align="center" justify="space-between" mb="5" flexWrap="wrap" gap="3">
        <Heading
          as="h1"
          fontFamily="heading"
          fontSize={{ base: '1.4rem', md: '1.75rem' }}
          color="text.primary"
          letterSpacing="-0.01em"
        >
          Emergency Contacts
        </Heading>
        <Tooltip.Root disabled={!isAtLimit}>
          <Tooltip.Trigger asChild>
            <Button
              borderRadius="full"
              bg="action.primary"
              color="action.primary.text"
              _hover={{
                bg: 'action.primary.hover',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(14, 107, 102, 0.25)',
              }}
              onClick={handleAddClick}
              disabled={isAtLimit}
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
              Add Contact
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>
              Maximum {MAX_CONTACTS} contacts allowed
            </Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>
      </Flex>

      {/* Callout banner */}
      {!isEmpty && !isLoading && (
        <Flex
          align="flex-start"
          gap="3"
          px="4"
          py="3"
          borderRadius="xl"
          mb="6"
          bg="rgba(255, 179, 71, 0.12)"
          borderWidth="1px"
          borderColor="rgba(255, 179, 71, 0.25)"
          css={{
            _dark: {
              bg: 'rgba(255, 179, 71, 0.08)',
              borderColor: 'rgba(255, 179, 71, 0.18)',
            },
          }}
        >
          <Box flexShrink={0} mt="0.5" color="amber.400">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </Box>
          <Text fontSize="0.88rem" fontWeight="medium" color="text.secondary" lineHeight="1.5">
            These contacts can access your emergency medical profile if you are incapacitated.
          </Text>
        </Flex>
      )}

      {/* Loading */}
      {isLoading && (
        <VStack gap="3" data-testid="emergency-loading">
          {[1, 2].map((i) => (
            <Skeleton key={i} height="80px" w="full" borderRadius="xl" />
          ))}
        </VStack>
      )}

      {/* Empty state */}
      {isEmpty && (
        <EmptyStateView
          icon={
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          }
          title="No emergency contacts"
          description="Add people who should be contacted in case of emergency"
          action={{
            label: 'Add Contact',
            onClick: handleAddClick,
          }}
        />
      )}

      {/* Contact list */}
      {!isLoading && contacts.length > 0 && (
        <VStack gap="3" align="stretch">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}

          {/* Add contact card (dashed) */}
          {!isAtLimit && (
            <Box
              border="2px dashed"
              borderColor="border.default"
              borderRadius="xl"
              py="7"
              px="5"
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap="2"
              cursor="pointer"
              transition="all 0.25s"
              _hover={{ borderColor: 'action.primary', bg: 'bg.overlay' }}
              onClick={handleAddClick}
              role="button"
              aria-label="Add emergency contact"
              data-testid="add-contact-card"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                style={{ color: 'var(--chakra-colors-text-muted)' }}
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <Text fontSize="0.88rem" color="text.muted" fontWeight="medium">
                Add emergency contact ({MAX_CONTACTS - contacts.length} remaining)
              </Text>
            </Box>
          )}

          {/* Hint */}
          <Text fontFamily="mono" fontSize="0.75rem" color="text.muted" mt="1">
            Maximum {MAX_CONTACTS} emergency contacts allowed
          </Text>
        </VStack>
      )}

      {/* Emergency Access Request */}
      <Box mt="10" mb="6">
        <EmergencyAccessForm />
      </Box>

      {/* Access History — admin only */}
      {user?.role === 'admin' && (
        <Box mb="6">
          <EmergencyAccessAudit />
        </Box>
      )}

      {/* Add/Edit modal */}
      <ContactModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        loading={editTarget ? updateContact.isPending : createContact.isPending}
        initialData={editTarget}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Contact"
        subtitle={deleteTarget?.name}
        message="This person will no longer be listed as your emergency contact. You can add them back later."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        destructive
        loading={deleteContact.isPending}
      />
    </Box>
  )
}
