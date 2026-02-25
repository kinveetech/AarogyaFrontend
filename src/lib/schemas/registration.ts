import { z } from 'zod/v4'

import { email, nonEmptyString, phoneNumber } from './validators'

const roleValues = ['patient', 'doctor', 'lab_technician'] as const

const bloodGroupValues = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

const genderValues = ['male', 'female', 'other'] as const

export const roleSelectionSchema = z.object({
  role: z.enum(roleValues, { message: 'Please select a role' }),
})

export type RoleSelection = z.infer<typeof roleSelectionSchema>

const doctorDataSchema = z.object({
  medicalLicenseNumber: nonEmptyString.max(50, 'Must be 50 characters or fewer'),
  specialization: nonEmptyString.max(100, 'Must be 100 characters or fewer'),
  clinicOrHospitalName: z.string().trim().max(200, 'Must be 200 characters or fewer').optional(),
  clinicAddress: z.string().trim().max(500, 'Must be 500 characters or fewer').optional(),
})

const labTechnicianDataSchema = z.object({
  labName: nonEmptyString.max(200, 'Must be 200 characters or fewer'),
  labLicenseNumber: z.string().trim().max(100, 'Must be 100 characters or fewer').optional(),
  nablAccreditationId: z.string().trim().max(50, 'Must be 50 characters or fewer').optional(),
})

const baseProfileSchema = z.object({
  firstName: nonEmptyString.max(120, 'Must be 120 characters or fewer'),
  lastName: nonEmptyString.max(120, 'Must be 120 characters or fewer'),
  email: email,
  phone: phoneNumber.optional().or(z.literal('')),
  dateOfBirth: z
    .string()
    .refine((s) => s === '' || !isNaN(Date.parse(s)), 'Must be a valid date')
    .refine((s) => s === '' || new Date(s) < new Date(), 'Must be in the past')
    .optional()
    .or(z.literal('')),
  gender: z.enum(genderValues).optional().or(z.literal('')),
  address: z.string().trim().max(500, 'Must be 500 characters or fewer').optional(),
  bloodGroup: z.enum(bloodGroupValues).optional().or(z.literal('')),
})

export const patientProfileSchema = baseProfileSchema

export const doctorProfileSchema = baseProfileSchema.extend({
  doctorData: doctorDataSchema,
})

export const labTechnicianProfileSchema = baseProfileSchema.extend({
  labTechnicianData: labTechnicianDataSchema,
})

export type PatientProfile = z.infer<typeof patientProfileSchema>
export type DoctorProfile = z.infer<typeof doctorProfileSchema>
export type LabTechnicianProfile = z.infer<typeof labTechnicianProfileSchema>

export const consentGrantSchema = z.object({
  purpose: z.string(),
  isGranted: z.boolean(),
})

export type ConsentGrant = z.infer<typeof consentGrantSchema>

export { roleValues, bloodGroupValues, genderValues }
