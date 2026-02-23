import { Box } from '@chakra-ui/react'

export function SkipLink() {
  return (
    <Box
      asChild
      position="fixed"
      top="-100px"
      left="4"
      zIndex="9999"
      bg="action.primary"
      color="action.primary.text"
      px="4"
      py="2"
      borderRadius="md"
      fontWeight="semibold"
      fontSize="sm"
      _focus={{
        top: '4',
        outline: '2px solid',
        outlineColor: 'action.primary',
        outlineOffset: '2px',
      }}
      transition="top 0.15s ease"
    >
      <a href="#main-content">Skip to main content</a>
    </Box>
  )
}
