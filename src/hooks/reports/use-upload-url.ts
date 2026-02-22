import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { UploadUrlRequest, UploadUrlResponse } from '@/types/reports'

export function useUploadUrl() {
  return useMutation({
    mutationFn: (request: UploadUrlRequest) =>
      apiFetch<UploadUrlResponse>('/v1/reports/upload-url', {
        method: 'POST',
        body: request,
      }),
  })
}
