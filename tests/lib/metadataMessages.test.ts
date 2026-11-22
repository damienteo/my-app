import en from '../../messages/en.json'
import jp from '../../messages/jp.json'

const metadataPages = [
  'home',
  'about',
  'portfolio',
  'dailyChecks',
  'cpfForecast',
  'animals',
  'notFound',
] as const

describe('Metadata messages', () => {
  it('has the same Metadata keys in English and Japanese', () => {
    expect(Object.keys(jp.Metadata).sort()).toEqual(
      Object.keys(en.Metadata).sort()
    )
  })

  it('gives every page a title and description in both locales', () => {
    for (const page of metadataPages) {
      expect(en.Metadata[page].title.length).toBeGreaterThan(0)
      expect(en.Metadata[page].description.length).toBeGreaterThan(0)
      expect(jp.Metadata[page].title.length).toBeGreaterThan(0)
      expect(jp.Metadata[page].description.length).toBeGreaterThan(0)
    }
  })

  it('fixes the home description grammar without dropping peasant', () => {
    expect(en.Metadata.home.description).toContain('he works')
    expect(en.Metadata.home.description).not.toContain('he work ')
    expect(en.Metadata.home.description).toContain('peasant')
    expect(en.Metadata.about.description).toBe(en.Metadata.home.description)
  })
})
