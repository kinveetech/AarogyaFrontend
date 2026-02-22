import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { staleTimes } from '@/lib/api/stale-times'
import type { AccessGrantListResponse } from '@/types/access'

export function useAccessGrants() {
  return useQuery({
    queryKey: queryKeys.accessGrants.list(),
    queryFn: () => apiFetch<AccessGrantListResponse>('/v1/access-grants'),
    staleTime: staleTimes.accessGrants,
  })
}
