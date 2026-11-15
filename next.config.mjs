/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin'
import bundleAnalyzer from '@next/bundle-analyzer'

const nextConfig = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
}

const withNextIntl = createNextIntlPlugin()

// `@next/bundle-analyzer` hooks Webpack. Production `next build` on
// Next.js 16 uses Turbopack, so this stays inert unless you run
// `npm run analyze` (which passes `--webpack`). For the Turbopack graph
// that production actually ships, use `npx next analyze`.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
})

export default withBundleAnalyzer(withNextIntl(nextConfig))
