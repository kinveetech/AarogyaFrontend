import { describe, expect, it } from 'vitest'

import {
  roleSelectionSchema,
  patientProfileSchema,
  doctorProfileSchema,
  labTechnicianProfileSchema,
  consentGrantSchema,
  roleValues,
  bloodGroupValues,
  genderValues,
} from './registration'

const validBaseProfile = {
  firstName: 'Amit',
  lastName: 'Patel',
  email: 'amit@example.com',
}

describe('roleSelectionSchema', () => {
  it('accepts patient role', () => {
    expect(roleSelectionSchema.safeParse({ role: 'patient' }).success).toBe(true)
  })

  it('accepts doctor role', () => {
    expect(roleSelectionSchema.safeParse({ role: 'doctor' }).success).toBe(true)
  })

  it('accepts lab_technician role', () => {
    expect(roleSelectionSchema.safeParse({ role: 'lab_technician' }).success).toBe(true)
  })

  it('rejects invalid role', () => {
    expect(roleSelectionSchema.safeParse({ role: 'admin' }).success).toBe(false)
  })

  it('rejects missing role', () => {
    expect(roleSelectionSchema.safeParse({}).success).toBe(false)
  })

  it('rejects empty role string', () => {
    expect(roleSelectionSchema.safeParse({ role: '' }).success).toBe(false)
  })
})

