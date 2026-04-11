import type { Language } from '../../src/i18n'
import { VOCABULARY_BY_LANGUAGE } from '../../src/i18n/translations'

const LANGUAGES: Language[] = ['en', 'ru']

describe.each(LANGUAGES)('vocabulary seed data (%s)', language => {
  const categories = VOCABULARY_BY_LANGUAGE[language]

  it('has 27 vocabulary categories', () => {
    expect(categories).toHaveLength(27)
  })

  it('all categories are linked to tact section', () => {
    for (const category of categories) {
      expect(category.sectionId).toBe('tact')
    }
  })

  it('has unique category IDs', () => {
    const ids = categories.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has non-empty name for every category', () => {
    for (const category of categories) {
      expect(category.name).toBeTruthy()
    }
  })

  it('has non-empty word arrays at all difficulty levels', () => {
    for (const category of categories) {
      expect(category.words.simple.length).toBeGreaterThan(0)
      expect(category.words.medium.length).toBeGreaterThan(0)
      expect(category.words.complex.length).toBeGreaterThan(0)
    }
  })
})

describe('vocabulary consistency across languages', () => {
  it('has the same category IDs in both languages', () => {
    const enIds = VOCABULARY_BY_LANGUAGE.en.map(c => c.id)
    const ruIds = VOCABULARY_BY_LANGUAGE.ru.map(c => c.id)
    expect(enIds).toEqual(ruIds)
  })

  it('has the same word counts per difficulty per category', () => {
    const enCategories = VOCABULARY_BY_LANGUAGE.en
    const ruCategories = VOCABULARY_BY_LANGUAGE.ru

    for (const [i, en] of enCategories.entries()) {
      const ru = ruCategories[i]
      expect(en.words.simple.length).toBe(ru.words.simple.length)
      expect(en.words.medium.length).toBe(ru.words.medium.length)
      expect(en.words.complex.length).toBe(ru.words.complex.length)
    }
  })
})
