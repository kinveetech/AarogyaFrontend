import { z } from 'zod/v4'

import { email, nonEmptyString, phoneNumber } from './validators'

export const profileUpdateSchema = z.object({
  name: nonEmptyString.max(100, 'Name must be 100 characters or fewer'),
  email: email,
  phone: phoneNumber,
  dateOfBirth: z.coerce
    .date()
    .refine((d) => d < new Date(), 'Must be in the past'),
})

export type ProfileUpdate = z.infer<typeof profileUpdateSchema>
