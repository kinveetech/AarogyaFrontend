import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type {
  AccessGrant,
  AccessGrantListResponse,
  CreateAccessGrantRequest,
} from '@/types/access'

export function useCreateGrant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateAccessGrantRequest) =>
      apiFetch<AccessGrant>('/v1/access-grants', {
        method: 'POST',
        body: request,
      }),
    onMutate: async (request) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.accessGrants.all })

      const previousLists = queryClient.getQueriesData<AccessGrantListResponse>(
        { queryKey: queryKeys.accessGrants.all },
      )

      queryClient.setQueriesData<AccessGrantListResponse>(
        { queryKey: queryKeys.accessGrants.all },
        (old) => {
          if (!old?.items) return old
          const optimisticGrant: AccessGrant = {
            id: `optimistic-${Date.now()}`,
            doctorId: request.doctorId,
            doctorName: request.doctorName,
            reportIds: request.reportIds,
            expiresAt: request.expiresAt,
            createdAt: new Date().toISOString(),
          }
          return {
            ...old,
            items: [optimisticGrant, ...old.items],
            totalCount: old.totalCount + 1,
          }
        },
      )

      return { previousLists }
    },
    onError: (_err, _request, context) => {
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
