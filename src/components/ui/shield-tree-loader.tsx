'use client'

import { useId } from 'react'
import { Box, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

export interface ShieldTreeLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'inline' | 'fullPage'
  showProgress?: boolean
  showBrandText?: boolean
}

const SIZE_MAP = { sm: 80, md: 160, lg: 240 } as const

/*
 * Theming is CSS-variable driven (light values with `_dark` overrides) instead of
 * branching on next-themes' resolvedTheme: the server always renders light while a
 * dark-mode client resolves dark on its first render, and any markup difference
 * between the two breaks hydration (React #418). Framer-motion animation targets
 * stay theme-independent; the themed factor lives in group opacities and fill alphas.
 */
const themeVars = {
  '--stl-shield-start': '#0E6B66',
  '--stl-shield-end': '#0A4D4A',
  '--stl-shield-stroke': '#0E6B66',
  '--stl-canopy-start': '#A8D5AE',
  '--stl-canopy-mid': '#7FB285',
  '--stl-canopy-end': '#0E6B66',
  '--stl-stroke': '#FFF8F0',
  '--stl-root-opacity': '0.3',
  '--stl-branch-opacity': '0.35',
  '--stl-canopy2-fill': 'rgba(127,178,133,0.4)',
  '--stl-canopy3-fill': 'rgba(168,213,174,0.35)',
  '--stl-canopy4-fill': 'rgba(255,255,255,0.3)',
  _dark: {
    '--stl-shield-start': '#1A9E97',
    '--stl-shield-end': '#0E6B66',
    '--stl-shield-stroke': '#1A9E97',
    '--stl-canopy-start': 'rgba(168,213,174,0.5)',
    '--stl-canopy-mid': 'rgba(131,186,161,0.4)',
    '--stl-canopy-end': 'rgba(26,158,151,0.3)',
    '--stl-stroke': 'rgba(255,255,255,0.4)',
    '--stl-root-opacity': '0.15',
    '--stl-branch-opacity': '0.2',
    '--stl-canopy2-fill': 'rgba(168,213,174,0.2)',
    '--stl-canopy3-fill': 'rgba(168,213,174,0.15)',
    '--stl-canopy4-fill': 'rgba(255,255,255,0.08)',
  },
} as const

const RIPPLE_COLORS = [
  null,
  { base: '#0E6B66', _dark: '#1A9E97' },
  { base: '#7FB285', _dark: '#A8D5AE' },
  { base: '#FFB347', _dark: '#FFD693' },
] as const

