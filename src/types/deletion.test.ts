import { describe, it, expect } from 'vitest'
import type { DeletionResponse, DeletionStatus } from './deletion'

describe('DeletionResponse type', () => {
  it('allows pending status', () => {
    const response: DeletionResponse = {
      id: 'del-1',
      status: 'pending',
      requestedAt: '2026-03-11T10:00:00Z',
    }

    expect(response.status).toBe('pending')
    expect(response.id).toBe('del-1')
    expect(response.requestedAt).toBeTruthy()
  })

  it('allows processing status', () => {
    const response: DeletionResponse = {
      id: 'del-2',
      status: 'processing',
      requestedAt: '2026-03-11T10:00:00Z',
    }

    expect(response.status).toBe('processing')
  })

  it('allows completed status', () => {
    const response: DeletionResponse = {
      id: 'del-3',
      status: 'completed',
      requestedAt: '2026-03-11T10:00:00Z',
    }

    expect(response.status).toBe('completed')
  })

  it('supports all valid status values', () => {
    const statuses: DeletionStatus[] = ['pending', 'processing', 'completed']

    expect(statuses).toHaveLength(3)
    statuses.forEach((status) => {
      expect(typeof status).toBe('string')
    })
  })
})
