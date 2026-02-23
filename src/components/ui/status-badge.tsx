import { type ReactNode } from 'react'
import { Box } from '@chakra-ui/react'

export interface StatusBadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'pending'
  children: ReactNode
  showDot?: boolean
}

const VARIANT_STYLES = {
  success: {
    bg: 'rgba(127, 178, 133, 0.15)',
    color: 'sage.600',
    _dark: { bg: 'rgba(157, 197, 161, 0.15)', color: 'sage.300' },
  },
  warning: {
    bg: 'rgba(255, 179, 71, 0.15)',
    color: 'amber.500',
    _dark: { bg: 'rgba(255, 179, 71, 0.15)', color: 'amber.200' },
  },
  error: {
    bg: 'rgba(255, 107, 107, 0.15)',
    color: 'coral.600',
    _dark: { bg: 'rgba(255, 107, 107, 0.15)', color: 'coral.300' },
  },
  info: {
    bg: 'rgba(14, 107, 102, 0.12)',
    color: 'brand.500',
    _dark: { bg: 'rgba(26, 158, 151, 0.15)', color: 'brand.300' },
  },
  pending: {
    bg: 'bg.overlay',
    color: 'text.muted',
    _dark: null,
  },
} as const

function StatusIcon({ variant }: { variant: StatusBadgeProps['variant'] }) {
  const size = 10

  switch (variant) {
    case 'success':
      return (
        <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden="true" data-testid="status-icon">
          <path d="M2 5.5L4 7.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'warning':
      return (
        <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden="true" data-testid="status-icon">
          <path d="M5 1.5L9 8.5H1L5 1.5Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" fill="none" />
          <line x1="5" y1="4" x2="5" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <circle cx="5" cy="7.2" r="0.5" fill="currentColor" />
        </svg>
      )
    case 'error':
      return (
        <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden="true" data-testid="status-icon">
          <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
          <path d="M3.5 3.5L6.5 6.5M6.5 3.5L3.5 6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      )
    case 'info':
      return (
        <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden="true" data-testid="status-icon">
          <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
          <line x1="5" y1="4.5" x2="5" y2="7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <circle cx="5" cy="3.2" r="0.5" fill="currentColor" />
        </svg>
      )
    default:
      return null
  }
}

export function StatusBadge({ variant, children, showDot }: StatusBadgeProps) {
  const style = VARIANT_STYLES[variant]
  const isIconVisible = showDot ?? variant !== 'pending'

  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      gap="5px"
      fontSize="0.72rem"
      fontWeight="medium"
      borderRadius="full"
      py="3px"
      px="10px"
      bg={style.bg}
      color={style.color}
      css={style._dark ? { _dark: { bg: style._dark.bg, color: style._dark.color } } : undefined}
    >
      {isIconVisible && <StatusIcon variant={variant} />}
      {children}
    </Box>
  )
}
