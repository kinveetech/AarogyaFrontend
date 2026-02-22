'use client'

import { Text } from '@chakra-ui/react'
import { SettingsSection } from './settings-section'
import { DisabledToggleRow } from './disabled-toggle-row'

const CONSENT_ITEMS = [
  {
    label: 'Analytics',
    description: 'Allow usage data collection to improve the app',
  },
  {
    label: 'Research',
    description: 'Allow anonymized data for medical research',
  },
  {
    label: 'Marketing',
    description: 'Receive product updates and health tips',
  },
  {
    label: 'Third-party Sharing',
    description: 'Allow data sharing with partner services',
  },
]

export function ConsentsPlaceholder() {
  return (
    <SettingsSection title="Data Consents">
      {CONSENT_ITEMS.map((item, i) => (
        <DisabledToggleRow
          key={item.label}
          label={item.label}
          description={item.description}
          showBorder={i > 0}
        />
      ))}
      <Text fontFamily="mono" fontSize="0.75rem" color="text.muted" mt="2">
        Coming soon
      </Text>
    </SettingsSection>
  )
}
