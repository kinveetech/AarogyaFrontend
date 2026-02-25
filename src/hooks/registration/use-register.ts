import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type {
  RegisterUserRequest,
  RegisterUserResponse,
} from '@/types/registration'

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: RegisterUserRequest) =>
      apiFetch<RegisterUserResponse>('/v1/users/register', {
        method: 'POST',
        body: request,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.registration.all })
    },
  })
}
