import { describe, it, expect } from 'vitest'
import { queryKeys } from './query-keys'

describe('queryKeys', () => {
  describe('reports', () => {
    it('has correct base key', () => {
      expect(queryKeys.reports.all).toEqual(['reports'])
    })

    it('produces list key without params', () => {
      expect(queryKeys.reports.list()).toEqual(['reports', 'list', undefined])
    })

    it('produces list key with params', () => {
      const params = { page: 1, pageSize: 10 }
      expect(queryKeys.reports.list(params)).toEqual(['reports', 'list', params])
    })

    it('produces different keys for different params', () => {
      const a = queryKeys.reports.list({ page: 1 })
      const b = queryKeys.reports.list({ page: 2 })
      expect(a).not.toEqual(b)
    })

    it('produces detail key', () => {
      expect(queryKeys.reports.detail('abc')).toEqual(['reports', 'detail', 'abc'])
    })
  })

  describe('profile', () => {
    it('has correct base key', () => {
      expect(queryKeys.profile.all).toEqual(['profile'])
    })

    it('produces me key', () => {
      expect(queryKeys.profile.me()).toEqual(['profile', 'me'])
    })
  })

  describe('accessGrants', () => {
    it('has correct base key', () => {
      expect(queryKeys.accessGrants.all).toEqual(['accessGrants'])
    })

    it('produces list key', () => {
      expect(queryKeys.accessGrants.list()).toEqual(['accessGrants', 'list'])
    })

    it('produces detail key', () => {
      expect(queryKeys.accessGrants.detail('x')).toEqual(['accessGrants', 'detail', 'x'])
    })
  })

  describe('consents', () => {
    it('has correct base key', () => {
      expect(queryKeys.consents.all).toEqual(['consents'])
    })

    it('produces list key', () => {
      expect(queryKeys.consents.list()).toEqual(['consents', 'list'])
    })

    it('produces detail key', () => {
      expect(queryKeys.consents.detail('y')).toEqual(['consents', 'detail', 'y'])
    })
  })

  describe('emergencyContacts', () => {
    it('has correct base key', () => {
      expect(queryKeys.emergencyContacts.all).toEqual(['emergencyContacts'])
    })

    it('produces list key', () => {
      expect(queryKeys.emergencyContacts.list()).toEqual(['emergencyContacts', 'list'])
    })

    it('produces detail key', () => {
      expect(queryKeys.emergencyContacts.detail('z')).toEqual(['emergencyContacts', 'detail', 'z'])
    })
  })

  describe('notifications', () => {
    it('has correct base key', () => {
      expect(queryKeys.notifications.all).toEqual(['notifications'])
    })

    it('produces prefs key', () => {
      expect(queryKeys.notifications.prefs()).toEqual(['notifications', 'prefs'])
    })
  })
})
