/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig
