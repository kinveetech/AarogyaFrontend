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
  id: string
  doctorId: string
  doctorName: string
  reportIds: string[]
  expiresAt: string
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
  doctorId: string
  doctorName: string
  reportIds: string[]
  expiresAt: string
}
