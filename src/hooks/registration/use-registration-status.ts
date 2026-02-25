import { useQuery } from '@tanstack/react-query'
import { apiFetch, ApiError } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { staleTimes } from '@/lib/api/stale-times'
import type {
  RegistrationStatusResponse,
  RegistrationStatusCode,
} from '@/types/registration'

interface RegistrationStatus {
  status: RegistrationStatusCode
  role?: string
  rejectionReason?: string
}

export function useRegistrationStatus() {
  return useQuery({
    queryKey: queryKeys.registration.status(),
    queryFn: async (): Promise<RegistrationStatus> => {
      try {
        const data = await apiFetch<RegistrationStatusResponse>(
          '/v1/users/me/registration-status',
        )
        return {
          status: data.registrationStatus as RegistrationStatusCode,
          role: data.role,
          rejectionReason: data.rejectionReason,
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
          const code = error.code as RegistrationStatusCode | undefined
          if (code === 'registration_required') {
            return { status: 'registration_required' }
          }
          if (code === 'registration_pending_approval') {
            return { status: 'registration_pending_approval' }
          }
          if (code === 'registration_rejected') {
            return { status: 'registration_rejected' }
          }
        }
        throw error
      }
    },
    staleTime: staleTimes.registration,
    retry: false,
  })
}
