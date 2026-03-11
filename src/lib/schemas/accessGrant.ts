import { z } from 'zod/v4'

import { futureDate, nonEmptyString } from './validators'

export const accessGrantSchema = z
  .object({
    doctorId: z.guid('Must be a valid UUID'),
    doctorName: nonEmptyString,
    allReports: z.boolean(),
    reportIds: z.array(z.guid()),
    purpose: nonEmptyString.max(500, 'Purpose must be 500 characters or less'),
    expiresAt: futureDate,
  })
  .refine(
    (data) => data.allReports || data.reportIds.length > 0,
    {
      message: 'Select at least one report or grant access to all reports',
      path: ['reportIds'],
    },
  )

export type AccessGrant = z.infer<typeof accessGrantSchema>
