import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { queryKeys } from '@/lib/api/query-keys'
import type { RegisteredDevice } from '@/types/notification'

export function useDeregisterDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (deviceToken: string) =>
      apiFetch<void>(`/v1/notifications/devices/${encodeURIComponent(deviceToken)}`, {
        method: 'DELETE',
      }),
    onMutate: async (deviceToken) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.devices() })

      const previous = queryClient.getQueryData<RegisteredDevice[]>(
        queryKeys.notifications.devices(),
      )

      queryClient.setQueryData<RegisteredDevice[]>(
        queryKeys.notifications.devices(),
        (old) => old?.filter((d) => d.deviceToken !== deviceToken),
      )

      return { previous }
    },
    onError: (_err, _token, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notifications.devices(), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.devices() })
    },
  })
}
