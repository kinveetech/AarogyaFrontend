import type { StatusBadgeProps } from '@/components/ui/status-badge'

export type GrantStatus = 'active' | 'expiring' | 'expired'

interface GrantStatusInfo {
  status: GrantStatus
  label: string
  badgeVariant: StatusBadgeProps['variant']
  daysRemaining: number
}

export function getGrantStatus(expiresAt: string): GrantStatusInfo {
  const now = new Date()
  const expiry = new Date(expiresAt)
  const diffMs = expiry.getTime() - now.getTime()
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (daysRemaining <= 0) {
    return {
      status: 'expired',
      label: 'Expired',
      badgeVariant: 'pending',
      daysRemaining,
    }
  }

  if (daysRemaining <= 7) {
    return {
      status: 'expiring',
      label: 'Expiring Soon',
      badgeVariant: 'warning',
      daysRemaining,
    }
  }

  return {
    status: 'active',
    label: 'Active',
    badgeVariant: 'success',
    daysRemaining,
  }
}

export function formatExpiryText(daysRemaining: number): string {
  if (daysRemaining <= 0) {
    const absDays = Math.abs(daysRemaining)
    return absDays === 0 ? 'Expired today' : `Expired ${absDays} day${absDays === 1 ? '' : 's'} ago`
  }
  return `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
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

export const DURATION_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
] as const
