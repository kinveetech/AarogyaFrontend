'use client'

import { Box, Flex, Heading, Text } from '@chakra-ui/react'

const NOTIFICATION_ITEMS = [
  { label: 'Push notifications' },
  { label: 'Email notifications' },
  { label: 'SMS notifications' },
]

export function NotificationsPlaceholder() {
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
        Notifications
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
        {NOTIFICATION_ITEMS.map((item, i) => (
          <Flex
            key={item.label}
            align="center"
            justify="space-between"
            py="4"
            borderTopWidth={i > 0 ? '1px' : '0'}
            borderColor="border.subtle"
          >
            <Text fontWeight="medium" fontSize="0.95rem" color="text.primary">
              {item.label}
            </Text>
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
