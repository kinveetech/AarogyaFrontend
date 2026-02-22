'use client'

import { Box } from '@chakra-ui/react'

const floatKeyframes = {
  '0%, 100%': { transform: 'translate(0, 0)' },
  '33%': { transform: 'translate(10px, -15px)' },
  '66%': { transform: 'translate(-8px, 10px)' },
}

const orbBase = {
  position: 'absolute' as const,
  borderRadius: '50%',
  filter: 'blur(80px)',
  opacity: 0.5,
}

export function AmbientOrbs() {
  return (
    <Box
      position="fixed"
      inset="0"
      pointerEvents="none"
      zIndex="0"
      overflow="hidden"
      aria-hidden="true"
    >
      <Box
        {...orbBase}
        bg="orb.primary"
        width="400px"
        height="400px"
        top="-5%"
        right="10%"
        animation="float-1 20s ease-in-out infinite"
        css={{
          '@keyframes float-1': floatKeyframes,
          animationName: 'float-1',
        }}
      />
      <Box
        {...orbBase}
        bg="orb.secondary"
        width="350px"
        height="350px"
        bottom="10%"
        left="-5%"
        animation="float-2 25s ease-in-out infinite"
        css={{
          '@keyframes float-2': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '33%': { transform: 'translate(15px, 10px)' },
            '66%': { transform: 'translate(-10px, -12px)' },
          },
          animationName: 'float-2',
        }}
      />
      <Box
        {...orbBase}
        bg="orb.tertiary"
        width="300px"
        height="300px"
        top="40%"
        left="50%"
        animation="float-3 22s ease-in-out infinite"
        css={{
          '@keyframes float-3': {
            '0%, 100%': { transform: 'translate(0, 0)' },
            '33%': { transform: 'translate(-12px, 8px)' },
            '66%': { transform: 'translate(8px, -10px)' },
          },
          animationName: 'float-3',
        }}
      />
    </Box>
  )
}
