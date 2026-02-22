import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { staleTimes } from '@/lib/api/stale-times'
import type { EmergencyContactListResponse } from '@/types/emergency'

export function useEmergencyContacts() {
  return useQuery({
    queryKey: queryKeys.emergencyContacts.list(),
    queryFn: () => apiFetch<EmergencyContactListResponse>('/v1/emergency-contacts'),
    staleTime: staleTimes.emergencyContacts,
  })
}
