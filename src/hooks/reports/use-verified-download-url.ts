import { useMutation } from '@tanstack/react-query'
import { apiFetch, ApiError } from '@/lib/api/client'
import type {
  VerifiedDownloadUrlRequest,
  VerifiedDownloadUrlResponse,
  DownloadUrlResponse,
} from '@/types/reports'

export interface VerifiedDownloadResult {
  downloadUrl: string
  checksumSha256: string | null
  isServerVerified: boolean
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
      checksumSha256: response.checksumSha256,
      isServerVerified: response.isServerVerified,
      usedFallback: false,
    }
  } catch (error) {
    if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
      throw error
    }

    // Fallback to standard endpoint — may fail if objectKey is required
    const fallback = await apiFetch<DownloadUrlResponse>(
      '/v1/reports/download-url',
      {
        method: 'POST',
        body: { reportId: request.reportId },
      },
    )
    return {
      downloadUrl: fallback.downloadUrl,
      checksumSha256: null,
      isServerVerified: false,
      usedFallback: true,
    }
  }
}

export function useVerifiedDownloadUrl() {
  return useMutation({
    mutationFn: fetchVerifiedDownloadUrl,
  })
}
