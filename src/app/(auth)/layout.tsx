import { Box } from '@chakra-ui/react'

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" px={4}>
      {children}
    </Box>
  )
}
