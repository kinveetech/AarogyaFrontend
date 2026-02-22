import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { DownloadUrlRequest, DownloadUrlResponse } from '@/types/reports'

export function useDownloadUrl() {
  return useMutation({
    mutationFn: (request: DownloadUrlRequest) =>
      apiFetch<DownloadUrlResponse>('/v1/reports/download-url', {
        method: 'POST',
        body: request,
      }),
  })
}
