import { useMutation } from '@tanstack/react-query'
import { apiFetch, ApiError } from '@/lib/api/client'
import type {
  VerifiedDownloadUrlRequest,
  VerifiedDownloadUrlResponse,
  DownloadUrlRequest,
  DownloadUrlResponse,
} from '@/types/reports'

export interface VerifiedDownloadResult {
  downloadUrl: string
  checksumVerified: boolean
  usedFallback: boolean
}

async function fetchVerifiedDownloadUrl(
  request: VerifiedDownloadUrlRequest,
): Promise<VerifiedDownloadResult> {
  try {
    const response = await apiFetch<VerifiedDownloadUrlResponse>(
      '/v1/reports/download-url/verified',
      {
        method: 'POST',
        body: request,
      },
    )
    return {
      downloadUrl: response.downloadUrl,
      checksumVerified: response.checksumVerified,
      usedFallback: false,
    }
  } catch (error) {
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
      throw error
    }

    const fallbackRequest: DownloadUrlRequest = { reportId: request.reportId }
    const fallback = await apiFetch<DownloadUrlResponse>(
      '/v1/reports/download-url',
      {
        method: 'POST',
        body: fallbackRequest,
      },
    )
    return {
      downloadUrl: fallback.downloadUrl,
      checksumVerified: false,
      usedFallback: true,
    }
  }
}

export function useVerifiedDownloadUrl() {
  return useMutation({
    mutationFn: fetchVerifiedDownloadUrl,
  })
}