describe('patientProfileSchema', () => {
  it('accepts valid patient profile with required fields only', () => {
    expect(patientProfileSchema.safeParse(validBaseProfile).success).toBe(true)
  })

  it('accepts valid patient profile with all optional fields', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      phone: '9876543210',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      address: '123 MG Road, Bengaluru',
      bloodGroup: 'B+',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty firstName', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      firstName: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty lastName', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      lastName: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects firstName exceeding 120 characters', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      firstName: 'a'.repeat(121),
    })
    expect(result.success).toBe(false)
  })

  it('rejects lastName exceeding 120 characters', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      lastName: 'a'.repeat(121),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid phone number', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      phone: '1234567890',
    })
    expect(result.success).toBe(false)
  })

  it('accepts valid Indian phone number', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      phone: '9876543210',
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty string for phone', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      phone: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects future date of birth', () => {
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      dateOfBirth: future.toISOString(),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid date string for dateOfBirth', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      dateOfBirth: 'not-a-date',
    })
    expect(result.success).toBe(false)
  })

  it('accepts empty string for dateOfBirth', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      dateOfBirth: '',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid gender', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      gender: 'female',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid gender', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      gender: 'invalid',
    })
    expect(result.success).toBe(false)
  })

  it('accepts empty string for gender', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      gender: '',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid blood group', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      bloodGroup: 'AB+',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid blood group', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      bloodGroup: 'X+',
    })
    expect(result.success).toBe(false)
  })

  it('accepts empty string for bloodGroup', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      bloodGroup: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects address exceeding 500 characters', () => {
    const result = patientProfileSchema.safeParse({
      ...validBaseProfile,
      address: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

describe('doctorProfileSchema', () => {
  const validDoctorData = {
    medicalLicenseNumber: 'MCI-12345',
    specialization: 'Cardiology',
  }

  it('accepts valid doctor profile', () => {
    const result = doctorProfileSchema.safeParse({
      ...validBaseProfile,
      doctorData: validDoctorData,
    })
    expect(result.success).toBe(true)
  })

  it('accepts doctor profile with optional fields', () => {
    const result = doctorProfileSchema.safeParse({
      ...validBaseProfile,
      doctorData: {
        ...validDoctorData,
        clinicOrHospitalName: 'Apollo Hospital',
        clinicAddress: '100 MG Road, Bengaluru',
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing doctorData', () => {
    const result = doctorProfileSchema.safeParse(validBaseProfile)
    expect(result.success).toBe(false)
  })

  it('rejects empty medicalLicenseNumber', () => {
    const result = doctorProfileSchema.safeParse({
      ...validBaseProfile,
      doctorData: { ...validDoctorData, medicalLicenseNumber: '' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects medicalLicenseNumber exceeding 50 characters', () => {
    const result = doctorProfileSchema.safeParse({
      ...validBaseProfile,
      doctorData: { ...validDoctorData, medicalLicenseNumber: 'a'.repeat(51) },
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty specialization', () => {
    const result = doctorProfileSchema.safeParse({
      ...validBaseProfile,
      doctorData: { ...validDoctorData, specialization: '' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects specialization exceeding 100 characters', () => {
    const result = doctorProfileSchema.safeParse({
      ...validBaseProfile,
      doctorData: { ...validDoctorData, specialization: 'a'.repeat(101) },
    })
    expect(result.success).toBe(false)
  })

  it('rejects clinicOrHospitalName exceeding 200 characters', () => {
    const result = doctorProfileSchema.safeParse({
      ...validBaseProfile,
      doctorData: { ...validDoctorData, clinicOrHospitalName: 'a'.repeat(201) },
    })
    expect(result.success).toBe(false)
  })

  it('rejects clinicAddress exceeding 500 characters', () => {
    const result = doctorProfileSchema.safeParse({
      ...validBaseProfile,
      doctorData: { ...validDoctorData, clinicAddress: 'a'.repeat(501) },
    })
    expect(result.success).toBe(false)
  })
})

describe('labTechnicianProfileSchema', () => {
  const validLabData = {
    labName: 'Apollo Diagnostics',
  }

  it('accepts valid lab technician profile', () => {
    const result = labTechnicianProfileSchema.safeParse({
      ...validBaseProfile,
      labTechnicianData: validLabData,
    })
    expect(result.success).toBe(true)
  })

  it('accepts lab technician profile with optional fields', () => {
    const result = labTechnicianProfileSchema.safeParse({
      ...validBaseProfile,
      labTechnicianData: {
        ...validLabData,
        labLicenseNumber: 'LAB-98765',
        nablAccreditationId: 'NABL-54321',
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing labTechnicianData', () => {
    const result = labTechnicianProfileSchema.safeParse(validBaseProfile)
    expect(result.success).toBe(false)
  })

  it('rejects empty labName', () => {
    const result = labTechnicianProfileSchema.safeParse({
      ...validBaseProfile,
      labTechnicianData: { labName: '' },
    })
    expect(result.success).toBe(false)
  })

  it('rejects labName exceeding 200 characters', () => {
    const result = labTechnicianProfileSchema.safeParse({
      ...validBaseProfile,
      labTechnicianData: { labName: 'a'.repeat(201) },
    })
    expect(result.success).toBe(false)
  })

  it('rejects labLicenseNumber exceeding 100 characters', () => {
    const result = labTechnicianProfileSchema.safeParse({
      ...validBaseProfile,
      labTechnicianData: { ...validLabData, labLicenseNumber: 'a'.repeat(101) },
    })
    expect(result.success).toBe(false)
  })

  it('rejects nablAccreditationId exceeding 50 characters', () => {
    const result = labTechnicianProfileSchema.safeParse({
      ...validBaseProfile,
      labTechnicianData: { ...validLabData, nablAccreditationId: 'a'.repeat(51) },
    })
    expect(result.success).toBe(false)
  })
})

describe('consentGrantSchema', () => {
  it('accepts valid consent grant', () => {
    const result = consentGrantSchema.safeParse({
      purpose: 'profile_management',
      isGranted: true,
    })
    expect(result.success).toBe(true)
  })

  it('accepts consent with isGranted false', () => {
    const result = consentGrantSchema.safeParse({
      purpose: 'medical_data_sharing',
      isGranted: false,
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing purpose', () => {
    const result = consentGrantSchema.safeParse({ isGranted: true })
    expect(result.success).toBe(false)
  })

  it('rejects missing isGranted', () => {
    const result = consentGrantSchema.safeParse({ purpose: 'profile_management' })
    expect(result.success).toBe(false)
  })
})

describe('exported constants', () => {
  it('roleValues contains all three roles', () => {
    expect(roleValues).toEqual(['patient', 'doctor', 'lab_technician'])
  })

  it('bloodGroupValues contains all eight groups', () => {
    expect(bloodGroupValues).toEqual(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  })

  it('genderValues contains male, female, other', () => {
    expect(genderValues).toEqual(['male', 'female', 'other'])
  })
})
