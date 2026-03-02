export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export type Gender = 'male' | 'female' | 'other'

export type RegistrationStatus = 'pending_approval' | 'approved' | 'rejected'

export interface Profile {
  sub: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  bloodGroup: BloodGroup | null
  gender: Gender | null
  address: string | null
  aadhaarVerified: boolean
  registrationStatus: RegistrationStatus
  roles: string[]
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  bloodGroup: BloodGroup | null
  address: string | null
}

export interface VerifyAadhaarRequest {
  aadhaarNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
}

export interface AadhaarDemographics {
  name: string
  dateOfBirth: string
  gender: string
  address: string
}

export interface AadhaarVerificationResponse {
  referenceToken: string
  existingRecord: boolean
  provider: string
  demographics: AadhaarDemographics
}

export function getDisplayName(profile: Pick<Profile, 'firstName' | 'lastName'>): string {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ')
}
