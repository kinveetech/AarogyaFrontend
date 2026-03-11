import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type { ExtractionStatusResponse } from '@/types/reports'

export function useTriggerExtraction(reportId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiFetch<ExtractionStatusResponse>(
        `/v1/reports/${reportId}/extract`,
        { method: 'POST' },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(
        queryKeys.reports.extraction(reportId),
        data,
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.reports.extraction(reportId),
      })
    },
  })
}
