import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { DeviceTokenRequest } from '@/types/notification'

export function useRegisterDeviceToken() {
  return useMutation({
    mutationFn: (request: DeviceTokenRequest) =>
      apiFetch<void>('/v1/notifications/devices', {
        method: 'POST',
        body: request,
      }),
  })
}
