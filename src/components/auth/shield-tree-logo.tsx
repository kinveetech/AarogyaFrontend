'use client'

import { Box, Text } from '@chakra-ui/react'
import { useTheme } from 'next-themes'

export interface ShieldTreeLogoProps {
  size?: number
  showWordmark?: boolean
}

export function ShieldTreeLogo({ size = 80, showWordmark = true }: ShieldTreeLogoProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const shieldGradientStart = isDark ? '#1A9E97' : '#0E6B66'
  const shieldGradientEnd = isDark ? '#0E6B66' : '#0A4D4A'

  const canopyColors = isDark
    ? { start: 'rgba(168,213,174,0.5)', end: 'rgba(26,158,151,0.3)' }
    : { start: '#A8D5AE', mid: '#7FB285', end: '#0E6B66' }

  const strokeColor = isDark ? 'rgba(255,255,255,0.4)' : '#FFF8F0'
  const rootOpacity = isDark ? 0.15 : 0.25
  const branchOpacity = isDark ? 0.2 : 0.3

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="stl-shield" x1="20" y1="4" x2="60" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={shieldGradientStart} />
            <stop offset="100%" stopColor={shieldGradientEnd} />
          </linearGradient>
          <linearGradient id="stl-canopy" x1="24" y1="14" x2="56" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={canopyColors.start} />
            {'mid' in canopyColors && (
              <stop offset="50%" stopColor={canopyColors.mid} />
            )}
            <stop offset="100%" stopColor={canopyColors.end} />
          </linearGradient>
        </defs>

        {/* Shield */}
        <path
          d="M40 4 C22 4 10 10 10 10 L10 36 C10 56 24 70 40 76 C56 70 70 56 70 36 L70 10 C70 10 58 4 40 4Z"
          fill="url(#stl-shield)"
          opacity={0.9}
        />
        {/* Shield inner highlight */}
        <path
          d="M40 10 C26 10 16 14 16 14 L16 36 C16 52 27 64 40 70 C53 64 64 52 64 36 L64 14 C64 14 54 10 40 10Z"
          fill={isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'}
        />

        {/* Trunk */}
        <path
          d="M40 66 L40 44"
          stroke={strokeColor}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* Roots */}
        <path d="M40 66 C36 68 30 69 28 68" stroke={strokeColor} strokeWidth={1.2} strokeLinecap="round" opacity={rootOpacity} />
        <path d="M40 66 C44 68 50 69 52 68" stroke={strokeColor} strokeWidth={1.2} strokeLinecap="round" opacity={rootOpacity} />
        <path d="M40 66 C38 69 36 71 34 71" stroke={strokeColor} strokeWidth={1} strokeLinecap="round" opacity={rootOpacity * 0.8} />
        <path d="M40 66 C42 69 44 71 46 71" stroke={strokeColor} strokeWidth={1} strokeLinecap="round" opacity={rootOpacity * 0.8} />

        {/* Branches */}
        <path d="M40 48 C34 44 28 42 24 42" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" opacity={branchOpacity} />
        <path d="M40 48 C46 44 52 42 56 42" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" opacity={branchOpacity} />
        <path d="M40 44 C36 40 32 36 30 34" stroke={strokeColor} strokeWidth={1.2} strokeLinecap="round" opacity={branchOpacity * 0.85} />
        <path d="M40 44 C44 40 48 36 50 34" stroke={strokeColor} strokeWidth={1.2} strokeLinecap="round" opacity={branchOpacity * 0.85} />

        {/* Canopy layers */}
        <ellipse cx={40} cy={36} rx={22} ry={16} fill="url(#stl-canopy)" opacity={isDark ? 0.5 : 0.45} />
        <ellipse cx={40} cy={32} rx={17} ry={13} fill={isDark ? 'rgba(168,213,174,0.2)' : '#7FB285'} opacity={isDark ? 1 : 0.4} />
        <ellipse cx={40} cy={27} rx={12} ry={10} fill={isDark ? 'rgba(168,213,174,0.15)' : '#A8D5AE'} opacity={isDark ? 1 : 0.35} />
        <ellipse cx={40} cy={22} rx={7} ry={6} fill={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)'} />

        {/* Ground glow */}
        <ellipse cx={40} cy={68} rx={12} ry={2.5} fill="#FFB347" opacity={isDark ? 0.25 : 0.3} />
      </svg>

      {showWordmark && (
        <Box textAlign="center">
          <Text
            fontFamily="heading"
            fontSize="2xl"
            lineHeight={1}
            color="text.primary"
          >
            Aarogya
          </Text>
          <Text
            fontWeight="light"
            fontSize="2xs"
            letterSpacing="0.15em"
            textTransform="uppercase"
            color="text.secondary"
            mt={1}
          >
            Your Health, Our Priority
          </Text>
        </Box>
      )}
    </Box>
  )
}
