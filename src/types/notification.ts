export type NotificationChannel = 'push' | 'email' | 'sms'
export type NotificationCategory = 'report-processed' | 'access-activity' | 'emergency-alerts' | 'system-updates'

export interface ChannelPreferences {
  enabled: boolean
  categories: Record<NotificationCategory, boolean>
}

export interface NotificationPreferences {
  push: ChannelPreferences
  email: ChannelPreferences
  sms: ChannelPreferences
  updatedAt: string
}

export interface UpdateNotificationPrefsRequest {
  push: ChannelPreferences
  email: ChannelPreferences
  sms: ChannelPreferences
}

export interface DeviceTokenRequest {
  deviceToken: string
  platform: 'web'
  deviceName?: string
  appVersion?: string
}
