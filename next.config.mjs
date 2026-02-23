import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // pdfjs-dist optionally depends on canvas (node-only); alias to false for the browser bundle
  turbopack: {
    resolveAlias: {
      canvas: { browser: '' },
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
        ],
      },
    ]
  },
}

export default withSerwist(nextConfig)
