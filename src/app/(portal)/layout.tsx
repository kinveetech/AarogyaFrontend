'use client'

import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { TopBar } from '@/components/portal/top-bar'
import { Sidebar, SIDEBAR_EXPANDED, SIDEBAR_COLLAPSED } from '@/components/portal/sidebar'
import { BottomNav } from '@/components/portal/bottom-nav'

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [collapsed, setCollapsed] = useState(false)
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

  return (
    <>
      <TopBar onMenuToggle={() => setCollapsed((c) => !c)} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <Box
        as="main"
        ml={{ base: 0, md: `${sidebarWidth}px` }}
        pt="56px"
        pb={{ base: '80px', md: 0 }}
        p={{ base: 4, md: 6 }}
        transition="margin-left 0.2s cubic-bezier(0.4,0,0.2,1)"
        minHeight="100vh"
      >
        {children}
      </Box>
      <BottomNav />
    </>
  )
}
