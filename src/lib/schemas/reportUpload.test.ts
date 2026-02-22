import { describe, expect, it } from 'vitest'

import { reportUploadSchema } from './reportUpload'

function makeFile(
  name: string,
  type: string,
  sizeBytes: number,
): File {
  const buffer = new ArrayBuffer(sizeBytes)
  return new File([buffer], name, { type })
}

const validData = {
  file: makeFile('report.pdf', 'application/pdf', 1024),
  title: 'Blood Test Results',
  reportType: 'lab' as const,
  reportDate: new Date('2024-01-15'),
}

describe('reportUploadSchema', () => {
  it('accepts valid report upload', () => {
    expect(reportUploadSchema.safeParse(validData).success).toBe(true)
  })

  it('accepts optional notes', () => {
    const result = reportUploadSchema.safeParse({
      ...validData,
      notes: 'Fasting blood sugar',
    })
    expect(result.success).toBe(true)
  })

  it('rejects file exceeding 50 MB', () => {
    const result = reportUploadSchema.safeParse({
      ...validData,
      file: makeFile('large.pdf', 'application/pdf', 51 * 1024 * 1024),
    })
    expect(result.success).toBe(false)
  })

  it('rejects disallowed file type', () => {
    const result = reportUploadSchema.safeParse({
      ...validData,
      file: makeFile('doc.docx', 'application/msword', 1024),
    })
    expect(result.success).toBe(false)
  })

  it('accepts JPEG files', () => {
    const result = reportUploadSchema.safeParse({
      ...validData,
      file: makeFile('scan.jpg', 'image/jpeg', 2048),
    })
    expect(result.success).toBe(true)
  })

  it('accepts PNG files', () => {
    const result = reportUploadSchema.safeParse({
      ...validData,
      file: makeFile('scan.png', 'image/png', 2048),
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = reportUploadSchema.safeParse({
      ...validData,
      title: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects title exceeding 200 characters', () => {
    const result = reportUploadSchema.safeParse({
      ...validData,
      title: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid report type', () => {
    const result = reportUploadSchema.safeParse({
      ...validData,
      reportType: 'xray',
    })
    expect(result.success).toBe(false)
  })

  it('rejects notes exceeding 500 characters', () => {
    const result = reportUploadSchema.safeParse({
      ...validData,
      notes: 'a'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing required fields', () => {
    const result = reportUploadSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
