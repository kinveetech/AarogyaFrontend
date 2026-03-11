import { z } from 'zod/v4'

import { nonEmptyString, phoneNumber } from './validators'

export const emergencyAccessRequestSchema = z.object({
  patientSub: nonEmptyString,
  emergencyContactPhone: phoneNumber,
  doctorSub: nonEmptyString,
  reason: nonEmptyString.max(500, 'Reason must be 500 characters or fewer'),
  durationHours: z
    .union([z.number().int().min(1, 'Must be at least 1 hour').max(72, 'Must be 72 hours or fewer'), z.null()])
    .optional(),
})

export type EmergencyAccessRequest = z.infer<typeof emergencyAccessRequestSchema>
