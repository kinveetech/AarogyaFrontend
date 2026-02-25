'use client'

import {
  Box,
  Field,
  Flex,
  Input,
  NativeSelect,
  Text,
  Textarea,
} from '@chakra-ui/react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import {
  BLOOD_GROUPS,
  GENDERS,
  SPECIALIZATIONS,
} from './registration-constants'
import type { UserRole } from '@/lib/auth/types'
import type { RegistrationFormValues } from './registration-form-types'

interface ProfileStepProps {
  role: UserRole
  register: UseFormRegister<RegistrationFormValues>
  errors: FieldErrors<RegistrationFormValues>
}

export function ProfileStep({ role, register, errors }: ProfileStepProps) {
  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" color="text.primary" mb="2">
        Your details
      </Text>
      <Text fontSize="sm" color="text.muted" mb="6">
        Fill in your profile information. Fields marked with * are required.
      </Text>

      {/* Common fields */}
      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
        gap="5"
      >
        <Field.Root invalid={!!errors.firstName} required>
          <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
            First Name
          </Field.Label>
          <Input
            {...register('firstName')}
            bg="bg.glass"
            borderColor="border.default"
            borderRadius="xl"
            color="text.primary"
          />
          {errors.firstName && (
            <Field.ErrorText>{errors.firstName.message}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.lastName} required>
          <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
            Last Name
          </Field.Label>
          <Input
            {...register('lastName')}
            bg="bg.glass"
            borderColor="border.default"
            borderRadius="xl"
            color="text.primary"
          />
          {errors.lastName && (
            <Field.ErrorText>{errors.lastName.message}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.email} required>
          <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
            Email
          </Field.Label>
          <Input
            {...register('email')}
            type="email"
            bg="bg.glass"
            borderColor="border.default"
            borderRadius="xl"
            color="text.primary"
          />
          {errors.email && (
            <Field.ErrorText>{errors.email.message}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.phone}>
          <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
            Phone
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

        <Field.Root invalid={!!errors.dateOfBirth}>
          <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
            Date of Birth
          </Field.Label>
          <Input
            {...register('dateOfBirth')}
            type="date"
            bg="bg.glass"
            borderColor="border.default"
            borderRadius="xl"
            color="text.primary"
          />
          {errors.dateOfBirth && (
            <Field.ErrorText>{errors.dateOfBirth.message}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.gender}>
          <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
            Gender
          </Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              {...register('gender')}
              bg="bg.glass"
              borderColor="border.default"
              borderRadius="xl"
              color="text.primary"
            >
              <option value="">Select</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          {errors.gender && (
            <Field.ErrorText>{errors.gender.message}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.bloodGroup}>
          <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
            Blood Group
          </Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              {...register('bloodGroup')}
              bg="bg.glass"
              borderColor="border.default"
              borderRadius="xl"
              color="text.primary"
            >
              <option value="">Select</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          {errors.bloodGroup && (
            <Field.ErrorText>{errors.bloodGroup.message}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.address}>
          <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
            Address
          </Field.Label>
          <Textarea
            {...register('address')}
            bg="bg.glass"
            borderColor="border.default"
            borderRadius="xl"
            color="text.primary"
            rows={2}
          />
          {errors.address && (
            <Field.ErrorText>{errors.address.message}</Field.ErrorText>
          )}
        </Field.Root>
      </Box>

      {/* Doctor-specific fields */}
      {role === 'doctor' && (
        <Box mt="8">
          <Text fontSize="md" fontWeight="semibold" color="text.primary" mb="4">
            Medical Practice Details
          </Text>
          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
            gap="5"
          >
            <Field.Root invalid={!!errors.doctorData?.medicalLicenseNumber} required>
              <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
                Medical License Number
              </Field.Label>
              <Input
                {...register('doctorData.medicalLicenseNumber')}
                bg="bg.glass"
                borderColor="border.default"
                borderRadius="xl"
                color="text.primary"
              />
              {errors.doctorData?.medicalLicenseNumber && (
                <Field.ErrorText>
                  {errors.doctorData.medicalLicenseNumber.message}
                </Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.doctorData?.specialization} required>
              <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
                Specialization
              </Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  {...register('doctorData.specialization')}
                  bg="bg.glass"
                  borderColor="border.default"
                  borderRadius="xl"
                  color="text.primary"
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              {errors.doctorData?.specialization && (
                <Field.ErrorText>
                  {errors.doctorData.specialization.message}
                </Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.doctorData?.clinicOrHospitalName}>
              <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
                Clinic / Hospital Name
              </Field.Label>
              <Input
                {...register('doctorData.clinicOrHospitalName')}
                bg="bg.glass"
                borderColor="border.default"
                borderRadius="xl"
                color="text.primary"
              />
              {errors.doctorData?.clinicOrHospitalName && (
                <Field.ErrorText>
                  {errors.doctorData.clinicOrHospitalName.message}
                </Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.doctorData?.clinicAddress}>
              <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
                Clinic Address
              </Field.Label>
              <Textarea
                {...register('doctorData.clinicAddress')}
                bg="bg.glass"
                borderColor="border.default"
                borderRadius="xl"
                color="text.primary"
                rows={2}
              />
              {errors.doctorData?.clinicAddress && (
                <Field.ErrorText>
                  {errors.doctorData.clinicAddress.message}
                </Field.ErrorText>
              )}
            </Field.Root>
          </Box>
        </Box>
      )}

      {/* Lab Technician-specific fields */}
      {role === 'lab_technician' && (
        <Box mt="8">
          <Text fontSize="md" fontWeight="semibold" color="text.primary" mb="4">
            Lab Details
          </Text>
          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
            gap="5"
          >
            <Field.Root invalid={!!errors.labTechnicianData?.labName} required>
              <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
                Lab Name
              </Field.Label>
              <Input
                {...register('labTechnicianData.labName')}
                bg="bg.glass"
                borderColor="border.default"
                borderRadius="xl"
                color="text.primary"
              />
              {errors.labTechnicianData?.labName && (
                <Field.ErrorText>
                  {errors.labTechnicianData.labName.message}
                </Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.labTechnicianData?.labLicenseNumber}>
              <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
                Lab License Number
              </Field.Label>
              <Input
                {...register('labTechnicianData.labLicenseNumber')}
                bg="bg.glass"
                borderColor="border.default"
                borderRadius="xl"
                color="text.primary"
              />
              {errors.labTechnicianData?.labLicenseNumber && (
                <Field.ErrorText>
                  {errors.labTechnicianData.labLicenseNumber.message}
                </Field.ErrorText>
              )}
            </Field.Root>

            <Field.Root invalid={!!errors.labTechnicianData?.nablAccreditationId}>
              <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
                NABL Accreditation ID
              </Field.Label>
              <Input
                {...register('labTechnicianData.nablAccreditationId')}
                bg="bg.glass"
                borderColor="border.default"
                borderRadius="xl"
                color="text.primary"
              />
              {errors.labTechnicianData?.nablAccreditationId && (
                <Field.ErrorText>
                  {errors.labTechnicianData.nablAccreditationId.message}
                </Field.ErrorText>
              )}
            </Field.Root>
          </Box>
        </Box>
      )}
    </Box>
  )
}
