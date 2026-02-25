import { describe, it, expect } from 'vitest'
import {
  CONSENT_CATALOG,
  SPECIALIZATIONS,
  BLOOD_GROUPS,
  GENDERS,
  ROLE_INFO,
} from './registration-constants'

describe('CONSENT_CATALOG', () => {
  it('has exactly 4 consent items', () => {
    expect(CONSENT_CATALOG).toHaveLength(4)
  })

  it('contains the correct purposes', () => {
    const purposes = CONSENT_CATALOG.map((item) => item.purpose)
    expect(purposes).toEqual([
      'profile_management',
      'emergency_contact_management',
      'medical_data_sharing',
      'medical_records_processing',
    ])
  })

  it('has all required fields for each item', () => {
    for (const item of CONSENT_CATALOG) {
      expect(item).toHaveProperty('purpose')
      expect(item).toHaveProperty('label')
      expect(item).toHaveProperty('description')
      expect(item).toHaveProperty('required')
      expect(typeof item.purpose).toBe('string')
      expect(typeof item.label).toBe('string')
      expect(typeof item.description).toBe('string')
      expect(typeof item.required).toBe('boolean')
      expect(item.label.length).toBeGreaterThan(0)
      expect(item.description.length).toBeGreaterThan(0)
    }
  })

  it('marks profile_management as required', () => {
    const profileManagement = CONSENT_CATALOG.find((c) => c.purpose === 'profile_management')
    expect(profileManagement?.required).toBe(true)
  })

  it('marks non-required consents correctly', () => {
    const optional = CONSENT_CATALOG.filter((c) => !c.required)
    expect(optional).toHaveLength(3)
    const optionalPurposes = optional.map((c) => c.purpose)
    expect(optionalPurposes).toContain('emergency_contact_management')
    expect(optionalPurposes).toContain('medical_data_sharing')
    expect(optionalPurposes).toContain('medical_records_processing')
  })
})

describe('SPECIALIZATIONS', () => {
  it('has 16 specializations', () => {
    expect(SPECIALIZATIONS).toHaveLength(16)
  })

  it('includes common specializations', () => {
    expect(SPECIALIZATIONS).toContain('Cardiology')
    expect(SPECIALIZATIONS).toContain('General Medicine')
    expect(SPECIALIZATIONS).toContain('Pediatrics')
    expect(SPECIALIZATIONS).toContain('Surgery')
  })

  it('includes Other as the last item', () => {
    expect(SPECIALIZATIONS[SPECIALIZATIONS.length - 1]).toBe('Other')
  })
})

describe('BLOOD_GROUPS', () => {
  it('has 8 blood groups', () => {
    expect(BLOOD_GROUPS).toHaveLength(8)
  })

  it('contains all standard blood groups', () => {
    expect(BLOOD_GROUPS).toEqual(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  })
})

describe('GENDERS', () => {
  it('has 3 gender options', () => {
    expect(GENDERS).toHaveLength(3)
  })

  it('has value-label pairs', () => {
    for (const gender of GENDERS) {
      expect(gender).toHaveProperty('value')
      expect(gender).toHaveProperty('label')
      expect(typeof gender.value).toBe('string')
      expect(typeof gender.label).toBe('string')
    }
  })

  it('contains male, female, other', () => {
    const values = GENDERS.map((g) => g.value)
    expect(values).toEqual(['male', 'female', 'other'])
  })
})

describe('ROLE_INFO', () => {
  it('has exactly 3 roles', () => {
    expect(ROLE_INFO).toHaveLength(3)
  })

  it('contains patient, doctor, lab_technician', () => {
    const values = ROLE_INFO.map((r) => r.value)
    expect(values).toEqual(['patient', 'doctor', 'lab_technician'])
  })

  it('has all required fields for each role', () => {
    for (const role of ROLE_INFO) {
      expect(role).toHaveProperty('value')
      expect(role).toHaveProperty('label')
      expect(role).toHaveProperty('description')
      expect(role).toHaveProperty('icon')
      expect(role).toHaveProperty('requiresApproval')
      expect(typeof role.value).toBe('string')
      expect(typeof role.label).toBe('string')
      expect(typeof role.description).toBe('string')
      expect(typeof role.icon).toBe('string')
      expect(typeof role.requiresApproval).toBe('boolean')
      expect(role.label.length).toBeGreaterThan(0)
      expect(role.description.length).toBeGreaterThan(0)
    }
  })

  it('patient does not require approval', () => {
    const patient = ROLE_INFO.find((r) => r.value === 'patient')
    expect(patient?.requiresApproval).toBe(false)
  })

  it('doctor requires approval', () => {
    const doctor = ROLE_INFO.find((r) => r.value === 'doctor')
    expect(doctor?.requiresApproval).toBe(true)
  })

  it('lab_technician requires approval', () => {
    const labTech = ROLE_INFO.find((r) => r.value === 'lab_technician')
    expect(labTech?.requiresApproval).toBe(true)
  })

  it('has correct labels', () => {
    const labels = ROLE_INFO.map((r) => r.label)
    expect(labels).toEqual(['Patient', 'Doctor', 'Lab Technician'])
  })
})
