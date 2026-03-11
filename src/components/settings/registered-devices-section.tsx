'use client'

import { useCallback, useState } from 'react'
import { Box, Flex, IconButton, Skeleton, Text } from '@chakra-ui/react'
import { useDeviceTokens, useDeregisterDevice } from '@/hooks/notifications'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { RegisteredDevice } from '@/types/notification'

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}

function DevicesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

function formatPlatform(platform: RegisteredDevice['platform']): string {
  switch (platform) {
    case 'web': return 'Web'
    case 'ios': return 'iOS'
    case 'android': return 'Android'
    default: return platform
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function maskToken(token: string): string {
  if (token.length <= 8) return token
  return `${token.slice(0, 4)}...${token.slice(-4)}`
}

export function RegisteredDevicesSection() {
  const { data: devices, isLoading } = useDeviceTokens()
  const deregister = useDeregisterDevice()

  const [pendingToken, setPendingToken] = useState<string | null>(null)
  const [pendingDeviceName, setPendingDeviceName] = useState<string>('')

  const handleRemoveClick = useCallback((device: RegisteredDevice) => {
    setPendingToken(device.deviceToken)
    setPendingDeviceName(device.deviceName ?? maskToken(device.deviceToken))
  }, [])

  const handleConfirmRemove = useCallback(() => {
    if (!pendingToken) return
    deregister.mutate(pendingToken)
    setPendingToken(null)
    setPendingDeviceName('')
  }, [pendingToken, deregister])

  const handleCancelRemove = useCallback(() => {
    setPendingToken(null)
    setPendingDeviceName('')
  }, [])

  if (isLoading) {
    return (
      <Box data-testid="devices-loading" mt="6" pt="6" borderTopWidth="1px" borderColor="border.subtle">
        <Text fontWeight="medium" fontSize="0.95rem" color="text.primary" mb="3">
          Registered Devices
        </Text>
        {[0, 1].map((i) => (
          <Flex key={i} align="center" justify="space-between" py="3">
            <Box flex="1">
              <Skeleton height="16px" width="180px" borderRadius="md" />
              <Skeleton height="12px" width="120px" mt="1.5" borderRadius="md" />
            </Box>
            <Skeleton height="32px" width="32px" borderRadius="full" />
          </Flex>
        ))}
      </Box>
    )
  }

  return (
    <Box data-testid="registered-devices-section" mt="6" pt="6" borderTopWidth="1px" borderColor="border.subtle">
      <Flex align="center" gap="2" mb="3">
        <Box color="text.muted">
          <DevicesIcon />
        </Box>
        <Text fontWeight="medium" fontSize="0.95rem" color="text.primary">
          Registered Devices
        </Text>
      </Flex>

      {!Array.isArray(devices) || devices.length === 0 ? (
        <Box
          data-testid="devices-empty"
          py="6"
          textAlign="center"
          borderRadius="lg"
          border="1px dashed"
          borderColor="border.default"
        >
          <Text fontSize="sm" color="text.muted">
            No devices registered for push notifications.
          </Text>
        </Box>
      ) : (
        <Box data-testid="devices-list">
          {devices.map((device) => (
            <Flex
              key={device.deviceToken}
              data-testid={`device-row-${device.deviceToken}`}
              align="center"
              justify="space-between"
              py="3"
              borderBottomWidth="1px"
              borderColor="border.subtle"
              _last={{ borderBottomWidth: 0 }}
            >
              <Box flex="1" mr="3">
                <Text fontSize="0.875rem" fontWeight="medium" color="text.primary">
                  {device.deviceName ?? maskToken(device.deviceToken)}
                </Text>
                <Flex gap="2" mt="0.5" flexWrap="wrap">
                  <Text fontSize="0.75rem" color="text.muted" fontFamily="mono">
                    {maskToken(device.deviceToken)}
                  </Text>
                  <Text fontSize="0.75rem" color="text.muted">
                    {formatPlatform(device.platform)}
                  </Text>
                  <Text fontSize="0.75rem" color="text.muted">
                    {formatDate(device.registeredAt)}
                  </Text>
                </Flex>
              </Box>
              <IconButton
                data-testid={`device-remove-${device.deviceToken}`}
                aria-label={`Remove device ${device.deviceName ?? device.deviceToken}`}
                variant="ghost"
                borderRadius="full"
                size="sm"
                color="text.muted"
                onClick={() => handleRemoveClick(device)}
                css={{ _hover: { color: 'coral.500' } }}
              >
                <TrashIcon />
              </IconButton>
            </Flex>
          ))}
        </Box>
      )}

      <ConfirmDialog
        open={pendingToken !== null}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        title="Remove Device"
        message={`Are you sure you want to remove "${pendingDeviceName}" from push notifications? You can re-register it later.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        destructive
        loading={deregister.isPending}
      />
    </Box>
  )
}
