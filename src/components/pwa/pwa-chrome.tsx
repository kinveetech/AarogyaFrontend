'use client'

import { usePathname } from 'next/navigation'
import { InstallPrompt } from './install-prompt'
import { SwUpdateNotification } from './sw-update-notification'

/** Pre-sign-in routes where interruptive app chrome would clutter first impressions */
const SUPPRESSED_ROUTES = ['/login', '/callback', '/register']

export function PwaChrome() {
  const pathname = usePathname()

  // Hide the chrome on auth routes but keep both components mounted: the
  // browser fires beforeinstallprompt only once, so the listener must be
  // registered even while the banner is suppressed
  const hidden = SUPPRESSED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )

  return (
    <>
      <InstallPrompt hidden={hidden} />
      <SwUpdateNotification hidden={hidden} />
    </>
  )
}
