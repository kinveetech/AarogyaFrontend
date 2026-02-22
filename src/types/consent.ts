export type ConsentPurpose = 'analytics' | 'marketing' | 'data-sharing' | 'research'

export interface Consent {
  id: string
  purpose: ConsentPurpose
  granted: boolean
  updatedAt: string
}

export interface ConsentListResponse {
  items: Consent[]
}

export interface UpdateConsentRequest {
  granted: boolean
}
