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
