'use client'

import { Box, Flex, Switch, Text } from '@chakra-ui/react'
import type { ChannelMeta, EventMeta } from './notification-constants'
import type { NotificationChannel, NotificationEventType, NotificationPreferences } from '@/types/notification'

export interface NotificationChannelGroupProps {
  channelMeta: ChannelMeta
  eventItems: EventMeta[]
  prefs: NotificationPreferences
  showBorder: boolean
  onEventToggle: (eventType: NotificationEventType, channel: NotificationChannel, enabled: boolean) => void
}

export function NotificationChannelGroup({
  channelMeta,
  eventItems,
  prefs,
  showBorder,
  onEventToggle,
}: NotificationChannelGroupProps) {
  // Check if any event is enabled for this channel
  const isChannelEnabled = eventItems.some((event) => prefs[event.eventType][channelMeta.channel])

  return (
    <Box
      data-testid={`notification-channel-${channelMeta.channel}`}
      py="4"
      borderTopWidth={showBorder ? '1px' : '0'}
      borderColor="border.subtle"
    >
      <Flex align="center" justify="space-between">
        <Box flex="1" mr="4">
          <Text fontWeight="medium" fontSize="0.95rem" color="text.primary">
            {channelMeta.label}
          </Text>
          <Text fontSize="0.875rem" color="text.muted" mt="0.5">
            {channelMeta.description}
          </Text>
        </Box>
        <Box
          data-testid={`notification-switch-${channelMeta.channel}`}
          height="24px"
          width="44px"
          borderRadius="full"
          bg={isChannelEnabled ? 'action.primary' : 'bg.muted'}
          opacity={isChannelEnabled ? 1 : 0.5}
        />
      </Flex>

      <Box pl="4" mt="3">
        {eventItems.map((eventMeta) => (
          <Flex
            key={eventMeta.eventType}
            data-testid={`notification-event-${channelMeta.channel}-${eventMeta.eventType}`}
            align="center"
            justify="space-between"
            py="2.5"
          >
            <Box flex="1" mr="4">
              <Text fontSize="0.875rem" color="text.primary">
                {eventMeta.label}
              </Text>
              <Text fontSize="0.75rem" color="text.muted">
                {eventMeta.description}
              </Text>
            </Box>
            <Switch.Root
              data-testid={`notification-event-switch-${channelMeta.channel}-${eventMeta.eventType}`}
              checked={prefs[eventMeta.eventType][channelMeta.channel]}
              onCheckedChange={(details) => onEventToggle(eventMeta.eventType, channelMeta.channel, details.checked)}
              colorPalette="teal"
            >
              <Switch.HiddenInput />
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch.Root>
          </Flex>
        ))}
      </Box>
    </Box>
  )
}
