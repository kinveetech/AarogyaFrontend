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
    dotColor: 'sage.400',
    _dark: { bg: 'rgba(157, 197, 161, 0.15)', color: 'sage.300' },
  },
  warning: {
    bg: 'rgba(255, 179, 71, 0.15)',
    color: 'amber.400',
    dotColor: 'amber.300',
    _dark: { bg: 'rgba(255, 179, 71, 0.15)', color: 'amber.200' },
  },
  error: {
    bg: 'rgba(255, 107, 107, 0.15)',
    color: 'coral.400',
    dotColor: 'coral.400',
    _dark: { bg: 'rgba(255, 107, 107, 0.15)', color: 'coral.300' },
  },
  info: {
    bg: 'rgba(14, 107, 102, 0.12)',
    color: 'brand.500',
    dotColor: 'brand.400',
    _dark: { bg: 'rgba(26, 158, 151, 0.15)', color: 'brand.300' },
  },
  pending: {
    bg: 'bg.overlay',
    color: 'text.muted',
    dotColor: '',
    _dark: null,
  },
} as const

export function StatusBadge({ variant, children, showDot }: StatusBadgeProps) {
  const style = VARIANT_STYLES[variant]
  const isDotVisible = showDot ?? variant !== 'pending'

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
      {isDotVisible && (
        <Box
          as="span"
          boxSize="5px"
          borderRadius="full"
          bg={style.dotColor}
          flexShrink={0}
          data-testid="status-dot"
        />
      )}
      {children}
    </Box>
  )
}
