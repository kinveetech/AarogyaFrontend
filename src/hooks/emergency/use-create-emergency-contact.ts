import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type {
  EmergencyContact,
  EmergencyContactListResponse,
  CreateEmergencyContactRequest,
} from '@/types/emergency'

export function useCreateEmergencyContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateEmergencyContactRequest) =>
      apiFetch<EmergencyContact>('/v1/emergency-contacts', {
        method: 'POST',
        body: request,
      }),
    onMutate: async (request) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.emergencyContacts.all })

      const previousLists = queryClient.getQueriesData<EmergencyContactListResponse>(
        { queryKey: queryKeys.emergencyContacts.all },
      )

      queryClient.setQueriesData<EmergencyContactListResponse>(
        { queryKey: queryKeys.emergencyContacts.all },
        (old) => {
          if (!old?.items) return old
          const optimistic: EmergencyContact = {
            id: `optimistic-${Date.now()}`,
            name: request.name,
            phone: request.phone,
            relationship: request.relationship,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          return { ...old, items: [...old.items, optimistic] }
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
