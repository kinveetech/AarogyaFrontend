'use client'

import { useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  Field,
  Flex,
  Input,
  NativeSelect,
  Skeleton,
  Text,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileUpdateSchema } from '@/lib/schemas/profileUpdate'
import { BLOOD_GROUP_OPTIONS, GENDER_OPTIONS } from './settings-constants'
import { SettingsSection } from './settings-section'
import type { ProfileUpdate } from '@/lib/schemas/profileUpdate'
import type { Profile } from '@/types/profile'

export interface ProfileSectionProps {
  profile: Profile | undefined
  isLoading: boolean
  isSaving: boolean
  onSave: (data: ProfileUpdate) => void
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function formatDateForInput(dateStr: string): string {
  const d = new Date(dateStr)
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function ProfileSection({ profile, isLoading, isSaving, onSave }: ProfileSectionProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileUpdate>({
    resolver: zodResolver(profileUpdateSchema),
  })

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        dateOfBirth: formatDateForInput(profile.dateOfBirth),
        bloodGroup: profile.bloodGroup,
        gender: profile.gender,
        city: profile.city,
      })
    }
  }, [profile, reset])

  const handleFormSubmit = useCallback(
    (data: ProfileUpdate) => {
      onSave(data)
    },
    [onSave],
  )

  if (isLoading) {
    return (
      <SettingsSection title="Profile" testId="profile-loading">
        <Flex align="center" gap="5" mb="6">
          <Skeleton boxSize="80px" borderRadius="full" />
          <Box>
            <Skeleton height="24px" width="160px" mb="2" />
            <Skeleton height="16px" width="200px" />
          </Box>
        </Flex>
        <Flex gap="5" flexWrap="wrap">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Box key={i} flex="1" minW="240px">
              <Skeleton height="16px" width="80px" mb="2" />
              <Skeleton height="42px" borderRadius="xl" />
            </Box>
          ))}
        </Flex>
      </SettingsSection>
    )
  }

  if (!profile) return null

  return (
    <SettingsSection title="Profile" asForm onSubmit={handleSubmit(handleFormSubmit)}>
      {/* Avatar + Name Header */}
      <Flex align="center" gap="5" mb="6">
        <Flex
          align="center"
          justify="center"
          boxSize="80px"
          borderRadius="full"
          flexShrink={0}
          bg="action.primary"
          color="action.primary.text"
          fontFamily="heading"
          fontSize="1.5rem"
        >
          {getInitials(profile.name)}
        </Flex>
        <Box>
          <Text fontWeight="semibold" fontSize="1.25rem" color="text.primary">
            {profile.name}
          </Text>
          <Text fontSize="0.9rem" color="text.muted" mt="0.5">
            {profile.email}
          </Text>
        </Box>
      </Flex>

      {/* Form Grid */}
      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
        gap="5"
      >
        {/* Full Name */}
        <Field.Root invalid={!!errors.name} required>
          <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
            Full Name
          </Field.Label>
          <Input
            {...register('name')}
            bg="bg.glass"
            borderColor="border.default"
            borderRadius="xl"
            color="text.primary"
            data-testid="profile-name-input"
          />
          {errors.name && (
            <Field.ErrorText>{errors.name.message}</Field.ErrorText>
          )}
        </Field.Root>

        {/* Email (locked) */}
        <Field.Root>
          <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
            <Flex align="center" gap="1.5">
              Email
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--chakra-colors-text-muted)' }}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </Flex>
          </Field.Label>
          <Input
            {...register('email')}
            type="email"
            bg="bg.overlay"
            borderColor="border.default"
            borderRadius="xl"
            color="text.muted"
            readOnly
            cursor="not-allowed"
            data-testid="profile-email-input"
          />
        </Field.Root>

        {/* Phone */}
        <Field.Root invalid={!!errors.phone} required>
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
              data-testid="profile-phone-input"
            />
          </Flex>
          {errors.phone && (
            <Field.ErrorText>{errors.phone.message}</Field.ErrorText>
          )}
        </Field.Root>

        {/* Date of Birth */}
        <Field.Root invalid={!!errors.dateOfBirth} required>
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
            data-testid="profile-dob-input"
          />
          {errors.dateOfBirth && (
            <Field.ErrorText>{errors.dateOfBirth.message}</Field.ErrorText>
          )}
        </Field.Root>

        {/* Blood Group */}
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
              data-testid="profile-blood-group-select"
            >
              <option value="">Select</option>
              {BLOOD_GROUP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          {errors.bloodGroup && (
            <Field.ErrorText>{errors.bloodGroup.message}</Field.ErrorText>
          )}
        </Field.Root>

        {/* Gender */}
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
              data-testid="profile-gender-select"
            >
              <option value="">Select</option>
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          {errors.gender && (
            <Field.ErrorText>{errors.gender.message}</Field.ErrorText>
          )}
        </Field.Root>

        {/* City */}
        <Field.Root invalid={!!errors.city}>
          <Field.Label color="text.secondary" fontSize="0.875rem" fontWeight="medium">
            City
          </Field.Label>
          <Input
            {...register('city')}
            bg="bg.glass"
            borderColor="border.default"
            borderRadius="xl"
            color="text.primary"
            data-testid="profile-city-input"
          />
          {errors.city && (
            <Field.ErrorText>{errors.city.message}</Field.ErrorText>
          )}
        </Field.Root>
      </Box>

      {/* Aadhaar Verification Row */}
      <Flex
        align="center"
        justify="space-between"
        flexWrap="wrap"
        gap="3"
        mt="5"
        px="5"
        py="4"
        bg="bg.glass"
        backdropFilter="blur(16px)"
        borderWidth="1px"
        borderColor="border.subtle"
        borderRadius="xl"
      >
        <Flex align="center" gap="3" flexWrap="wrap">
          <Text fontWeight="medium" fontSize="0.95rem" color="text.primary">
            Aadhaar Verification
          </Text>
          {profile.aadhaarVerified ? (
            <Box
              as="span"
              display="inline-flex"
              alignItems="center"
              gap="1"
              bg="rgba(127, 178, 133, 0.15)"
              color="status.success"
              fontSize="0.8rem"
              fontWeight="semibold"
              px="3"
              py="1"
              borderRadius="full"
              data-testid="aadhaar-verified"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verified
            </Box>
          ) : (
            <Box
              as="span"
              display="inline-flex"
              alignItems="center"
              gap="1"
              bg="rgba(255, 179, 71, 0.15)"
              color="status.warning"
              fontSize="0.8rem"
              fontWeight="semibold"
              px="3"
              py="1"
              borderRadius="full"
              data-testid="aadhaar-not-verified"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Not Verified
            </Box>
          )}
        </Flex>
        {!profile.aadhaarVerified && (
          <Button
            variant="outline"
            size="sm"
            borderRadius="full"
            borderColor="action.primary"
            color="action.primary"
            _hover={{
              bg: 'action.primary',
              color: 'action.primary.text',
            }}
          >
            Verify Aadhaar
          </Button>
        )}
      </Flex>

      {/* Save Button */}
      <Flex justify="flex-end" mt="5">
        <Button
          type="submit"
          borderRadius="full"
          bg="action.primary"
          color="action.primary.text"
          px="7"
          _hover={{
            bg: 'action.primary.hover',
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 20px rgba(10, 77, 74, 0.15)',
          }}
          boxShadow="md"
          loading={isSaving}
          disabled={isSaving || !isDirty}
          data-testid="profile-save-button"
        >
          Save Changes
        </Button>
      </Flex>
    </SettingsSection>
  )
}
