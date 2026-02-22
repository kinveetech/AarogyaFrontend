import type { Relationship } from '@/types/emergency'

export const MAX_CONTACTS = 3

export const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  spouse: 'Spouse',
  parent: 'Parent',
  sibling: 'Sibling',
  child: 'Child',
  friend: 'Friend',
  other: 'Other',
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function formatPhone(phone: string): string {
  if (phone.length === 10) {
    return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
  }
  return phone
}
