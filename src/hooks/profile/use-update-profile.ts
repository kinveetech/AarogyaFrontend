import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { toaster } from '@/components/ui/toaster'
import type { Profile, UpdateProfileRequest } from '@/types/profile'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UpdateProfileRequest) =>
      apiFetch<Profile>('/v1/users/me', {
        method: 'PUT',
        body: request,
      }),
    onMutate: async (request) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.all })

      const previousProfile = queryClient.getQueryData<Profile>(
        queryKeys.profile.me(),
      )

      queryClient.setQueryData<Profile>(queryKeys.profile.me(), (old) => {
        if (!old) return old
        return {
          ...old,
          ...request,
        }
      })

      return { previousProfile }
    },
    onSuccess: () => {
      toaster.create({
        type: 'success',
        title: 'Profile updated',
      })
    },
    onError: (_err, _request, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(queryKeys.profile.me(), context.previousProfile)
      }
      toaster.create({
        type: 'error',
        title: 'Could not save profile',
        description: 'Something went wrong while saving your profile. Please try again.',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
    },
  })
}
