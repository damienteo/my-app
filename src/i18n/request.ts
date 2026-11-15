import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { locale as localeParam } from 'next/root-params'
import { routing } from './routing'

export default getRequestConfig(async ({ locale }) => {
  // `next/root-params` reads the `[locale]` segment without calling
  // `headers()`, so pages can be statically rendered. `setRequestLocale`
  // is the older workaround and is deprecated in next-intl 4.
  // An explicit locale (route handlers / server actions) still wins.
  if (!locale) {
    const requested = await localeParam()
    locale = hasLocale(routing.locales, requested)
      ? requested
      : routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
