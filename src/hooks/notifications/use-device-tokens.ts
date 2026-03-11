import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { staleTimes } from '@/lib/api/stale-times'
import type { RegisteredDevice } from '@/types/notification'

export function useDeviceTokens() {
  return useQuery({
    queryKey: queryKeys.notifications.devices(),
    queryFn: () => apiFetch<RegisteredDevice[]>('/v1/notifications/devices'),
    staleTime: staleTimes.notifications,
  })
}
