import { z } from 'zod/v4'

import { futureDate, nonEmptyString } from './validators'

export const accessGrantSchema = z.object({
  doctorId: z.guid('Must be a valid UUID'),
  doctorName: nonEmptyString,
  reportIds: z.array(z.guid()).min(1, 'Select at least one report'),
  expiresAt: futureDate,
})

export type AccessGrant = z.infer<typeof accessGrantSchema>
