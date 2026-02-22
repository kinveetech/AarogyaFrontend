import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { DoctorSearchResult } from '@/types/access'

export function useSearchDoctors(query: string) {
  const debouncedQuery = useDebouncedValue(query, 300)

  return useQuery({
    queryKey: ['doctors', 'search', debouncedQuery],
    queryFn: () =>
      apiFetch<DoctorSearchResult>(
        `/v1/doctors/search?q=${encodeURIComponent(debouncedQuery)}`,
      ),
    enabled: debouncedQuery.trim().length >= 2,
  })
}
