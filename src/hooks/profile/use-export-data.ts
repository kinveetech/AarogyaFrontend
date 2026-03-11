import { useMutation } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import type { DataExportResponse } from '@/types/data-export'

export function useExportData() {
  return useMutation({
    mutationFn: () =>
      apiFetch<DataExportResponse>('/v1/users/me/export', {
        method: 'GET',
      }),
  })
}
