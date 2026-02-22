import { z } from 'zod/v4'

import { email, nonEmptyString, phoneNumber } from './validators'

const bloodGroupValues = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

const genderValues = ['male', 'female', 'other'] as const

export const profileUpdateSchema = z.object({
  name: nonEmptyString.max(100, 'Name must be 100 characters or fewer'),
  email: email,
  phone: phoneNumber,
  dateOfBirth: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Must be a valid date')
    .refine((s) => new Date(s) < new Date(), 'Must be in the past'),
  bloodGroup: z.enum(bloodGroupValues).nullable().optional(),
  gender: z.enum(genderValues).nullable().optional(),
  city: z.string().trim().max(100, 'City must be 100 characters or fewer').nullable().optional(),
})

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>

export { bloodGroupValues, genderValues }
