import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type {
  Profile,
  VerifyAadhaarRequest,
  AadhaarVerificationResponse,
} from '@/types/profile'

export function useVerifyAadhaar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: VerifyAadhaarRequest) =>
      apiFetch<AadhaarVerificationResponse>('/v1/users/me/aadhaar/verify', {
        method: 'POST',
        body: request,
      }),
    onSuccess: () => {
      queryClient.setQueryData<Profile>(queryKeys.profile.me(), (old) => {
        if (!old) return old
        return {
          ...old,
          aadhaarVerified: true,
        }
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
    },
  })
}
