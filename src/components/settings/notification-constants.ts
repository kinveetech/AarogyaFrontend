import type { NotificationChannel, NotificationEventType } from '@/types/notification'

export interface ChannelMeta {
  channel: NotificationChannel
  label: string
  description: string
}

export interface EventMeta {
  eventType: NotificationEventType
  label: string
  description: string
}

export const CHANNEL_ITEMS: ChannelMeta[] = [
  {
    channel: 'push',
    label: 'Push Notifications',
    description: 'Receive instant alerts on this device via your browser',
  },
  {
    channel: 'email',
    label: 'Email Notifications',
    description: 'Get updates delivered to your registered email address',
  },
  {
    channel: 'sms',
    label: 'SMS Notifications',
    description: 'Receive text messages on your registered phone number',
  },
]

export const EVENT_ITEMS: EventMeta[] = [
  {
    eventType: 'reportUploaded',
    label: 'Report Uploaded',
    description: 'When a new medical report has been uploaded and processed',
  },
  {
    eventType: 'accessGranted',
    label: 'Access Granted',
    description: 'When a doctor views or accesses your health records',
  },
  {
    eventType: 'emergencyAccess',
    label: 'Emergency Access',
    description: 'Critical alerts related to emergency access to your health data',
  },
]
