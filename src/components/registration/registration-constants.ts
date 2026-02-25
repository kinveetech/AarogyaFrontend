export const CONSENT_CATALOG = [
  {
    purpose: 'profile_management',
    label: 'Profile Management',
    description:
      'Allow us to store and manage your profile information including name, contact details, and demographic data.',
    required: true,
  },
  {
    purpose: 'emergency_contact_management',
    label: 'Emergency Contact Management',
    description:
      'Allow us to store your emergency contacts and enable emergency access to your records.',
    required: false,
  },
  {
    purpose: 'medical_data_sharing',
    label: 'Medical Data Sharing',
    description:
      'Allow sharing your medical records with healthcare providers you grant access to.',
    required: false,
  },
  {
    purpose: 'medical_records_processing',
    label: 'Medical Records Processing',
    description:
      'Allow processing of your medical records for report generation and health insights.',
    required: false,
  },
] as const

export const SPECIALIZATIONS = [
  'General Medicine',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Surgery',
  'Urology',
  'Other',
] as const

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const

export interface RoleInfoItem {
  value: 'patient' | 'doctor' | 'lab_technician'
  label: string
  description: string
  icon: string
  requiresApproval: boolean
}

export const ROLE_INFO: RoleInfoItem[] = [
  {
    value: 'patient',
    label: 'Patient',
    description: 'Store and manage your health records securely.',
    icon: 'user',
    requiresApproval: false,
  },
  {
    value: 'doctor',
    label: 'Doctor',
    description: 'Access patient records shared with you and manage your practice.',
    icon: 'stethoscope',
    requiresApproval: true,
  },
  {
    value: 'lab_technician',
    label: 'Lab Technician',
    description: 'Upload and manage lab reports for patients.',
    icon: 'flask',
    requiresApproval: true,
  },
]
