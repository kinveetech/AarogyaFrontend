import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { staleTimes } from '@/lib/api/stale-times'
import type { ReportDetail } from '@/types/reports'

export function useReport(id: string) {
  return useQuery({
    queryKey: queryKeys.reports.detail(id),
    queryFn: () => apiFetch<ReportDetail>(`/v1/reports/${id}`),
    staleTime: staleTimes.reports,
    enabled: !!id,
  })
}
