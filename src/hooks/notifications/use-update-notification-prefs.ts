import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import { toaster } from '@/components/ui/toaster'
import type {
  NotificationPreferences,
  UpdateNotificationPrefsRequest,
} from '@/types/notification'

export function useUpdateNotificationPrefs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: UpdateNotificationPrefsRequest) =>
      apiFetch<NotificationPreferences>('/v1/notifications/preferences', {
        method: 'PUT',
        body: request,
      }),
    onMutate: async (request) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all })

      const previous = queryClient.getQueryData<NotificationPreferences>(
        queryKeys.notifications.prefs(),
      )

      queryClient.setQueryData<NotificationPreferences>(
        queryKeys.notifications.prefs(),
        (old) => {
          if (!old) return old
          return {
            ...old,
            reportUploaded: request.reportUploaded,
            accessGranted: request.accessGranted,
            emergencyAccess: request.emergencyAccess,
          }
        },
      )

      return { previous }
    },
    onError: (_err, _request, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notifications.prefs(), context.previous)
      }
      toaster.create({
        type: 'error',
        title: 'Could not update notification preferences',
        description: 'Something went wrong while saving your preferences. Please try again.',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}
