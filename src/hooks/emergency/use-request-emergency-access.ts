import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type {
  CreateEmergencyAccessRequest,
  EmergencyAccessResponse,
} from '@/types/emergency'

export function useRequestEmergencyAccess() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateEmergencyAccessRequest) =>
      apiFetch<EmergencyAccessResponse>('/v1/emergency-access/requests', {
        method: 'POST',
        body: request,
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.emergencyAccess.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.accessGrants.all })
    },
  })
}
