'use client'

import { Box, Button, Text, IconButton } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useInstallPrompt } from './use-install-prompt'

export function InstallPrompt() {
  const { isInstallable, isStandalone, isIOS, isDismissed, promptInstall, dismiss } =
    useInstallPrompt()

  const visible = (isInstallable || isIOS) && !isStandalone && !isDismissed

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            padding: '16px',
            pointerEvents: 'auto',
          }}
        >
          <Box
            maxW="480px"
            mx="auto"
            p={4}
            bg="bg.glass"
            backdropFilter="blur(16px)"
            border="1px solid"
            borderColor="border.subtle"
            borderRadius="xl"
            boxShadow="lg"
            display="flex"
            alignItems="flex-start"
            gap={3}
          >
            <Box flex={1}>
              <Text fontFamily="heading" fontSize="lg" color="text.primary" mb={1}>
                Install Aarogya
              </Text>
              {isIOS ? (
                <Text fontSize="sm" color="text.muted" fontWeight="light">
                  Tap the share button, then &quot;Add to Home Screen&quot; to install.
                </Text>
              ) : (
                <>
                  <Text fontSize="sm" color="text.muted" fontWeight="light" mb={3}>
                    Add Aarogya to your home screen for quick access to your health records.
                  </Text>
                  <Box display="flex" gap={2}>
                    <Button
                      size="sm"
                      borderRadius="full"
                      bg="action.primary"
                      color="action.primary.text"
                      onClick={promptInstall}
                    >
                      Install
                    </Button>
                    <Button
                      size="sm"
                      borderRadius="full"
                      variant="ghost"
                      color="text.muted"
                      onClick={dismiss}
                    >
                      Not now
                    </Button>
                  </Box>
                </>
              )}
            </Box>
            <IconButton
              aria-label="Close install prompt"
              size="xs"
              variant="ghost"
              color="text.muted"
              onClick={dismiss}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </IconButton>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
