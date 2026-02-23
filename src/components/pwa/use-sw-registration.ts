'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000 // 60 minutes

export function useSwRegistration() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    let intervalId: ReturnType<typeof setInterval>

    navigator.serviceWorker.ready.then((registration) => {
      registrationRef.current = registration
      setIsRegistered(true)

      // Listen for new service worker installing
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setIsUpdateAvailable(true)
          }
        })
      })

      // Periodic update check
      intervalId = setInterval(() => {
        registration.update().catch(() => {
          // Silently ignore update check errors (e.g. offline)
        })
      }, UPDATE_CHECK_INTERVAL_MS)
    })

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const applyUpdate = useCallback(() => {
    const registration = registrationRef.current
    if (!registration?.waiting) return

    registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // Reload once the new SW takes over
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }, [])

  return {
    isRegistered,
    isUpdateAvailable,
    applyUpdate,
  }
}
