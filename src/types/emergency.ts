export type Relationship = 'spouse' | 'parent' | 'sibling' | 'child' | 'friend' | 'other'

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  relationship: Relationship
  isPrimary: boolean
  createdAt: string
  updatedAt: string
}

export interface EmergencyContactListResponse {
  items: EmergencyContact[]
}

export interface CreateEmergencyContactRequest {
  name: string
  phone: string
  relationship: Relationship
  isPrimary: boolean
}

export interface UpdateEmergencyContactRequest {
  name: string
  phone: string
  relationship: Relationship
  isPrimary: boolean
}

export interface CreateEmergencyAccessRequest {
  patientSub: string
  emergencyContactPhone: string
  doctorSub: string
  reason: string
  durationHours?: number | null
}

export interface EmergencyAccessResponse {
  grantId: string
  patientSub: string
  doctorSub: string
  emergencyContactId: string
  startsAt: string
  expiresAt: string
  purpose: string
}

export interface EmergencyAccessAuditEvent {
  auditLogId: string
  occurredAt: string
  action: string
  grantId: string | null
  actorUserId: string | null
  actorRole: string | null
  resourceType: string
  resourceId: string | null
  data: Record<string, string>
}

export interface EmergencyAccessAuditResponse {
  page: number
  pageSize: number
  totalCount: number
  items: EmergencyAccessAuditEvent[]
}
