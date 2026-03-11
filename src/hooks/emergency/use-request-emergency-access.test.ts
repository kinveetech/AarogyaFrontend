import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@/test/render'
import { useRequestEmergencyAccess } from './use-request-emergency-access'
import type {
  CreateEmergencyAccessRequest,
  EmergencyAccessResponse,
} from '@/types/emergency'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function jsonResponse(data: unknown, status = 201) {
  return new Response(JSON.stringify(data), {
    status,
    statusText: status === 201 ? 'Created' : 'Error',
    headers: { 'Content-Type': 'application/json' },
  })
}

const validRequest: CreateEmergencyAccessRequest = {
  patientSub: 'patient-sub-123',
  emergencyContactPhone: '9876543210',
  doctorSub: 'doctor-sub-456',
  reason: 'Patient unconscious, need medical history',
}

const successResponse: EmergencyAccessResponse = {
  grantId: 'grant-abc-123',
  patientSub: 'patient-sub-123',
  doctorSub: 'doctor-sub-456',
  emergencyContactId: 'ec-789',
  startsAt: '2026-03-11T10:00:00Z',
  expiresAt: '2026-03-12T10:00:00Z',
  purpose: 'Patient unconscious, need medical history',
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('useRequestEmergencyAccess', () => {
  it('sends POST request with correct payload', async () => {
    mockFetch.mockResolvedValue(jsonResponse(successResponse))

    const { result } = renderHook(() => useRequestEmergencyAccess())

    result.current.mutate(validRequest)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFetch).toHaveBeenCalledOnce()
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toContain('/v1/emergency-access/requests')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body as string)).toEqual(validRequest)
  })

  it('returns the emergency access response on success', async () => {
    mockFetch.mockResolvedValue(jsonResponse(successResponse))

    const { result } = renderHook(() => useRequestEmergencyAccess())

    result.current.mutate(validRequest)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toEqual(successResponse)
  })

  it('sends optional durationHours when provided', async () => {
    mockFetch.mockResolvedValue(jsonResponse(successResponse))

    const requestWithDuration: CreateEmergencyAccessRequest = {
      ...validRequest,
      durationHours: 48,
    }

    const { result } = renderHook(() => useRequestEmergencyAccess())

    result.current.mutate(requestWithDuration)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(body.durationHours).toBe(48)
  })

  it('handles 400 validation error', async () => {
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          title: 'Validation failed.',
          status: 400,
          errors: {
            emergencyAccess: ['Phone number is not a registered emergency contact for this patient.'],
          },
        }),
        {
          status: 400,
          statusText: 'Bad Request',
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    const { result } = renderHook(() => useRequestEmergencyAccess())

    result.current.mutate(validRequest)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })

  it('handles network error', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))

    const { result } = renderHook(() => useRequestEmergencyAccess())

    result.current.mutate(validRequest)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})
