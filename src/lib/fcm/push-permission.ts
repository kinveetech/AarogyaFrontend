export type PushPermissionResult =
  | { status: 'granted'; token: string }
  | { status: 'denied' }
  | { status: 'unsupported' }
  | { status: 'error'; error: unknown }

export async function requestPushPermission(): Promise<PushPermissionResult> {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') {
    return { status: 'unsupported' }
  }

  if (Notification.permission === 'denied') {
    return { status: 'denied' }
  }

  try {
    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      return { status: 'denied' }
    }

    const { getMessaging, getToken } = await import('firebase/messaging')
    const { getApp, getApps, initializeApp } = await import('firebase/app')

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
    const messaging = getMessaging(app)
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })

    return { status: 'granted', token }
  } catch (error) {
    return { status: 'error', error }
  }
}
