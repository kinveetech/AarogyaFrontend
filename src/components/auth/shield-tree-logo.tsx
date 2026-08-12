'use client'

import { Box, Text } from '@chakra-ui/react'

export interface ShieldTreeLogoProps {
  size?: number
  showWordmark?: boolean
}

/*
 * Theming is CSS-variable driven (light values with `_dark` overrides) instead of
 * branching on next-themes' resolvedTheme: the server always renders light while a
 * dark-mode client resolves dark on its first render, and any markup difference
 * between the two breaks hydration (React #418) and drops the user's first click.
 */
const themeVars = {
  '--stl-shield-start': '#0E6B66',
  '--stl-shield-end': '#0A4D4A',
  '--stl-canopy-start': '#A8D5AE',
  '--stl-canopy-mid': '#7FB285',
  '--stl-canopy-end': '#0E6B66',
  '--stl-stroke': '#FFF8F0',
  '--stl-highlight': 'rgba(255,255,255,0.07)',
  '--stl-root-opacity': '0.25',
  '--stl-branch-opacity': '0.3',
  '--stl-canopy1-opacity': '0.45',
  '--stl-canopy2-fill': 'rgba(127,178,133,0.4)',
  '--stl-canopy3-fill': 'rgba(168,213,174,0.35)',
  '--stl-canopy4-fill': 'rgba(255,255,255,0.15)',
  '--stl-glow-opacity': '0.3',
  _dark: {
    '--stl-shield-start': '#1A9E97',
    '--stl-shield-end': '#0E6B66',
    '--stl-canopy-start': 'rgba(168,213,174,0.5)',
    '--stl-canopy-mid': 'rgba(131,186,161,0.4)',
    '--stl-canopy-end': 'rgba(26,158,151,0.3)',
    '--stl-stroke': 'rgba(255,255,255,0.4)',
    '--stl-highlight': 'rgba(255,255,255,0.04)',
    '--stl-root-opacity': '0.15',
    '--stl-branch-opacity': '0.2',
    '--stl-canopy1-opacity': '0.5',
    '--stl-canopy2-fill': 'rgba(168,213,174,0.2)',
    '--stl-canopy3-fill': 'rgba(168,213,174,0.15)',
    '--stl-canopy4-fill': 'rgba(255,255,255,0.08)',
    '--stl-glow-opacity': '0.25',
  },
} as const

export function ShieldTreeLogo({ size = 80, showWordmark = true }: ShieldTreeLogoProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={3}
      css={themeVars}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="stl-shield" x1="20" y1="4" x2="60" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" style={{ stopColor: 'var(--stl-shield-start)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--stl-shield-end)' }} />
          </linearGradient>
          <linearGradient id="stl-canopy" x1="24" y1="14" x2="56" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" style={{ stopColor: 'var(--stl-canopy-start)' }} />
            <stop offset="50%" style={{ stopColor: 'var(--stl-canopy-mid)' }} />
            <stop offset="100%" style={{ stopColor: 'var(--stl-canopy-end)' }} />
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
          style={{ fill: 'var(--stl-highlight)' }}
        />

        {/* Trunk */}
        <path
          d="M40 66 L40 44"
          style={{ stroke: 'var(--stl-stroke)' }}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* Roots */}
        <g style={{ opacity: 'var(--stl-root-opacity)' }}>
          <path d="M40 66 C36 68 30 69 28 68" style={{ stroke: 'var(--stl-stroke)' }} strokeWidth={1.2} strokeLinecap="round" />
          <path d="M40 66 C44 68 50 69 52 68" style={{ stroke: 'var(--stl-stroke)' }} strokeWidth={1.2} strokeLinecap="round" />
          <path d="M40 66 C38 69 36 71 34 71" style={{ stroke: 'var(--stl-stroke)' }} strokeWidth={1} strokeLinecap="round" opacity={0.8} />
          <path d="M40 66 C42 69 44 71 46 71" style={{ stroke: 'var(--stl-stroke)' }} strokeWidth={1} strokeLinecap="round" opacity={0.8} />
        </g>

        {/* Branches */}
        <g style={{ opacity: 'var(--stl-branch-opacity)' }}>
          <path d="M40 48 C34 44 28 42 24 42" style={{ stroke: 'var(--stl-stroke)' }} strokeWidth={1.5} strokeLinecap="round" />
          <path d="M40 48 C46 44 52 42 56 42" style={{ stroke: 'var(--stl-stroke)' }} strokeWidth={1.5} strokeLinecap="round" />
          <path d="M40 44 C36 40 32 36 30 34" style={{ stroke: 'var(--stl-stroke)' }} strokeWidth={1.2} strokeLinecap="round" opacity={0.85} />
          <path d="M40 44 C44 40 48 36 50 34" style={{ stroke: 'var(--stl-stroke)' }} strokeWidth={1.2} strokeLinecap="round" opacity={0.85} />
        </g>

        {/* Canopy layers */}
        <ellipse cx={40} cy={36} rx={22} ry={16} fill="url(#stl-canopy)" style={{ opacity: 'var(--stl-canopy1-opacity)' }} />
        <ellipse cx={40} cy={32} rx={17} ry={13} style={{ fill: 'var(--stl-canopy2-fill)' }} />
        <ellipse cx={40} cy={27} rx={12} ry={10} style={{ fill: 'var(--stl-canopy3-fill)' }} />
        <ellipse cx={40} cy={22} rx={7} ry={6} style={{ fill: 'var(--stl-canopy4-fill)' }} />

        {/* Ground glow */}
        <ellipse cx={40} cy={68} rx={12} ry={2.5} fill="#FFB347" style={{ opacity: 'var(--stl-glow-opacity)' }} />
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
