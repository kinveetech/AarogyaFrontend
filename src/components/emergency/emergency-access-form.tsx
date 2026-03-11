'use client'

import { useCallback, useState } from 'react'
import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { emergencyAccessRequestSchema } from '@/lib/schemas/emergencyAccess'
import type { EmergencyAccessRequest } from '@/lib/schemas/emergencyAccess'
import type { EmergencyAccessResponse } from '@/types/emergency'
import { useRequestEmergencyAccess } from '@/hooks/emergency'
import { ApiError } from '@/lib/api/client'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function EmergencyAccessForm() {
  const requestAccess = useRequestEmergencyAccess()
  const [grantResult, setGrantResult] = useState<EmergencyAccessResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmergencyAccessRequest>({
    resolver: zodResolver(emergencyAccessRequestSchema),
    defaultValues: {
      patientSub: '',
      emergencyContactPhone: '',
      doctorSub: '',
      reason: '',
      durationHours: null,
    },
  })

  const onSubmit = useCallback(
    (data: EmergencyAccessRequest) => {
      setApiError(null)
      setGrantResult(null)

      const payload = {
        ...data,
        durationHours: data.durationHours ?? undefined,
      }

      requestAccess.mutate(
        {
          patientSub: payload.patientSub,
          emergencyContactPhone: payload.emergencyContactPhone,
          doctorSub: payload.doctorSub,
          reason: payload.reason,
          durationHours: payload.durationHours,
        },
        {
          onSuccess: (response) => {
            setGrantResult(response)
            reset()
          },
          onError: (error) => {
            if (error instanceof ApiError) {
              setApiError(error.message)
            } else {
              setApiError('An unexpected error occurred. Please try again.')
            }
          },
        },
      )
    },
    [requestAccess, reset],
  )

  const handleNewRequest = useCallback(() => {
    setGrantResult(null)
    setApiError(null)
  }, [])

  if (grantResult) {
    return (
      <Box
        bg="bg.glass"
        backdropFilter="blur(24px)"
        borderColor="border.subtle"
        borderWidth="1px"
        borderRadius="2xl"
        p="6"
        data-testid="emergency-access-success"
      >
        <Flex align="center" gap="3" mb="4">
          <Box color="green.500" flexShrink={0}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </Box>
          <Heading as="h3" fontFamily="heading" fontSize="1.1rem" color="text.primary">
            Emergency Access Granted
          </Heading>
        </Flex>

        <VStack gap="3" align="stretch">
          <Flex justify="space-between" align="center">
            <Text fontSize="0.85rem" color="text.muted">Grant ID</Text>
            <Text fontFamily="mono" fontSize="0.82rem" color="text.primary" data-testid="grant-id">
              {grantResult.grantId}
            </Text>
          </Flex>
          <Flex justify="space-between" align="center">
            <Text fontSize="0.85rem" color="text.muted">Purpose</Text>
            <Text fontSize="0.85rem" color="text.primary" data-testid="grant-purpose">
              {grantResult.purpose}
            </Text>
          </Flex>
          <Flex justify="space-between" align="center">
            <Text fontSize="0.85rem" color="text.muted">Starts At</Text>
            <Text fontFamily="mono" fontSize="0.82rem" color="text.primary" data-testid="grant-starts-at">
              {formatDateTime(grantResult.startsAt)}
            </Text>
          </Flex>
          <Flex justify="space-between" align="center">
            <Text fontSize="0.85rem" color="text.muted">Expires At</Text>
            <Text fontFamily="mono" fontSize="0.82rem" color="text.primary" data-testid="grant-expires-at">
              {formatDateTime(grantResult.expiresAt)}
            </Text>
          </Flex>
        </VStack>

        <Button
          mt="5"
          borderRadius="full"
          variant="ghost"
          onClick={handleNewRequest}
          data-testid="new-request-button"
        >
          Submit Another Request
        </Button>
      </Box>
    )
  }

  return (
    <Box
      bg="bg.glass"
      backdropFilter="blur(24px)"
      borderColor="border.subtle"
      borderWidth="1px"
      borderRadius="2xl"
      p="6"
      data-testid="emergency-access-form"
    >
      <Heading
        as="h3"
        fontFamily="heading"
        fontSize="1.1rem"
        color="text.primary"
        mb="1"
      >
        Request Emergency Access
      </Heading>
      <Text fontSize="0.85rem" color="text.muted" mb="5">
        Request time-limited access to a patient&apos;s medical records in an emergency.
      </Text>

      {apiError && (
        <Flex
          align="flex-start"
          gap="3"
          px="4"
          py="3"
          borderRadius="xl"
          mb="5"
          bg="rgba(239, 68, 68, 0.1)"
          borderWidth="1px"
          borderColor="rgba(239, 68, 68, 0.25)"
          data-testid="emergency-access-error"
        >
          <Box flexShrink={0} mt="0.5" color="red.500">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </Box>
          <Text fontSize="0.85rem" fontWeight="medium" color="text.primary">
            {apiError}
          </Text>
        </Flex>
      )}

      <Box as="form" onSubmit={handleSubmit(onSubmit)} {...{ noValidate: true }}>
        <VStack gap="4" align="stretch">
          {/* Patient Identifier */}
          <Field.Root invalid={!!errors.patientSub} required>
            <Field.Label color="text.secondary" fontSize="0.82rem" fontWeight="semibold">
              Patient Identifier
            </Field.Label>
            <Input
              {...register('patientSub')}
              placeholder="Enter patient identifier"
              bg="bg.glass"
              borderColor="border.default"
              borderRadius="xl"
              color="text.primary"
            />
            {errors.patientSub && (
              <Field.ErrorText>{errors.patientSub.message}</Field.ErrorText>
            )}
          </Field.Root>

          {/* Emergency Contact Phone */}
          <Field.Root invalid={!!errors.emergencyContactPhone} required>
            <Field.Label color="text.secondary" fontSize="0.82rem" fontWeight="semibold">
              Emergency Contact Phone
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
                {...register('emergencyContactPhone')}
                type="tel"
                placeholder="Enter contact phone"
                bg="bg.glass"
                borderColor="border.default"
                borderLeftRadius="0"
                borderRightRadius="xl"
                color="text.primary"
              />
            </Flex>
            {errors.emergencyContactPhone && (
              <Field.ErrorText>{errors.emergencyContactPhone.message}</Field.ErrorText>
            )}
          </Field.Root>

          {/* Doctor Identifier */}
          <Field.Root invalid={!!errors.doctorSub} required>
            <Field.Label color="text.secondary" fontSize="0.82rem" fontWeight="semibold">
              Doctor Identifier
            </Field.Label>
            <Input
              {...register('doctorSub')}
              placeholder="Enter doctor identifier"
              bg="bg.glass"
              borderColor="border.default"
              borderRadius="xl"
              color="text.primary"
            />
            {errors.doctorSub && (
              <Field.ErrorText>{errors.doctorSub.message}</Field.ErrorText>
            )}
          </Field.Root>

          {/* Reason */}
          <Field.Root invalid={!!errors.reason} required>
            <Field.Label color="text.secondary" fontSize="0.82rem" fontWeight="semibold">
              Reason for Emergency Access
            </Field.Label>
            <Textarea
              {...register('reason')}
              placeholder="Describe the emergency situation requiring access"
              bg="bg.glass"
              borderColor="border.default"
              borderRadius="xl"
              color="text.primary"
              rows={3}
            />
            {errors.reason && (
              <Field.ErrorText>{errors.reason.message}</Field.ErrorText>
            )}
          </Field.Root>

          {/* Duration Hours (optional) */}
          <Field.Root invalid={!!errors.durationHours}>
            <Field.Label color="text.secondary" fontSize="0.82rem" fontWeight="semibold">
              Duration (hours)
            </Field.Label>
            <Input
              {...register('durationHours', {
                setValueAs: (v: string) => {
                  if (v === '' || v === undefined || v === null) return null
                  const num = Number(v)
                  return Number.isNaN(num) ? null : num
                },
              })}
              type="number"
              placeholder="Default: 24 hours"
              bg="bg.glass"
              borderColor="border.default"
              borderRadius="xl"
              color="text.primary"
              min={1}
              max={72}
            />
            {errors.durationHours && (
              <Field.ErrorText>{errors.durationHours.message}</Field.ErrorText>
            )}
            <Text fontSize="0.75rem" color="text.muted" mt="1">
              Leave empty for default duration. Maximum 72 hours.
            </Text>
          </Field.Root>

          <Button
            type="submit"
            borderRadius="full"
            bg="action.primary"
            color="action.primary.text"
            _hover={{
              bg: 'action.primary.hover',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(14, 107, 102, 0.25)',
            }}
            loading={requestAccess.isPending}
            disabled={requestAccess.isPending}
            mt="2"
          >
            Request Emergency Access
          </Button>
        </VStack>
      </Box>
    </Box>
  )
}
