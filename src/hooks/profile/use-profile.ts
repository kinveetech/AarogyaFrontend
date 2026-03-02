import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { staleTimes } from '@/lib/api/stale-times'
import type { Profile } from '@/types/profile'

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: () => apiFetch<Profile>('/v1/users/me'),
    staleTime: staleTimes.profile,
  })
}
