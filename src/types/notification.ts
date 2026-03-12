export type NotificationChannel = 'push' | 'email' | 'sms'
export type NotificationEventType = 'reportUploaded' | 'accessGranted' | 'emergencyAccess'

export interface EventChannelPreferences {
  push: boolean
  email: boolean
  sms: boolean
}

export interface NotificationPreferences {
  reportUploaded: EventChannelPreferences
  accessGranted: EventChannelPreferences
  emergencyAccess: EventChannelPreferences
  updatedAt: string
}

export interface UpdateNotificationPrefsRequest {
  reportUploaded: EventChannelPreferences
  accessGranted: EventChannelPreferences
  emergencyAccess: EventChannelPreferences
}

export interface DeviceTokenRequest {
  deviceToken: string
  platform: 'web'
  deviceName?: string
  appVersion?: string
}

export interface RegisteredDevice {
  deviceToken: string
  platform: 'web' | 'ios' | 'android'
  deviceName: string | null
  appVersion: string | null
  registeredAt: string
}
