'use client'

import { useState, useMemo, useCallback } from 'react'
import { Box, Button, Flex, Text } from '@chakra-ui/react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ShieldTreeLogo } from '@/components/auth/shield-tree-logo'
import { RoleSelectionStep } from '@/components/registration/role-selection-step'
import { ProfileStep } from '@/components/registration/profile-step'
import { ConsentsStep } from '@/components/registration/consents-step'
import { CONSENT_CATALOG } from '@/components/registration/registration-constants'
import {
  patientProfileSchema,
  doctorProfileSchema,
  labTechnicianProfileSchema,
} from '@/lib/schemas/registration'
import { useRegister } from '@/hooks/registration'
import type { UserRole } from '@/lib/auth/types'
import type { RegisterUserRequest, InitialConsentGrant } from '@/types/registration'
import type { RegistrationFormValues } from '@/components/registration/registration-form-types'

type Step = 'role' | 'profile' | 'consents'

const STEPS: Step[] = ['role', 'profile', 'consents']

function getSchemaForRole(role: UserRole) {
  switch (role) {
    case 'doctor':
      return doctorProfileSchema
    case 'lab_technician':
      return labTechnicianProfileSchema
    default:
      return patientProfileSchema
  }
}

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <Flex align="center" gap="2" mb="6">
      {steps.map((label, i) => (
        <Flex key={label} align="center" gap="2" flex={i < steps.length - 1 ? 1 : undefined}>
          <Flex
            align="center"
            justify="center"
            boxSize="28px"
            borderRadius="full"
            fontSize="xs"
            fontWeight="semibold"
            bg={i <= current ? 'action.primary' : 'bg.overlay'}
            color={i <= current ? 'action.primary.text' : 'text.muted'}
            transition="all 0.2s ease"
          >
            {i + 1}
          </Flex>
          <Text
            fontSize="xs"
            fontWeight="medium"
            color={i <= current ? 'text.primary' : 'text.muted'}
            display={{ base: 'none', sm: 'block' }}
          >
            {label}
          </Text>
          {i < steps.length - 1 && (
            <Box flex="1" h="1px" bg={i < current ? 'action.primary' : 'border.subtle'} mx="1" />
          )}
        </Flex>
      ))}
    </Flex>
  )
}

const DEFAULT_VALUES: RegistrationFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  address: '',
  doctorData: {
    medicalLicenseNumber: '',
    specialization: '',
    clinicOrHospitalName: '',
    clinicAddress: '',
  },
  labTechnicianData: {
    labName: '',
    labLicenseNumber: '',
    nablAccreditationId: '',
  },
}

