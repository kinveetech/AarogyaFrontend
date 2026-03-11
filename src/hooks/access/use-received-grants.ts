import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { staleTimes } from '@/lib/api/stale-times'
import type { AccessGrant } from '@/types/access'

export function useReceivedGrants(enabled = true) {
  return useQuery({
    queryKey: queryKeys.accessGrants.received(),
    queryFn: () => apiFetch<AccessGrant[]>('/v1/access-grants/received'),
    staleTime: staleTimes.accessGrants,
    enabled,
  })
}
