import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys, type ReportListParams } from '@/lib/api/query-keys'
import { staleTimes } from '@/lib/api/stale-times'
import type { ReportListResponse } from '@/types/reports'

function buildQueryString(params?: ReportListParams): string {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  if (params.page !== undefined) searchParams.set('page', String(params.page))
  if (params.pageSize !== undefined) searchParams.set('pageSize', String(params.pageSize))
  if (params.search) searchParams.set('search', params.search)
  if (params.category) searchParams.set('category', params.category)
  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

export function useReports(params?: ReportListParams) {
  return useQuery({
    queryKey: queryKeys.reports.list(params),
    queryFn: () =>
      apiFetch<ReportListResponse>(`/v1/reports${buildQueryString(params)}`),
    staleTime: staleTimes.reports,
  })
}
