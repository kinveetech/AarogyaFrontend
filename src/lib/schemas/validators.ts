import { z } from 'zod/v4'

/** Indian mobile number: 10 digits starting with 6-9 */
export const phoneNumber = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number')

/** Trimmed non-empty string */
export const nonEmptyString = z.string().trim().min(1, 'Required')

/** Email address */
export const email = z.email('Must be a valid email address')

/** Aadhaar number: 12 digits, first digit 2-9 */
export const aadhaarNumber = z
  .string()
  .regex(/^[2-9]\d{11}$/, 'Must be a valid 12-digit Aadhaar number')

/** Date that must be in the future */
export const futureDate = z.coerce
  .date()
  .refine((d) => d > new Date(), 'Must be a future date')
