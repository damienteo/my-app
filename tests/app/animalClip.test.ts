import fs from 'fs'
import path from 'path'

import en from '../../messages/en.json'
import jp from '../../messages/jp.json'
import { animalClips } from '../../src/app/[locale]/animals/clips'
import {
  clipControlLabel,
  wrapClipIndex,
} from '../../src/app/[locale]/animals/clipLogic'

const english = { play: 'Play {name}', pause: 'Pause {name}' }
const japanese = { play: '{name}を再生', pause: '{name}を一時停止' }

describe('clipControlLabel', () => {
  it('asks to play while the clip is paused', () => {
    expect(clipControlLabel('Nara deer', false, english)).toBe('Play Nara deer')
  })

  it('asks to pause while the clip is playing', () => {
    expect(clipControlLabel('Nara deer', true, english)).toBe('Pause Nara deer')
  })

  it('keeps the message word order, so Japanese can put the verb last', () => {
    expect(clipControlLabel('奈良の鹿', false, japanese)).toBe('奈良の鹿を再生')
    expect(clipControlLabel('奈良の鹿', true, japanese)).toBe(
      '奈良の鹿を一時停止'
    )
  })
})

describe('wrapClipIndex', () => {
  it('steps forward and back inside the list', () => {
    expect(wrapClipIndex(3, 1, 24)).toBe(4)
    expect(wrapClipIndex(3, -1, 24)).toBe(2)
  })

  it('wraps the last clip around to the first', () => {
    expect(wrapClipIndex(23, 1, 24)).toBe(0)
  })

  it('wraps the first clip around to the last', () => {
    expect(wrapClipIndex(0, -1, 24)).toBe(23)
  })

  it('wraps a jump larger than the list', () => {
    expect(wrapClipIndex(0, 25, 24)).toBe(1)
    expect(wrapClipIndex(1, -49, 24)).toBe(0)
  })

  it('stays on the only clip when the list has one item', () => {
    expect(wrapClipIndex(0, 1, 1)).toBe(0)
    expect(wrapClipIndex(0, -1, 1)).toBe(0)
  })

  it('returns 0 when there are no clips', () => {
    expect(wrapClipIndex(0, 1, 0)).toBe(0)
  })
})

describe('animal clip names', () => {
  const enNames = en.AnimalsPage.names as Record<string, string>
  const jpNames = jp.AnimalsPage.names as Record<string, string>

  it('names every clip in English and Japanese', () => {
    expect(animalClips).toHaveLength(24)
    for (const clip of animalClips) {
      expect(enNames[clip.name]?.trim()).toBeTruthy()
      expect(jpNames[clip.name]?.trim()).toBeTruthy()
      expect(enNames[clip.name]).not.toBe(clip.name)
      expect(jpNames[clip.name]).not.toBe(enNames[clip.name])
    }
  })

  it('uses the play and pause templates next-intl fills with the name', () => {
    expect(en.AnimalsPage.play).toContain('{name}')
    expect(en.AnimalsPage.pause).toContain('{name}')
    expect(jp.AnimalsPage.play).toContain('{name}')
    expect(jp.AnimalsPage.pause).toContain('{name}')
    expect(en.AnimalsPage.counter).toBe('{current} / {total}')
  })

  it('renames the misspelled dolphin files and drops the old slug', () => {
    const dir = path.join(__dirname, '../../public/animals')
    expect(fs.existsSync(path.join(dir, 'dolphin.mp4'))).toBe(true)
    expect(fs.existsSync(path.join(dir, 'dolphin.jpg'))).toBe(true)
    expect(fs.existsSync(path.join(dir, 'dolphine.mp4'))).toBe(false)
    expect(fs.existsSync(path.join(dir, 'dolphine.jpg'))).toBe(false)
    expect(animalClips.map((clip) => clip.name)).toContain('dolphin')
    expect('dolphine' in enNames).toBe(false)
    expect('dolphine' in jpNames).toBe(false)
  })
})
