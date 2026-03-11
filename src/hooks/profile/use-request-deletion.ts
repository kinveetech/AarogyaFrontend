import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { DeletionResponse } from '@/types/deletion'

export function useRequestDeletion() {
  return useMutation({
    mutationFn: () =>
      apiFetch<DeletionResponse>('/v1/users/me/deletion', {
        method: 'POST',
      }),
  })
}
