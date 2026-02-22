export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'

export type Gender = 'male' | 'female' | 'other'

export interface Profile {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  bloodGroup: BloodGroup | null
  gender: Gender | null
  city: string | null
  aadhaarVerified: boolean
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileRequest {
  name: string
  phone: string
  dateOfBirth: string
  bloodGroup: BloodGroup | null
  gender: Gender | null
  city: string | null
}
