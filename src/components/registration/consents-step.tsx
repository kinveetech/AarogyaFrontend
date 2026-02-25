'use client'

import { Box, Flex, Text } from '@chakra-ui/react'
import { CONSENT_CATALOG } from './registration-constants'

interface ConsentState {
  purpose: string
  isGranted: boolean
}

interface ConsentsStepProps {
  consents: ConsentState[]
  onChange: (consents: ConsentState[]) => void
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function ConsentsStep({ consents, onChange }: ConsentsStepProps) {
  const toggleConsent = (purpose: string) => {
    const item = CONSENT_CATALOG.find((c) => c.purpose === purpose)
    if (item?.required) return

    const updated = consents.map((c) =>
      c.purpose === purpose ? { ...c, isGranted: !c.isGranted } : c,
    )
    onChange(updated)
  }

  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" color="text.primary" mb="2">
        Consent preferences
      </Text>
      <Text fontSize="sm" color="text.muted" mb="6">
        Review and grant consent for how your data is used. Required consents cannot be
        declined.
      </Text>

      <Flex direction="column" gap="3">
        {CONSENT_CATALOG.map((item) => {
          const consent = consents.find((c) => c.purpose === item.purpose)
          const isGranted = consent?.isGranted ?? false

          return (
            <button
              key={item.purpose}
              type="button"
              onClick={() => toggleConsent(item.purpose)}
              style={{
                all: 'unset',
                width: '100%',
                cursor: item.required ? 'default' : 'pointer',
              }}
            >
              <Box
                w="full"
                p="4"
                bg="bg.glass"
                border="1px solid"
                borderColor={isGranted ? 'action.primary' : 'border.subtle'}
                borderRadius="xl"
                transition="all 0.2s ease"
                _hover={
                  item.required
                    ? undefined
                    : { borderColor: isGranted ? 'action.primary' : 'border.default' }
                }
                textAlign="left"
              >
                <Flex align="flex-start" gap="3">
                  <Flex
                    align="center"
                    justify="center"
                    boxSize="22px"
                    borderRadius="md"
                    border="2px solid"
                    borderColor={isGranted ? 'action.primary' : 'border.default'}
                    bg={isGranted ? 'action.primary' : 'transparent'}
                    color={isGranted ? 'action.primary.text' : 'transparent'}
                    flexShrink={0}
                    mt="1px"
                    transition="all 0.15s ease"
                  >
                    {isGranted && <CheckIcon />}
                  </Flex>
                  <Box flex="1">
                    <Flex align="center" gap="2">
                      <Text fontWeight="medium" fontSize="sm" color="text.primary">
                        {item.label}
                      </Text>
                      {item.required && (
                        <Text
                          fontSize="xs"
                          color="status.error"
                          fontWeight="medium"
                        >
                          Required
                        </Text>
                      )}
                    </Flex>
                    <Text fontSize="xs" color="text.muted" mt="1" lineHeight="tall">
                      {item.description}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </button>
          )
        })}
      </Flex>
    </Box>
  )
}
