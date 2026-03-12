'use client'

import { useCallback } from 'react'
import { Box, Flex, Skeleton, Text } from '@chakra-ui/react'
import { useNotificationPrefs, useUpdateNotificationPrefs, useRegisterDeviceToken } from '@/hooks/notifications'
import { requestPushPermission } from '@/lib/fcm'
import { SettingsSection } from './settings-section'
import { NotificationChannelGroup } from './notification-channel-group'
import { RegisteredDevicesSection } from './registered-devices-section'
import { CHANNEL_ITEMS, EVENT_ITEMS } from './notification-constants'
import type { NotificationChannel, NotificationEventType } from '@/types/notification'

function isPushBlocked(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied'
}

export function NotificationsSection() {
  const { data: prefs, isLoading } = useNotificationPrefs()
  const updatePrefs = useUpdateNotificationPrefs()
  const registerToken = useRegisterDeviceToken()

  const handleEventToggle = useCallback(
    async (eventType: NotificationEventType, channel: NotificationChannel, enabled: boolean) => {
      if (!prefs) return

      // Request push permission when enabling push for any event
      if (channel === 'push' && enabled && !prefs[eventType].push) {
        const result = await requestPushPermission()
        if (result.status !== 'granted') return
        registerToken.mutate({ deviceToken: result.token, platform: 'web' })
      }

      // Update the specific event's channel preference
      updatePrefs.mutate({
        reportUploaded: eventType === 'reportUploaded'
          ? { ...prefs.reportUploaded, [channel]: enabled }
          : prefs.reportUploaded,
        accessGranted: eventType === 'accessGranted'
          ? { ...prefs.accessGranted, [channel]: enabled }
          : prefs.accessGranted,
        emergencyAccess: eventType === 'emergencyAccess'
          ? { ...prefs.emergencyAccess, [channel]: enabled }
          : prefs.emergencyAccess,
      })
    },
    [prefs, updatePrefs, registerToken],
  )

  return (
    <SettingsSection title="Notifications">
      {isLoading ? (
        <Box data-testid="notifications-loading">
          {[0, 1, 2].map((i) => (
            <Flex
              key={i}
              align="center"
              justify="space-between"
              py="4"
              borderTopWidth={i > 0 ? '1px' : '0'}
              borderColor="border.subtle"
            >
              <Box flex="1" mr="4">
                <Skeleton height="18px" width="200px" borderRadius="md" />
                <Skeleton height="14px" width="300px" mt="2" borderRadius="md" />
              </Box>
              <Skeleton height="24px" width="44px" borderRadius="full" />
            </Flex>
          ))}
        </Box>
      ) : prefs ? (
        <>
          {CHANNEL_ITEMS.map((meta, i) => (
            <NotificationChannelGroup
              key={meta.channel}
              channelMeta={meta}
              eventItems={EVENT_ITEMS}
              prefs={prefs}
              showBorder={i > 0}
              onEventToggle={handleEventToggle}
            />
          ))}
          {isPushBlocked() && (
            <Text
              data-testid="push-blocked-hint"
              fontSize="0.8rem"
              color="orange.fg"
              mt="2"
            >
              Push notifications are blocked. Enable them in your browser settings.
            </Text>
          )}
          <RegisteredDevicesSection />
        </>
      ) : null}
    </SettingsSection>
  )
}
