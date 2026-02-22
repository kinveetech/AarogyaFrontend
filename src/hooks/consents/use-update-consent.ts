import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type {
  Consent,
  ConsentListResponse,
  ConsentPurpose,
  UpdateConsentRequest,
} from '@/types/consent'

export function useUpdateConsent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ purpose, ...request }: UpdateConsentRequest & { purpose: ConsentPurpose }) =>
      apiFetch<Consent>(`/v1/consents/${purpose}`, {
        method: 'PUT',
        body: request,
      }),
    onMutate: async ({ purpose, granted }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.consents.all })

      const previousLists = queryClient.getQueriesData<ConsentListResponse>(
        { queryKey: queryKeys.consents.all },
      )

      queryClient.setQueriesData<ConsentListResponse>(
        { queryKey: queryKeys.consents.all },
        (old) => {
          if (!old?.items) return old
          return {
            ...old,
            items: old.items.map((c) =>
              c.purpose === purpose
                ? { ...c, granted, updatedAt: new Date().toISOString() }
                : c,
            ),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.consents.all })
    },
  })
}
