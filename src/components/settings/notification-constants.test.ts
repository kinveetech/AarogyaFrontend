import { describe, it, expect } from 'vitest'
import { CHANNEL_ITEMS, EVENT_ITEMS } from './notification-constants'

describe('notification constants', () => {
  describe('CHANNEL_ITEMS', () => {
    it('has 3 channels', () => {
      expect(CHANNEL_ITEMS).toHaveLength(3)
    })

    it('includes push, email, and sms channels', () => {
      const channels = CHANNEL_ITEMS.map((c) => c.channel)
      expect(channels).toEqual(['push', 'email', 'sms'])
    })

    it('each item has label and description', () => {
      for (const item of CHANNEL_ITEMS) {
        expect(item.label).toBeTruthy()
        expect(item.description).toBeTruthy()
      }
    })
  })

  describe('EVENT_ITEMS', () => {
    it('has 3 event types', () => {
      expect(EVENT_ITEMS).toHaveLength(3)
    })

    it('includes all notification event types', () => {
      const eventTypes = EVENT_ITEMS.map((e) => e.eventType)
      expect(eventTypes).toEqual([
        'reportUploaded',
        'accessGranted',
        'emergencyAccess',
      ])
    })

    it('each item has label and description', () => {
      for (const item of EVENT_ITEMS) {
        expect(item.label).toBeTruthy()
        expect(item.description).toBeTruthy()
      }
    })
  })
})
