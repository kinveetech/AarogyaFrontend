import { z } from 'zod/v4'

export const consentSchema = z.object({
  purpose: z.enum([
    'profile_management',
    'emergency_contact_management',
    'medical_data_sharing',
    'medical_records_processing',
  ]),
  isGranted: z.boolean(),
})

export type Consent = z.infer<typeof consentSchema>
