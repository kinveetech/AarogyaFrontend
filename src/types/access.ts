export type AccessGrantStatus = 'active' | 'revoked' | 'expired'

export interface Doctor {
  id: string
  name: string
  specialisation: string
  registrationNumber: string
}

export interface DoctorSearchResult {
  items: Doctor[]
}

export interface AccessGrant {
  grantId: string
  patientSub: string
  doctorSub: string
  doctorName: string
  allReports: boolean
  reportIds: string[]
  purpose: string
  startsAt: string
  expiresAt: string
  revoked: boolean
  createdAt: string
}

export interface AccessGrantListResponse {
  items: AccessGrant[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface CreateAccessGrantRequest {
  doctorSub: string
  doctorName: string
  allReports: boolean
  reportIds: string[]
  purpose: string
  expiresAt: string
}
