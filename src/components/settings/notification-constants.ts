import type { NotificationChannel, NotificationCategory } from '@/types/notification'

export interface ChannelMeta {
  channel: NotificationChannel
  label: string
  description: string
}

export interface CategoryMeta {
  category: NotificationCategory
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

export const CATEGORY_ITEMS: CategoryMeta[] = [
  {
    category: 'report-processed',
    label: 'Report Processed',
    description: 'When an uploaded report has been processed and is ready to view',
  },
  {
    category: 'access-activity',
    label: 'Access Activity',
    description: 'When a doctor views or accesses your health records',
  },
  {
    category: 'emergency-alerts',
    label: 'Emergency Alerts',
    description: 'Critical alerts related to your emergency contacts or health data',
  },
  {
    category: 'system-updates',
    label: 'System Updates',
    description: 'Platform updates, maintenance notices, and new features',
  },
]
