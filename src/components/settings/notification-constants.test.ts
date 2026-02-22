import { describe, it, expect } from 'vitest'
import { CHANNEL_ITEMS, CATEGORY_ITEMS } from './notification-constants'

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

  describe('CATEGORY_ITEMS', () => {
    it('has 4 categories', () => {
      expect(CATEGORY_ITEMS).toHaveLength(4)
    })

    it('includes all notification categories', () => {
      const categories = CATEGORY_ITEMS.map((c) => c.category)
      expect(categories).toEqual([
        'report-processed',
        'access-activity',
        'emergency-alerts',
        'system-updates',
      ])
    })

    it('each item has label and description', () => {
      for (const item of CATEGORY_ITEMS) {
        expect(item.label).toBeTruthy()
        expect(item.description).toBeTruthy()
      }
    })
  })
})
