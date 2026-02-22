'use client'

import { Box, Flex, Heading, Text } from '@chakra-ui/react'

const CONSENT_ITEMS = [
  {
    label: 'Analytics',
    description: 'Allow usage data collection to improve the app',
  },
  {
    label: 'Research',
    description: 'Allow anonymized data for medical research',
  },
  {
    label: 'Marketing',
    description: 'Receive product updates and health tips',
  },
  {
    label: 'Third-party Sharing',
    description: 'Allow data sharing with partner services',
  },
]

export function ConsentsPlaceholder() {
  return (
    <Box>
      <Heading
        as="h2"
        fontFamily="heading"
        fontSize="1.5rem"
        color="text.primary"
        mb="4"
        letterSpacing="-0.01em"
      >
        Data Consents
      </Heading>
      <Box
        bg="bg.glass"
        backdropFilter="blur(20px)"
        borderWidth="1px"
        borderColor="border.subtle"
        borderRadius="2xl"
        boxShadow="glass"
        p="6"
      >
        {CONSENT_ITEMS.map((item, i) => (
          <Flex
            key={item.label}
            align="center"
            justify="space-between"
            py="4"
            borderTopWidth={i > 0 ? '1px' : '0'}
            borderColor="border.subtle"
          >
            <Box flex="1" mr="4">
              <Text fontWeight="medium" fontSize="0.95rem" color="text.primary">
                {item.label}
              </Text>
              <Text fontSize="0.875rem" color="text.muted">
                {item.description}
              </Text>
            </Box>
            <Box
              as="span"
              w="44px"
              h="24px"
              borderRadius="full"
              bg="border.default"
              position="relative"
              flexShrink={0}
              opacity={0.5}
              cursor="not-allowed"
            >
              <Box
                as="span"
                position="absolute"
                top="3px"
                left="3px"
                w="18px"
                h="18px"
                borderRadius="full"
                bg="white"
                boxShadow="0 1px 4px rgba(0,0,0,0.15)"
              />
            </Box>
          </Flex>
        ))}
        <Text fontFamily="mono" fontSize="0.75rem" color="text.muted" mt="2">
          Coming soon
        </Text>
      </Box>
    </Box>
  )
}
