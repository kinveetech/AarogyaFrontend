export interface ReportListParams {
  page?: number
  pageSize?: number
  search?: string
  category?: string
}

export const queryKeys = {
  reports: {
    all: ['reports'] as const,
    list: (params?: ReportListParams) =>
      [...queryKeys.reports.all, 'list', params] as const,
    detail: (id: string) =>
      [...queryKeys.reports.all, 'detail', id] as const,
  },
  profile: {
    all: ['profile'] as const,
    me: () => [...queryKeys.profile.all, 'me'] as const,
  },
  accessGrants: {
    all: ['accessGrants'] as const,
    list: () => [...queryKeys.accessGrants.all, 'list'] as const,
    detail: (id: string) =>
      [...queryKeys.accessGrants.all, 'detail', id] as const,
  },
  consents: {
    all: ['consents'] as const,
    list: () => [...queryKeys.consents.all, 'list'] as const,
    detail: (id: string) =>
      [...queryKeys.consents.all, 'detail', id] as const,
  },
  emergencyContacts: {
    all: ['emergencyContacts'] as const,
    list: () => [...queryKeys.emergencyContacts.all, 'list'] as const,
    detail: (id: string) =>
      [...queryKeys.emergencyContacts.all, 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    prefs: () => [...queryKeys.notifications.all, 'prefs'] as const,
  },
}