export function ShieldTreeLoader({
  size = 'md',
  variant = 'inline',
  showProgress,
  showBrandText,
}: ShieldTreeLoaderProps) {
  const px = SIZE_MAP[size]

  const shouldShowProgress = showProgress ?? variant === 'fullPage'
  const shouldShowBrandText = showBrandText ?? variant === 'fullPage'

  // useId is hydration-safe (a module counter diverges between server and client,
  // breaking hydration); strip its delimiters, which are invalid inside url(#...)
  const id = `stl-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      role="status"
      aria-label="Loading"
      css={themeVars}
    >
      {/* Tree animation container */}
      <Box position="relative" width={`${px}px`} height={`${px}px`}>
        {/* Ripples */}
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            data-testid="ripple"
            position="absolute"
            top="62%"
            left="50%"
            transform="translate(-50%, -50%)"
            borderRadius="full"
            borderStyle="solid"
            borderWidth="1.5px"
            borderColor={RIPPLE_COLORS[i] ?? undefined}
            opacity={0}
            pointerEvents="none"
            css={{
              animation: `shieldTreeRipple 3.5s ease-out ${1.6 + i * 0.6}s infinite`,
            }}
          />
        ))}

        {/* Tree SVG */}
        <svg
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '80%',
          }}
          viewBox="0 0 80 80"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id={`${id}-shield`}
              x1="20"
              y1="4"
              x2="60"
              y2="76"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" style={{ stopColor: 'var(--stl-shield-start)' }} />
              <stop offset="100%" style={{ stopColor: 'var(--stl-shield-end)' }} />
            </linearGradient>
            <linearGradient
              id={`${id}-canopy`}
              x1="24"
              y1="14"
              x2="56"
              y2="48"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" style={{ stopColor: 'var(--stl-canopy-start)' }} />
              <stop offset="50%" style={{ stopColor: 'var(--stl-canopy-mid)' }} />
              <stop offset="100%" style={{ stopColor: 'var(--stl-canopy-end)' }} />
            </linearGradient>
          </defs>

          {/* Shield */}
          <motion.path
            d="M40 4 C22 4 10 10 10 10 L10 36 C10 56 24 70 40 76 C56 70 70 56 70 36 L70 10 C70 10 58 4 40 4Z"
            fill={`url(#${id}-shield)`}
            style={{ stroke: 'var(--stl-shield-stroke)' }}
            strokeWidth={1}
            initial={{ strokeDasharray: 300, strokeDashoffset: 300, fillOpacity: 0 }}
            animate={{ strokeDashoffset: 0, fillOpacity: 0.9 }}
            transition={{ delay: 0.3, duration: 1.5, ease: 'easeOut' }}
          />

          {/* Seed */}
          <motion.circle
            cx={40}
            cy={66}
            r={3}
            fill="#FFB347"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 1.2,
              duration: 0.8,
              ease: 'easeOut',
              scale: {
                delay: 1.2,
                duration: 0.8,
                type: 'spring',
                stiffness: 300,
                damping: 15,
              },
            }}
          />

          {/* Trunk */}
          <motion.path
            d="M40 66 L40 44"
            style={{ stroke: 'var(--stl-stroke)' }}
            strokeWidth={3}
            strokeLinecap="round"
            initial={{ strokeDasharray: 40, strokeDashoffset: 40, opacity: 0 }}
            animate={{ strokeDashoffset: 0, opacity: 0.5 }}
            transition={{ delay: 1.8, duration: 1.0, ease: 'easeOut' }}
          />

          {/* Roots — the group carries the themed opacity; paths animate to fixed targets */}
          <g data-testid="roots" style={{ opacity: 'var(--stl-root-opacity)' }}>
            {[
              'M40 66 C36 68 30 69 28 68',
              'M40 66 C44 68 50 69 52 68',
              'M40 66 C38 69 36 71 34 71',
              'M40 66 C42 69 44 71 46 71',
            ].map((d, i) => (
              <motion.path
                key={d}
                d={d}
                style={{ stroke: 'var(--stl-stroke)' }}
                strokeWidth={i < 2 ? 1.2 : 1}
                strokeLinecap="round"
                initial={{ strokeDasharray: 30, strokeDashoffset: 30, opacity: 0 }}
                animate={{ strokeDashoffset: 0, opacity: i < 2 ? 1 : 0.8 }}
                transition={{ delay: 2.0 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
              />
            ))}
          </g>

          {/* Branches */}
          <g data-testid="branches" style={{ opacity: 'var(--stl-branch-opacity)' }}>
            {[
              'M40 48 C34 44 28 42 24 42',
              'M40 48 C46 44 52 42 56 42',
              'M40 44 C36 40 32 36 30 34',
              'M40 44 C44 40 48 36 50 34',
            ].map((d, i) => (
              <motion.path
                key={d}
                d={d}
                style={{ stroke: 'var(--stl-stroke)' }}
                strokeWidth={i < 2 ? 1.5 : 1.2}
                strokeLinecap="round"
                initial={{ strokeDasharray: 30, strokeDashoffset: 30, opacity: 0 }}
                animate={{ strokeDashoffset: 0, opacity: i < 2 ? 1 : 0.85 }}
                transition={{ delay: 2.4 + i * 0.1, duration: 0.7, ease: 'easeOut' }}
              />
            ))}
          </g>

          {/* Canopy */}
          <g data-testid="canopy">
            {[
              { cx: 40, cy: 36, rx: 22, ry: 16, fill: `url(#${id}-canopy)`, target: 0.5 },
              { cx: 40, cy: 32, rx: 17, ry: 13, fillVar: '--stl-canopy2-fill', target: 1 },
              { cx: 40, cy: 27, rx: 12, ry: 10, fillVar: '--stl-canopy3-fill', target: 1 },
              { cx: 40, cy: 22, rx: 7, ry: 6, fillVar: '--stl-canopy4-fill', target: 1 },
            ].map((e, i) => (
              <motion.ellipse
                key={i}
                cx={e.cx}
                cy={e.cy}
                rx={e.rx}
                ry={e.ry}
                fill={e.fill}
                style={e.fillVar ? { fill: `var(${e.fillVar})` } : undefined}
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: e.target, scale: 1 }}
                transition={{
                  delay: 2.8 + i * 0.2,
                  duration: 0.8,
                  type: 'spring',
                  stiffness: 200,
                  damping: 12,
                }}
              />
            ))}
          </g>

          {/* Ground glow */}
          <motion.ellipse
            cx={40}
            cy={68}
            rx={12}
            ry={2.5}
            fill="#FFB347"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 3.2, duration: 1.0, ease: 'easeOut' }}
          />
        </svg>
      </Box>

      {/* Brand text */}
      {shouldShowBrandText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.5, duration: 1.2, ease: 'easeOut' }}
        >
          <Text
            fontFamily="heading"
            fontSize="5xl"
            lineHeight={1}
            color="text.primary"
          >
            Aarogya
          </Text>
          <Text
            fontWeight="light"
            fontSize="sm"
            letterSpacing="0.15em"
            textTransform="uppercase"
            color="text.secondary"
            mt={2}
            textAlign="center"
          >
            Your Health, Our Priority
          </Text>
        </motion.div>
      )}

      {/* Progress bar */}
      {shouldShowProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.0, duration: 1.0, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', marginTop: '40px' }}
        >
          <Box
            width="200px"
            height="3px"
            borderRadius="full"
            overflow="hidden"
            bg={{ base: 'rgba(10,77,74,0.1)', _dark: 'rgba(255,255,255,0.08)' }}
          >
            <Box
              height="100%"
              borderRadius="full"
              bg="linear-gradient(90deg, #0E6B66, #7FB285, #FFB347)"
              css={{
                animation: 'shieldTreeProgress 4s ease-in-out 4.3s infinite',
                width: '0%',
              }}
            />
          </Box>
          <Text
            fontWeight="light"
            fontSize="xs"
            letterSpacing="0.1em"
            color="text.muted"
          >
            Growing your wellness journey...
          </Text>
        </motion.div>
      )}

      {/* Global keyframes injected via style tag */}
      <style>{`
        @keyframes shieldTreeRipple {
          0% { width: 40px; height: 40px; opacity: 0.7; border-width: 2px; }
          100% { width: 280px; height: 280px; opacity: 0; border-width: 0.5px; }
        }
        @keyframes shieldTreeProgress {
          0% { width: 0%; }
          20% { width: 25%; }
          50% { width: 55%; }
          70% { width: 72%; }
          90% { width: 90%; }
          100% { width: 100%; }
        }
      `}</style>
    </Box>
  )

  if (variant === 'fullPage') {
    return (
      <Box
        position="fixed"
        inset={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="bg.overlay"
        zIndex={9999}
        backdropFilter="blur(4px)"
      >
        {content}
      </Box>
    )
  }

  return content
}
