import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'

export const alt = 'Damien Teo'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

const NOTO_SANS_JP_WOFF =
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-jp@5.2.8/japanese-400-normal.woff'

async function loadNotoSansJp(): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(NOTO_SANS_JP_WOFF)
    if (!response.ok) {
      return null
    }
    return response.arrayBuffer()
  } catch {
    return null
  }
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  const title = t('siteName')
  const noto = locale === 'jp' ? await loadNotoSansJp() : null
  const displayTitle = noto || locale !== 'jp' ? title : 'Damien Teo'

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0A0A0B',
        color: '#FAFAFA',
        padding: 72,
        fontFamily: noto ? 'Noto Sans JP' : 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: 64,
          height: 8,
          background: '#1761FF',
        }}
      />
      <div
        style={{
          display: 'flex',
          fontSize: 72,
          fontWeight: 600,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
        }}
      >
        {displayTitle}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 28,
          color: '#A1A1AA',
        }}
      >
        www.damienteo.com
      </div>
    </div>,
    {
      ...size,
      fonts: noto
        ? [
            {
              name: 'Noto Sans JP',
              data: noto,
              style: 'normal',
              weight: 400,
            },
          ]
        : undefined,
    }
  )
}
