export type ConsentPurpose =
  | 'profile_management'
  | 'emergency_contact_management'
  | 'medical_data_sharing'
  | 'medical_records_processing'

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
