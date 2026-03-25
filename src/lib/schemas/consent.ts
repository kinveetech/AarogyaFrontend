import { z } from 'zod/v4'

export const consentSchema = z.object({
  purpose: z.enum(['analytics', 'marketing', 'data-sharing', 'research']),
  isGranted: z.boolean(),
})

export type Consent = z.infer<typeof consentSchema>
