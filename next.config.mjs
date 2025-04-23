/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
