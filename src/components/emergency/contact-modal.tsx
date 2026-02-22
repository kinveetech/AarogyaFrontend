'use client'

import { useEffect } from 'react'
import {
  Box,
  Button,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  DialogPositioner,
  Field,
  Flex,
  Input,
  NativeSelect,
  Text,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { emergencyContactSchema } from '@/lib/schemas/emergencyContact'
import { RELATIONSHIP_LABELS } from './emergency-constants'
import type { EmergencyContact as EmergencyContactFormData } from '@/lib/schemas/emergencyContact'
import type { EmergencyContact, Relationship } from '@/types/emergency'

export interface ContactModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: EmergencyContactFormData) => void
  loading?: boolean
  initialData?: EmergencyContact | null
}

const RELATIONSHIPS = Object.entries(RELATIONSHIP_LABELS) as [Relationship, string][]

export function ContactModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  initialData,
}: ContactModalProps) {
  const isEdit = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmergencyContactFormData>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      name: '',
      phone: '',
      relationship: 'spouse',
    },
  })

  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? {
              name: initialData.name,
              phone: initialData.phone,
              relationship: initialData.relationship,
            }
          : { name: '', phone: '', relationship: 'spouse' },
      )
    }
  }, [open, initialData, reset])

  return (
    <DialogRoot
      open={open}
      onOpenChange={(details) => !details.open && onClose()}
    >
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent
          bg="bg.glass"
          backdropFilter="blur(24px)"
          borderColor="border.subtle"
          borderWidth="1px"
          boxShadow="glass"
          borderRadius="2xl"
          maxW="480px"
          w="full"
          mx="4"
        >
          <DialogHeader>
            <DialogTitle fontFamily="heading" fontSize="1.2rem" color="text.primary">
              {isEdit ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
            </DialogTitle>
          </DialogHeader>

          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <DialogBody>
              <Box
                height="1px"
                bg="border.subtle"
                mb="5"
              />

              <Box display="flex" flexDirection="column" gap="4">
                {/* Name */}
                <Field.Root invalid={!!errors.name}>
                  <Field.Label color="text.secondary" fontSize="0.82rem" fontWeight="semibold">
                    Full Name
                  </Field.Label>
                  <Input
                    {...register('name')}
                    placeholder="Enter full name"
                    bg="bg.glass"
                    borderColor="border.default"
                    borderRadius="xl"
                    color="text.primary"
                  />
                  {errors.name && (
                    <Field.ErrorText>{errors.name.message}</Field.ErrorText>
                  )}
                </Field.Root>

                {/* Relationship */}
                <Field.Root invalid={!!errors.relationship}>
                  <Field.Label color="text.secondary" fontSize="0.82rem" fontWeight="semibold">
                    Relationship
                  </Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      {...register('relationship')}
                      bg="bg.glass"
                      borderColor="border.default"
                      borderRadius="xl"
                      color="text.primary"
                    >
                      {RELATIONSHIPS.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  {errors.relationship && (
                    <Field.ErrorText>{errors.relationship.message}</Field.ErrorText>
                  )}
                </Field.Root>

                {/* Phone */}
                <Field.Root invalid={!!errors.phone}>
                  <Field.Label color="text.secondary" fontSize="0.82rem" fontWeight="semibold">
                    Phone Number
                  </Field.Label>
                  <Flex gap="0">
                    <Flex
                      align="center"
                      px="3"
                      bg="bg.overlay"
                      borderWidth="1px"
                      borderColor="border.default"
                      borderRight="none"
                      borderLeftRadius="xl"
                      fontFamily="mono"
                      fontSize="0.85rem"
                      color="text.muted"
                      fontWeight="medium"
                    >
                      <Text>+91</Text>
                    </Flex>
                    <Input
                      {...register('phone')}
                      type="tel"
                      placeholder="Enter phone number"
                      bg="bg.glass"
                      borderColor="border.default"
                      borderLeftRadius="0"
                      borderRightRadius="xl"
                      color="text.primary"
                    />
                  </Flex>
                  {errors.phone && (
                    <Field.ErrorText>{errors.phone.message}</Field.ErrorText>
                  )}
                </Field.Root>
              </Box>
            </DialogBody>

            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="ghost" borderRadius="full">
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button
                type="submit"
                borderRadius="full"
                bg="action.primary"
                color="action.primary.text"
                loading={loading}
                disabled={loading}
              >
                {isEdit ? 'Save Changes' : 'Save Contact'}
              </Button>
            </DialogFooter>
          </Box>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}
