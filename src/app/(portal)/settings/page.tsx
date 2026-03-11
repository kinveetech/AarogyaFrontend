'use client'

import { useCallback } from 'react'
import { Box, Heading, VStack } from '@chakra-ui/react'
import { useProfile, useUpdateProfile } from '@/hooks/profile'
import {
  ProfileSection,
  ConsentsSection,
  NotificationsSection,
  DataExportSection,
  AccountSection,
  DeletionSection,
} from '@/components/settings'
import type { ProfileUpdate } from '@/lib/schemas/profileUpdate'

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  const handleSave = useCallback(
    (data: ProfileUpdate) => {
      updateProfile.mutate({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        bloodGroup: data.bloodGroup || null,
        address: data.address || null,
      })
    },
    [updateProfile],
  )

  return (
    <Box maxW="820px" mx="auto" px={{ base: '4', md: '6' }} py="6">
      <Heading
        as="h1"
        fontFamily="heading"
        fontSize={{ base: '1.4rem', md: '1.75rem' }}
        color="text.primary"
        mb="6"
      >
        Settings
      </Heading>
      <VStack gap="8" align="stretch">
        <ProfileSection
          profile={profile}
          isLoading={isLoading}
          isSaving={updateProfile.isPending}
          onSave={handleSave}
        />
        <ConsentsSection />
        <NotificationsSection />
        <DataExportSection />
        <AccountSection />
        <DeletionSection />
      </VStack>
    </Box>
  )
}
