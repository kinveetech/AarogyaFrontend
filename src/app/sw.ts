import { defaultCache } from '@serwist/next/worker'
import {
  Serwist,
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
  ExpirationPlugin,
  CacheableResponsePlugin,
  type PrecacheEntry,
  type RuntimeCaching,
} from 'serwist'

declare const self: {
  __SW_MANIFEST: (PrecacheEntry | string)[]
}

const runtimeCaching: RuntimeCaching[] = [
  // API routes — network first with 10s timeout
  {
    matcher: /\/(api|v1)\/.*/i,
    handler: new NetworkFirst({
      cacheName: 'api-cache',
      networkTimeoutSeconds: 10,
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 60 * 60 }),
      ],
    }),
  },
  // Static assets — cache first
  {
    matcher: /\.(?:js|css|woff2?)$/i,
    handler: new CacheFirst({
      cacheName: 'static-assets',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      ],
    }),
  },
  // Images — stale while revalidate
  {
    matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
    handler: new StaleWhileRevalidate({
      cacheName: 'image-cache',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      ],
    }),
  },
  // Everything else — Serwist defaults
  ...defaultCache,
]

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document'
        },
      },
    ],
  },
})

serwist.addEventListeners()
