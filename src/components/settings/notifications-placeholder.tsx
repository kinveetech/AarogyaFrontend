'use client'

import { Text } from '@chakra-ui/react'
import { SettingsSection } from './settings-section'
import { DisabledToggleRow } from './disabled-toggle-row'

const NOTIFICATION_ITEMS = [
  { label: 'Push notifications' },
  { label: 'Email notifications' },
  { label: 'SMS notifications' },
]

export function NotificationsPlaceholder() {
  return (
    <SettingsSection title="Notifications">
      {NOTIFICATION_ITEMS.map((item, i) => (
        <DisabledToggleRow
          key={item.label}
          label={item.label}
          showBorder={i > 0}
        />
      ))}
      <Text fontFamily="mono" fontSize="0.75rem" color="text.muted" mt="2">
        Coming soon
      </Text>
    </SettingsSection>
  )
}
