import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { staleTimes } from '@/lib/api/stale-times'
import type { ConsentListResponse } from '@/types/consent'

export function useConsents() {
  return useQuery({
    queryKey: queryKeys.consents.list(),
    queryFn: () => apiFetch<ConsentListResponse>('/v1/consents'),
    staleTime: staleTimes.consents,
  })
}
