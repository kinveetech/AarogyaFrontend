export type ConsentPurpose = 'analytics' | 'marketing' | 'data-sharing' | 'research'

export interface Consent {
  purpose: ConsentPurpose
  isGranted: boolean
  occurredAt: string
  source: string
}

export type ConsentListResponse = Consent[]

export interface UpdateConsentRequest {
  isGranted: boolean
}
