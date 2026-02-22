import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type { CreateReportRequest, Report } from '@/types/reports'

export function useCreateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateReportRequest) =>
      apiFetch<Report>('/v1/reports', {
        method: 'POST',
        body: request,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
    },
  })
}
