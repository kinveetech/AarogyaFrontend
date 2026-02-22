import { z } from 'zod/v4'

import { nonEmptyString } from './validators'

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'] as const
const MAX_SIZE_BYTES = 50 * 1024 * 1024

export const reportUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= MAX_SIZE_BYTES, 'File must be 50 MB or smaller')
    .refine(
      (f) => (ALLOWED_TYPES as readonly string[]).includes(f.type),
      'Only PDF, JPEG, and PNG files are allowed',
    ),
  title: nonEmptyString.max(200, 'Title must be 200 characters or fewer'),
  reportType: z.enum(['lab', 'prescription', 'imaging', 'discharge', 'other']),
  reportDate: z.coerce.date(),
  notes: z.string().max(500, 'Notes must be 500 characters or fewer').optional(),
})

export type ReportUpload = z.infer<typeof reportUploadSchema>
