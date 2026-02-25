import type { UserRole } from '@/lib/auth/types'

export interface DoctorRegistrationData {
  medicalLicenseNumber: string
  specialization: string
  clinicOrHospitalName?: string
  clinicAddress?: string
}

export interface LabTechnicianRegistrationData {
  labName: string
  labLicenseNumber?: string
  nablAccreditationId?: string
}

export interface InitialConsentGrant {
  purpose: string
  isGranted: boolean
}

export interface RegisterUserRequest {
  role: UserRole
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  address?: string
  bloodGroup?: string
  doctorData?: DoctorRegistrationData
  labTechnicianData?: LabTechnicianRegistrationData
  consents?: InitialConsentGrant[]
}

export interface RegisterUserResponse {
  sub: string
  role: string
  registrationStatus: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  bloodGroup?: string
  dateOfBirth?: string
  gender?: string
  consentsGranted: string[]
}

export type RegistrationStatusCode =
  | 'registration_required'
  | 'registration_pending_approval'
  | 'registration_rejected'
  | 'approved'

export interface RegistrationStatusResponse {
  sub: string
  role: string
  registrationStatus: string
  rejectionReason?: string
}
