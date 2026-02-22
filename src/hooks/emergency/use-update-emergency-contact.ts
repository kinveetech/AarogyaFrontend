import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type {
  EmergencyContact,
  EmergencyContactListResponse,
  UpdateEmergencyContactRequest,
} from '@/types/emergency'

export function useUpdateEmergencyContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...request }: UpdateEmergencyContactRequest & { id: string }) =>
      apiFetch<EmergencyContact>(`/v1/emergency-contacts/${id}`, {
        method: 'PUT',
        body: request,
      }),
    onMutate: async ({ id, ...request }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.emergencyContacts.all })

      const previousLists = queryClient.getQueriesData<EmergencyContactListResponse>(
        { queryKey: queryKeys.emergencyContacts.all },
      )

      queryClient.setQueriesData<EmergencyContactListResponse>(
        { queryKey: queryKeys.emergencyContacts.all },
        (old) => {
          if (!old?.items) return old
          return {
            ...old,
            items: old.items.map((c) =>
              c.id === id
                ? { ...c, ...request, updatedAt: new Date().toISOString() }
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
      queryClient.invalidateQueries({ queryKey: queryKeys.emergencyContacts.all })
    },
  })
}
