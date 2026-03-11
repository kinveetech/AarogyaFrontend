import { describe, it, expect } from 'vitest'
import type { DataExportResponse, DataExportStatus } from './data-export'

describe('DataExportResponse type', () => {
  it('allows pending status with null download fields', () => {
    const response: DataExportResponse = {
      id: 'export-1',
      status: 'pending',
      requestedAt: '2026-03-11T10:00:00Z',
      completedAt: null,
      downloadUrl: null,
    }

    expect(response.status).toBe('pending')
    expect(response.completedAt).toBeNull()
    expect(response.downloadUrl).toBeNull()
  })

  it('allows completed status with download url', () => {
    const response: DataExportResponse = {
      id: 'export-2',
      status: 'completed',
      requestedAt: '2026-03-11T10:00:00Z',
      completedAt: '2026-03-11T10:05:00Z',
      downloadUrl: 'https://cdn.example.com/exports/export-2.zip',
    }

    expect(response.status).toBe('completed')
    expect(response.completedAt).toBeTruthy()
    expect(response.downloadUrl).toBeTruthy()
  })

  it('supports all valid status values', () => {
    const statuses: DataExportStatus[] = [
      'pending',
      'processing',
      'completed',
      'failed',
    ]

    expect(statuses).toHaveLength(4)
    statuses.forEach((status) => {
      expect(typeof status).toBe('string')
    })
  })
})
