import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type { AccessGrantListResponse } from '@/types/access'

export function useRevokeGrant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/v1/access-grants/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.accessGrants.all })

      const previousLists = queryClient.getQueriesData<AccessGrantListResponse>(
        { queryKey: queryKeys.accessGrants.all },
      )

      queryClient.setQueriesData<AccessGrantListResponse>(
        { queryKey: queryKeys.accessGrants.all },
        (old) => {
          if (!old?.items) return old
          return {
            ...old,
            items: old.items.filter((g) => g.id !== id),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.accessGrants.all })
    },
  })
}
