import { clipControlLabel } from '../../src/app/[locale]/animals/AnimalClip'

describe('clipControlLabel', () => {
  it('asks to play while the clip is paused', () => {
    expect(clipControlLabel('adult-goats', false)).toBe('Play adult-goats')
  })

  it('asks to pause while the clip is playing', () => {
    expect(clipControlLabel('adult-goats', true)).toBe('Pause adult-goats')
  })
})
