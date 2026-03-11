import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { staleTimes } from '@/lib/api/stale-times'
import type { EmergencyAccessAuditResponse } from '@/types/emergency'

export interface UseEmergencyAccessAuditOptions {
  page?: number
  pageSize?: number
}

export function useEmergencyAccessAudit(options: UseEmergencyAccessAuditOptions = {}) {
  const { page = 1, pageSize = 20 } = options

  return useQuery({
    queryKey: queryKeys.emergencyAccess.audit(page),
    queryFn: () =>
      apiFetch<EmergencyAccessAuditResponse>(
        `/v1/emergency-access/audit?page=${page}&pageSize=${pageSize}`,
      ),
    staleTime: staleTimes.emergencyAccess,
  })
}