export default function RegisterPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const registerMutation = useRegister()

  const [step, setStep] = useState<Step>('role')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [consents, setConsents] = useState<InitialConsentGrant[]>(() =>
    CONSENT_CATALOG.map((c) => ({ purpose: c.purpose, isGranted: c.required })),
  )
  const [submitError, setSubmitError] = useState<string | null>(null)

  const schema = useMemo(
    () => (selectedRole ? getSchemaForRole(selectedRole) : patientProfileSchema),
    [selectedRole],
  )

  const form = useForm<RegistrationFormValues>({
    // Schema changes per role — cast needed since patient schema lacks doctorData/labTechnicianData
    resolver: zodResolver(schema) as unknown as Resolver<RegistrationFormValues>,
    defaultValues: {
      ...DEFAULT_VALUES,
      email: session?.user?.email ?? '',
    },
  })

  const currentStepIndex = STEPS.indexOf(step)

  const handleRoleSelect = useCallback((role: UserRole) => {
    setSelectedRole(role)
  }, [])

  const handleNext = useCallback(async () => {
    if (step === 'role') {
      if (!selectedRole) return
      setStep('profile')
      return
    }

    if (step === 'profile') {
      const valid = await form.trigger()
      if (!valid) return
      setStep('consents')
    }
  }, [step, selectedRole, form])

  const handleBack = useCallback(() => {
    if (step === 'profile') {
      setStep('role')
      return
    }
    if (step === 'consents') {
      setStep('profile')
    }
  }, [step])

  const handleSubmit = useCallback(async () => {
    if (!selectedRole) return
    setSubmitError(null)

    const formData = form.getValues()

    const request: RegisterUserRequest = {
      role: selectedRole,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      gender: formData.gender || undefined,
      address: formData.address || undefined,
      bloodGroup: formData.bloodGroup || undefined,
      consents,
    }

    if (selectedRole === 'doctor') {
      request.doctorData = {
        medicalLicenseNumber: formData.doctorData.medicalLicenseNumber,
        specialization: formData.doctorData.specialization,
        clinicOrHospitalName: formData.doctorData.clinicOrHospitalName || undefined,
        clinicAddress: formData.doctorData.clinicAddress || undefined,
      }
    }

    if (selectedRole === 'lab_technician') {
      request.labTechnicianData = {
        labName: formData.labTechnicianData.labName,
        labLicenseNumber: formData.labTechnicianData.labLicenseNumber || undefined,
        nablAccreditationId: formData.labTechnicianData.nablAccreditationId || undefined,
      }
    }

    try {
      const response = await registerMutation.mutateAsync(request)

      if (response.registrationStatus === 'approved') {
        router.push('/reports')
      } else {
        router.push('/register/pending')
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Registration failed. Please try again.'
      setSubmitError(message)
    }
  }, [selectedRole, form, consents, registerMutation, router])

  return (
    <Box
      bg="bg.glass"
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="border.subtle"
      boxShadow="glass"
      borderRadius="lg"
      maxW="560px"
      w="full"
      p={8}
    >
      {/* Header */}
      <Flex direction="column" align="center" mb="6">
        <ShieldTreeLogo size={56} />
        <Text fontSize="lg" fontWeight="medium" color="text.primary" mt="3">
          Create your account
        </Text>
        <Text fontSize="sm" color="text.muted" mt="1">
          Complete registration to get started
        </Text>
      </Flex>

      {/* Step indicator */}
      <StepIndicator
        current={currentStepIndex}
        steps={['Role', 'Profile', 'Consents']}
      />

      {/* Step content */}
      <Box minH="300px">
        {step === 'role' && (
          <RoleSelectionStep selectedRole={selectedRole} onSelect={handleRoleSelect} />
        )}
        {step === 'profile' && selectedRole && (
          <ProfileStep
            role={selectedRole}
            register={form.register}
            errors={form.formState.errors}
          />
        )}
        {step === 'consents' && (
          <ConsentsStep consents={consents} onChange={setConsents} />
        )}
      </Box>

      {/* Error */}
      {submitError && (
        <Box
          mt="4"
          px="4"
          py="3"
          borderRadius="md"
          bg="coral.50"
          _dark={{ bg: 'rgba(255,107,107,0.1)' }}
          border="1px solid"
          borderColor="status.error"
        >
          <Text fontSize="sm" color="status.error" textAlign="center">
            {submitError}
          </Text>
        </Box>
      )}

      {/* Navigation */}
      <Flex justify="space-between" mt="6" gap="3">
        {step !== 'role' ? (
          <Button
            variant="outline"
            borderRadius="full"
            borderColor="border.default"
            color="text.primary"
            _hover={{ bg: 'bg.overlay' }}
            onClick={handleBack}
          >
            Back
          </Button>
        ) : (
          <Box />
        )}

        {step === 'consents' ? (
          <Button
            borderRadius="full"
            bg="action.primary"
            color="action.primary.text"
            px="7"
            _hover={{
              bg: 'action.primary.hover',
              transform: 'translateY(-1px)',
            }}
            boxShadow="md"
            onClick={handleSubmit}
            loading={registerMutation.isPending}
            disabled={registerMutation.isPending}
          >
            Complete Registration
          </Button>
        ) : (
          <Button
            borderRadius="full"
            bg="action.primary"
            color="action.primary.text"
            px="7"
            _hover={{
              bg: 'action.primary.hover',
              transform: 'translateY(-1px)',
            }}
            boxShadow="md"
            onClick={handleNext}
            disabled={step === 'role' && !selectedRole}
          >
            Continue
          </Button>
        )}
      </Flex>
    </Box>
  )
}
