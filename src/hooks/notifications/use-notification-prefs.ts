import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { staleTimes } from '@/lib/api/stale-times'
import type { NotificationPreferences } from '@/types/notification'

export function useNotificationPrefs() {
  return useQuery({
    queryKey: queryKeys.notifications.prefs(),
    queryFn: () => apiFetch<NotificationPreferences>('/v1/notifications/preferences'),
    staleTime: staleTimes.notifications,
  })
}
