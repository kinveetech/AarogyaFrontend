import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type { EmergencyContactListResponse } from '@/types/emergency'

export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/v1/emergency-contacts/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
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
            items: old.items.filter((c) => c.id !== id),
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
      queryClient.invalidateQueries({ queryKey: queryKeys.emergencyContacts.all })
    },
  })
}
