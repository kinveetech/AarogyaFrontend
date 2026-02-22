import { z } from 'zod/v4'

import { nonEmptyString, phoneNumber } from './validators'

export const emergencyContactSchema = z.object({
  name: nonEmptyString.max(100, 'Name must be 100 characters or fewer'),
  phone: phoneNumber,
  relationship: z.enum([
    'spouse',
    'parent',
    'sibling',
    'child',
    'friend',
    'other',
  ]),
})

export type EmergencyContact = z.infer<typeof emergencyContactSchema>
