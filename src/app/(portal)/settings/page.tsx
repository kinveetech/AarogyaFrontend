'use client'

import { useCallback } from 'react'
import { Box, VStack } from '@chakra-ui/react'
import { useProfile, useUpdateProfile } from '@/hooks/profile'
import {
  ProfileSection,
  ConsentsPlaceholder,
  NotificationsPlaceholder,
  AccountSection,
} from '@/components/settings'
import type { ProfileUpdate } from '@/lib/schemas/profileUpdate'

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()

  const handleSave = useCallback(
    (data: ProfileUpdate) => {
      updateProfile.mutate({
        name: data.name,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        bloodGroup: data.bloodGroup || null,
        gender: data.gender || null,
        city: data.city || null,
      })
    },
    [updateProfile],
  )

  return (
    <Box maxW="820px" mx="auto" px={{ base: '4', md: '6' }} py="6">
      <VStack gap="8" align="stretch">
        <ProfileSection
          profile={profile}
          isLoading={isLoading}
          isSaving={updateProfile.isPending}
          onSave={handleSave}
        />
        <ConsentsPlaceholder />
        <NotificationsPlaceholder />
        <AccountSection />
      </VStack>
    </Box>
  )
}
