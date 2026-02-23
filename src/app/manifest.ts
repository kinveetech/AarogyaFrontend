import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aarogya',
    short_name: 'Aarogya',
    description: 'Your health records, simplified.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    theme_color: '#0A4D4A',
    background_color: '#FFF8F0',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
