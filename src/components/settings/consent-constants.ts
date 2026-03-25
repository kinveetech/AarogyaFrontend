import type { ConsentPurpose } from '@/types/consent'

export interface ConsentMeta {
  purpose: ConsentPurpose
  label: string
  description: string
  tooltip: string
}

export const CONSENT_ITEMS: ConsentMeta[] = [
  {
    purpose: 'profile_management',
    label: 'Profile Management',
    description: 'Allow processing of your personal data to manage your profile',
    tooltip: 'Required for storing and updating your name, contact details, and preferences. This is essential for your account to function.',
  },
  {
    purpose: 'emergency_contact_management',
    label: 'Emergency Contact Management',
    description: 'Allow processing of emergency contact information',
    tooltip: 'Enables storing emergency contacts who can be notified and granted access to your records in critical situations.',
  },
  {
    purpose: 'medical_data_sharing',
    label: 'Medical Data Sharing',
    description: 'Allow sharing medical records with your authorized doctors',
    tooltip: 'Enables doctors you grant access to view your medical reports and health data. You control who has access and can revoke it anytime.',
  },
  {
    purpose: 'medical_records_processing',
    label: 'Medical Records Processing',
    description: 'Allow processing and storage of your medical reports',
    tooltip: 'Required for uploading, storing, and analyzing your medical reports. Reports are encrypted and only accessible to you and authorized doctors.',
  },
]
