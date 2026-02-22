import type { ConsentPurpose } from '@/types/consent'

export interface ConsentMeta {
  purpose: ConsentPurpose
  label: string
  description: string
  tooltip: string
}

export const CONSENT_ITEMS: ConsentMeta[] = [
  {
    purpose: 'analytics',
    label: 'Data Processing (Analytics)',
    description: 'Allow usage data collection to improve the app experience',
    tooltip: 'We collect anonymous usage patterns to improve performance and identify issues. No personal health data is included.',
  },
  {
    purpose: 'marketing',
    label: 'Marketing Communications',
    description: 'Receive product updates and health tips via email',
    tooltip: 'You will receive occasional emails about new features, health tips, and promotions. You can unsubscribe at any time.',
  },
  {
    purpose: 'data-sharing',
    label: 'Third-party Data Sharing',
    description: 'Allow data sharing with partner healthcare services',
    tooltip: 'Your anonymized data may be shared with verified healthcare partners to enhance service quality. Identifiable data is never shared.',
  },
  {
    purpose: 'research',
    label: 'Research Participation',
    description: 'Allow anonymized data for medical research studies',
    tooltip: 'Your anonymized health data may be used in approved medical research studies. Your identity is never disclosed to researchers.',
  },
]
