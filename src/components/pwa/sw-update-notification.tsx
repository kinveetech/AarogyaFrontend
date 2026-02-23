'use client'

import { Box, Button, Text } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSwRegistration } from './use-sw-registration'

export function SwUpdateNotification() {
  const { isUpdateAvailable, applyUpdate } = useSwRegistration()

  return (
    <AnimatePresence>
      {isUpdateAvailable && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1001,
            pointerEvents: 'auto',
          }}
        >
          <Box
            p={3}
            px={5}
            bg="bg.glass"
            backdropFilter="blur(16px)"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="full"
            boxShadow="lg"
            display="flex"
            alignItems="center"
            gap={3}
          >
            <Text fontSize="sm" color="text.primary" fontWeight="medium" whiteSpace="nowrap">
              A new version is available
            </Text>
            <Button
              size="xs"
              borderRadius="full"
              bg="action.primary"
              color="action.primary.text"
              onClick={applyUpdate}
            >
              Update
            </Button>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
