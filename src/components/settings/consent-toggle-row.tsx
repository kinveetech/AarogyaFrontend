'use client'

import { Box, Flex, Switch, Text, Tooltip } from '@chakra-ui/react'
import type { ConsentMeta } from './consent-constants'

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

export interface ConsentToggleRowProps {
  meta: ConsentMeta
  granted: boolean
  updatedAt: string
  showBorder: boolean
  onToggle: (granted: boolean) => void
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ConsentToggleRow({
  meta,
  granted,
  updatedAt,
  showBorder,
  onToggle,
}: ConsentToggleRowProps) {
  return (
    <Flex
      data-testid={`consent-row-${meta.purpose}`}
      align="center"
      justify="space-between"
      py="4"
      borderTopWidth={showBorder ? '1px' : '0'}
      borderColor="border.subtle"
    >
      <Box flex="1" mr="4">
        <Flex align="center" gap="1.5">
          <Text fontWeight="medium" fontSize="0.95rem" color="text.primary">
            {meta.label}
          </Text>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                style={{ display: 'inline-flex', cursor: 'help', color: 'inherit', background: 'none', border: 'none', padding: 0 }}
                aria-label={`Info about ${meta.label}`}
                data-testid={`consent-info-${meta.purpose}`}
              >
                <Box color="text.muted">
                  <InfoIcon />
                </Box>
              </button>
            </Tooltip.Trigger>
            <Tooltip.Positioner>
              <Tooltip.Content maxW="280px" fontSize="xs">
                {meta.tooltip}
              </Tooltip.Content>
            </Tooltip.Positioner>
          </Tooltip.Root>
        </Flex>
        <Text fontSize="0.875rem" color="text.muted" mt="0.5">
          {meta.description}
        </Text>
        <Flex align="center" gap="2" mt="1">
          <Box
            data-testid={`consent-status-${meta.purpose}`}
            px="2"
            py="0.5"
            borderRadius="full"
            fontSize="0.7rem"
            fontWeight="semibold"
            letterSpacing="0.02em"
            bg={granted ? 'green.subtle' : 'red.subtle'}
            color={granted ? 'green.fg' : 'red.fg'}
          >
            {granted ? 'Granted' : 'Revoked'}
          </Box>
          <Text fontSize="0.75rem" color="text.muted" fontFamily="mono">
            Updated {formatDate(updatedAt)}
          </Text>
        </Flex>
      </Box>
      <Switch.Root
        data-testid={`consent-switch-${meta.purpose}`}
        checked={granted}
        onCheckedChange={(details) => onToggle(details.checked)}
        colorPalette="teal"
      >
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Root>
    </Flex>
  )
}
