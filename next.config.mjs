import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const serverActionAllowedOrigins = [
  'localhost:3000',
  '*.euw.devtunnels.ms',
  ...(process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS
    ? process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : []),
]

const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: serverActionAllowedOrigins,
    },
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
