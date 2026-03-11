import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { staleTimes } from '@/lib/api/stale-times'
import type { ExtractionStatusResponse } from '@/types/reports'

export function useExtractionStatus(reportId: string) {
  return useQuery({
    queryKey: queryKeys.reports.extraction(reportId),
    queryFn: () =>
      apiFetch<ExtractionStatusResponse>(
        `/v1/reports/${reportId}/extraction`,
      ),
    staleTime: staleTimes.extraction,
    enabled: !!reportId,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'pending' || status === 'processing') {
        return 3000
      }
      return false
    },
  })
}
