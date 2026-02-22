import { z } from 'zod/v4'

export const consentSchema = z.object({
  purpose: z.enum(['analytics', 'marketing', 'data-sharing', 'research']),
  granted: z.boolean(),
})

export type Consent = z.infer<typeof consentSchema>
