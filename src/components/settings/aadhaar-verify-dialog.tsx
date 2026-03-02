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
  Input,
  Text,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { aadhaarVerificationSchema } from '@/lib/schemas/aadhaarVerification'
import { useVerifyAadhaar } from '@/hooks/profile'
import type { AadhaarVerification } from '@/lib/schemas/aadhaarVerification'
import type { Profile } from '@/types/profile'

export interface AadhaarVerifyDialogProps {
  open: boolean
  onClose: () => void
  profile: Profile
}

function formatDateForInput(dateStr: string): string {
  const d = new Date(dateStr)
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function AadhaarVerifyDialog({
  open,
  onClose,
  profile,
}: AadhaarVerifyDialogProps) {
  const verifyAadhaar = useVerifyAadhaar()
  const resetMutation = verifyAadhaar.reset

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AadhaarVerification>({
    resolver: zodResolver(aadhaarVerificationSchema),
  })

  useEffect(() => {
    if (open) {
      reset({
        aadhaarNumber: '',
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth: profile.dateOfBirth
          ? formatDateForInput(profile.dateOfBirth)
          : '',
      })
      resetMutation()
    }
  }, [open, profile, reset, resetMutation])

  const onSubmit = (data: AadhaarVerification) => {
    verifyAadhaar.mutate(
      {
        aadhaarNumber: data.aadhaarNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
      },
      {
        onSuccess: () => {
          onClose()
        },
      },
    )
  }

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
          aria-describedby="aadhaar-verify-body"
        >
          <DialogHeader>
            <DialogTitle fontFamily="heading" fontSize="1.2rem" color="text.primary">
              Verify Aadhaar
            </DialogTitle>
            <Text fontSize="sm" color="text.muted" mt="1">
              Enter your Aadhaar details to verify your identity.
            </Text>
          </DialogHeader>

          <Box as="form" onSubmit={handleSubmit(onSubmit)} {...{ noValidate: true }}>
            <DialogBody id="aadhaar-verify-body">
              <Box display="flex" flexDirection="column" gap="4">
                {/* Aadhaar Number */}
                <Field.Root invalid={!!errors.aadhaarNumber} required>
                  <Field.Label color="text.secondary" fontSize="0.82rem" fontWeight="semibold">
                    Aadhaar Number
                  </Field.Label>
                  <Input
                    {...register('aadhaarNumber')}
                    inputMode="numeric"
                    maxLength={12}
                    placeholder="Enter 12-digit Aadhaar number"
                    bg="bg.glass"
                    borderColor="border.default"
                    borderRadius="xl"
                    color="text.primary"
                    fontFamily="mono"
                    data-testid="aadhaar-number-input"
                  />
                  {errors.aadhaarNumber && (
                    <Field.ErrorText>{errors.aadhaarNumber.message}</Field.ErrorText>
                  )}
                </Field.Root>

                {/* First Name */}
                <Field.Root invalid={!!errors.firstName} required>
                  <Field.Label color="text.secondary" fontSize="0.82rem" fontWeight="semibold">
                    First Name
                  </Field.Label>
                  <Input
                    {...register('firstName')}
                    placeholder="Enter first name"
                    bg="bg.glass"
                    borderColor="border.default"
                    borderRadius="xl"
                    color="text.primary"
                    data-testid="aadhaar-first-name-input"
                  />
                  {errors.firstName && (
                    <Field.ErrorText>{errors.firstName.message}</Field.ErrorText>
                  )}
                </Field.Root>

                {/* Last Name */}
                <Field.Root invalid={!!errors.lastName} required>
                  <Field.Label color="text.secondary" fontSize="0.82rem" fontWeight="semibold">
                    Last Name
                  </Field.Label>
                  <Input
                    {...register('lastName')}
                    placeholder="Enter last name"
                    bg="bg.glass"
                    borderColor="border.default"
                    borderRadius="xl"
                    color="text.primary"
                    data-testid="aadhaar-last-name-input"
                  />
                  {errors.lastName && (
                    <Field.ErrorText>{errors.lastName.message}</Field.ErrorText>
                  )}
                </Field.Root>

                {/* Date of Birth */}
                <Field.Root invalid={!!errors.dateOfBirth} required>
                  <Field.Label color="text.secondary" fontSize="0.82rem" fontWeight="semibold">
                    Date of Birth
                  </Field.Label>
                  <Input
                    {...register('dateOfBirth')}
                    type="date"
                    bg="bg.glass"
                    borderColor="border.default"
                    borderRadius="xl"
                    color="text.primary"
                    data-testid="aadhaar-dob-input"
                  />
                  {errors.dateOfBirth && (
                    <Field.ErrorText>{errors.dateOfBirth.message}</Field.ErrorText>
                  )}
                </Field.Root>

                {/* Inline error from API */}
                {verifyAadhaar.isError && (
                  <Text
                    fontSize="0.85rem"
                    color="status.error"
                    data-testid="aadhaar-verify-error"
                  >
                    {verifyAadhaar.error?.message ?? 'Verification failed. Please try again.'}
                  </Text>
                )}
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
                loading={verifyAadhaar.isPending}
                disabled={verifyAadhaar.isPending}
                data-testid="aadhaar-verify-submit"
              >
                Verify
              </Button>
            </DialogFooter>
          </Box>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}
