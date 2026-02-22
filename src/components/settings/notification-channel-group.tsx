'use client'

import { Box, Flex, Switch, Text } from '@chakra-ui/react'
import type { ChannelMeta, CategoryMeta } from './notification-constants'
import type { ChannelPreferences, NotificationCategory } from '@/types/notification'

export interface NotificationChannelGroupProps {
  channelMeta: ChannelMeta
  categoryItems: CategoryMeta[]
  prefs: ChannelPreferences
  showBorder: boolean
  onChannelToggle: (enabled: boolean) => void
  onCategoryToggle: (category: NotificationCategory, enabled: boolean) => void
}

export function NotificationChannelGroup({
  channelMeta,
  categoryItems,
  prefs,
  showBorder,
  onChannelToggle,
  onCategoryToggle,
}: NotificationChannelGroupProps) {
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
        <Switch.Root
          data-testid={`notification-switch-${channelMeta.channel}`}
          checked={prefs.enabled}
          onCheckedChange={(details) => onChannelToggle(details.checked)}
          colorPalette="teal"
        >
          <Switch.HiddenInput />
          <Switch.Control>
            <Switch.Thumb />
          </Switch.Control>
        </Switch.Root>
      </Flex>

      <Box pl="4" mt="3">
        {categoryItems.map((catMeta) => (
          <Flex
            key={catMeta.category}
            data-testid={`notification-category-${channelMeta.channel}-${catMeta.category}`}
            align="center"
            justify="space-between"
            py="2.5"
            opacity={prefs.enabled ? 1 : 0.4}
          >
            <Box flex="1" mr="4">
              <Text fontSize="0.875rem" color="text.primary">
                {catMeta.label}
              </Text>
              <Text fontSize="0.75rem" color="text.muted">
                {catMeta.description}
              </Text>
            </Box>
            <Switch.Root
              data-testid={`notification-category-switch-${channelMeta.channel}-${catMeta.category}`}
              checked={prefs.categories[catMeta.category]}
              onCheckedChange={(details) => onCategoryToggle(catMeta.category, details.checked)}
              colorPalette="teal"
              disabled={!prefs.enabled}
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
