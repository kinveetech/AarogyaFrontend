'use client'

import { useCallback } from 'react'
import { Box, Flex, Skeleton, Text } from '@chakra-ui/react'
import { useNotificationPrefs, useUpdateNotificationPrefs, useRegisterDeviceToken } from '@/hooks/notifications'
import { requestPushPermission } from '@/lib/fcm'
import { SettingsSection } from './settings-section'
import { NotificationChannelGroup } from './notification-channel-group'
import { CHANNEL_ITEMS, CATEGORY_ITEMS } from './notification-constants'
import type { NotificationChannel, NotificationCategory, ChannelPreferences } from '@/types/notification'

const ALL_CATEGORIES_OFF: Record<NotificationCategory, boolean> = {
  'report-processed': false,
  'access-activity': false,
  'emergency-alerts': false,
  'system-updates': false,
}

function isPushBlocked(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied'
}

export function NotificationsSection() {
  const { data: prefs, isLoading } = useNotificationPrefs()
  const updatePrefs = useUpdateNotificationPrefs()
  const registerToken = useRegisterDeviceToken()

  const mutatePrefs = useCallback(
    (channel: NotificationChannel, updated: ChannelPreferences) => {
      if (!prefs) return
      updatePrefs.mutate({
        push: channel === 'push' ? updated : prefs.push,
        email: channel === 'email' ? updated : prefs.email,
        sms: channel === 'sms' ? updated : prefs.sms,
      })
    },
    [prefs, updatePrefs],
  )

  const handleChannelToggle = useCallback(
    async (channel: NotificationChannel, enabled: boolean) => {
      if (!prefs) return

      if (channel === 'push' && enabled) {
        const result = await requestPushPermission()
        if (result.status !== 'granted') return
        registerToken.mutate({ deviceToken: result.token, platform: 'web' })
      }

      const currentChannel = prefs[channel]
      const updatedChannel: ChannelPreferences = enabled
        ? { enabled: true, categories: currentChannel.categories }
        : { enabled: false, categories: ALL_CATEGORIES_OFF }

      mutatePrefs(channel, updatedChannel)
    },
    [prefs, mutatePrefs, registerToken],
  )

  const handleCategoryToggle = useCallback(
    (channel: NotificationChannel, category: NotificationCategory, enabled: boolean) => {
      if (!prefs) return
      const currentChannel = prefs[channel]
      mutatePrefs(channel, {
        ...currentChannel,
        categories: { ...currentChannel.categories, [category]: enabled },
      })
    },
    [prefs, mutatePrefs],
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
              categoryItems={CATEGORY_ITEMS}
              prefs={prefs[meta.channel]}
              showBorder={i > 0}
              onChannelToggle={(enabled) => handleChannelToggle(meta.channel, enabled)}
              onCategoryToggle={(category, enabled) =>
                handleCategoryToggle(meta.channel, category, enabled)
              }
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
        </>
      ) : null}
    </SettingsSection>
  )
}
