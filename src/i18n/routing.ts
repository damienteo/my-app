import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'jp'],

  // Used when no locale matches
  defaultLocale: 'en',

  // HTML <link rel="alternate"> is the source of truth. The middleware
  // Link header would emit hreflang="jp", which is not a valid BCP 47 tag.
  alternateLinks: false,
})
