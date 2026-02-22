import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type { ReportListResponse } from '@/types/reports'

export function useDeleteReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/v1/reports/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.reports.all })

      const previousLists = queryClient.getQueriesData<ReportListResponse>({
        queryKey: queryKeys.reports.all,
      })

      queryClient.setQueriesData<ReportListResponse>(
        { queryKey: queryKeys.reports.all },
        (old) => {
          if (!old?.items) return old
          return {
            ...old,
            items: old.items.filter((r) => r.id !== id),
            totalCount: old.totalCount - 1,
          }
        },
      )

      return { previousLists }
    },
    onError: (_err, _id, context) => {
      if (context?.previousLists) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
    },
  })
}
