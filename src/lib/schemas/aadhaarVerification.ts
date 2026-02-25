import { z } from 'zod/v4'

import { aadhaarNumber, nonEmptyString } from './validators'

export const aadhaarVerificationSchema = z.object({
  aadhaarNumber,
  firstName: nonEmptyString.max(120, 'First name must be 120 characters or fewer'),
  lastName: nonEmptyString.max(120, 'Last name must be 120 characters or fewer'),
  dateOfBirth: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Must be a valid date')
    .refine((s) => new Date(s) < new Date(), 'Must be in the past'),
})

export type AadhaarVerification = z.infer<typeof aadhaarVerificationSchema>
